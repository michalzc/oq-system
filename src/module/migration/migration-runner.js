import _ from 'lodash-es';
import { log, logError } from '../utils/logger.js';
import { LATEST_MIGRATION_VERSION, pendingMigrations } from './migrations.js';

/** World collections on `game`, migrated with their embedded documents. */
const WORLD_COLLECTIONS = ['actors', 'items', 'scenes', 'journal', 'macros', 'messages'];

/** Document types of world compendia that are migrated. System packs are rebuilt from `src/packs/` instead. */
const PACK_DOCUMENT_TYPES = ['Actor', 'Item', 'Scene', 'JournalEntry', 'Macro'];

/** Updates sent in one request, so a large chat log doesn't go out in a single message. */
const BATCH_SIZE = 100;

const UPDATE_OPTIONS = { render: false };

const replace = (value) => foundry.data.operators.ForcedReplacement.create(value);

/**
 * The embedded collections of a document that are migrated after it, with the document that updates them.
 * @returns {{documentName: string, parent: foundry.abstract.Document, documents: Iterable}[]}
 */
function embeddedCollections(documentName, document) {
  switch (documentName) {
    case 'Actor':
      return [{ documentName: 'Item', parent: document, documents: document.items }];
    case 'Scene':
      return [{ documentName: 'Token', parent: document, documents: document.tokens }];
    case 'JournalEntry':
      return [{ documentName: 'JournalEntryPage', parent: document, documents: document.pages }];
    case 'Token': {
      // Only the items stored in the delta of an unlinked token; the base actor's items are migrated with the actor.
      const items = document.delta?.items;
      if (document.actorLink || !items || !document.actor) return [];
      const deltaItems = items.filter((item) => items.manages(item.id));
      return [{ documentName: 'Item', parent: document.actor, documents: deltaItems }];
    }
    default:
      return [];
  }
}

/**
 * Applies a migration to the documents, then to their embedded documents. A failing document is logged and counted,
 * and the remaining ones are still migrated.
 * @param {import('./migrations.js').Migration} migration
 * @param {string} documentName
 * @param {Iterable<foundry.abstract.Document>} documents
 * @param {function(object[]): Promise} update Writes a batch of changes, each with the `_id` of its document.
 * @param {{migrated: number, failed: number}} report
 */
async function migrateDocuments(migration, documentName, documents, update, report) {
  const migrate = migration.handlers[documentName];
  if (migrate) {
    const updates = [];
    for (const document of documents) {
      try {
        const changes = migrate(document.toObject(), { replace });
        if (!_.isEmpty(changes)) updates.push({ _id: document.id, ...changes });
      } catch (error) {
        logError(`Migration ${migration.version} failed for ${document.uuid}`, error);
        report.failed += 1;
      }
    }
    for (const batch of _.chunk(updates, BATCH_SIZE)) {
      try {
        await update(batch);
        report.migrated += batch.length;
      } catch (error) {
        logError(`Migration ${migration.version} failed to update ${documentName} documents`, batch, error);
        report.failed += batch.length;
      }
    }
  }

  for (const document of documents) {
    for (const embedded of embeddedCollections(documentName, document)) {
      const updateEmbedded = (batch) =>
        embedded.parent.updateEmbeddedDocuments(embedded.documentName, batch, UPDATE_OPTIONS);
      await migrateDocuments(migration, embedded.documentName, embedded.documents, updateEmbedded, report);
    }
  }
}

async function migrateWorldCollections(migration, report) {
  for (const collection of WORLD_COLLECTIONS.map((name) => game[name])) {
    const update = (batch) => collection.documentClass.updateDocuments(batch, UPDATE_OPTIONS);
    await migrateDocuments(migration, collection.documentName, collection, update, report);
  }
}

/** Migrates a world compendium, unlocking it for the migration if needed. */
async function migratePack(migration, pack, report) {
  const locked = pack.locked;
  if (locked) await pack.configure({ locked: false });
  try {
    const documents = await pack.getDocuments();
    const update = (batch) => pack.documentClass.updateDocuments(batch, { ...UPDATE_OPTIONS, pack: pack.collection });
    await migrateDocuments(migration, pack.documentName, documents, update, report);
  } finally {
    if (locked) await pack.configure({ locked: true });
  }
}

async function migratePacks(migration, report) {
  const packs = game.packs.filter(
    (pack) => pack.metadata.packageType === 'world' && PACK_DOCUMENT_TYPES.includes(pack.documentName),
  );
  for (const pack of packs) {
    try {
      await migratePack(migration, pack, report);
    } catch (error) {
      logError(`Migration ${migration.version} failed for compendium ${pack.collection}`, error);
      report.failed += 1;
    }
  }
}

/**
 * Applies the pending data migrations to the world documents and world compendia, storing the version of each one
 * once applied without failures. Runs on the active GM's client only.
 */
export async function migrateWorld() {
  if (!game.users.activeGM?.isSelf) return;

  const settingKey = CONFIG.OQ.SettingsConfig.keys.migrationVersion;
  const currentVersion = game.settings.get(CONFIG.OQ.SYSTEM_ID, settingKey);
  if (currentVersion > LATEST_MIGRATION_VERSION) {
    ui.notifications.warn(game.i18n.format('OQ.Migration.NewerVersion', { version: currentVersion }), {
      permanent: true,
    });
    return;
  }

  const migrations = pendingMigrations(currentVersion);
  if (!migrations.length) return;

  const notification = ui.notifications.warn('OQ.Migration.Begin', { localize: true, permanent: true });
  const report = { migrated: 0, failed: 0 };
  for (const migration of migrations) {
    log(`Applying migration ${migration.version}: ${migration.name}`);
    await migrateWorldCollections(migration, report);
    await migratePacks(migration, report);
    // A failed migration is retried on the next load, and later migrations wait for it: they may rely on its changes.
    if (report.failed) break;
    await game.settings.set(CONFIG.OQ.SYSTEM_ID, settingKey, migration.version);
    log(`Applied migration ${migration.version}`, report);
  }

  ui.notifications.remove(notification);
  if (report.failed) {
    ui.notifications.error(game.i18n.format('OQ.Migration.Failed', { count: report.failed }), { permanent: true });
  } else {
    ui.notifications.info('OQ.Migration.Complete', { localize: true });
  }
}
