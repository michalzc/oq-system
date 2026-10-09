import _ from 'lodash-es';
import { log, logError } from '../utils/logger.js';
import { LATEST_MIGRATION_VERSION, pendingMigrations } from './migrations.js';

/** World collections on `game`, migrated with their embedded documents. */
const WORLD_COLLECTIONS = ['actors', 'items', 'scenes', 'journal', 'macros', 'messages', 'tables'];

/** Document types of world compendia that are migrated. System packs are rebuilt from `src/packs/` instead. */
const PACK_DOCUMENT_TYPES = ['Actor', 'Item', 'Scene', 'JournalEntry', 'Macro', 'RollTable'];

/** Updates sent in one request, so a large chat log doesn't go out in a single message. */
const BATCH_SIZE = 100;

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
    case 'RollTable':
      return [{ documentName: 'TableResult', parent: document, documents: document.results }];
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
 * @typedef {object} MigrationPlan The changes of the pending migrations, applied in memory and waiting to be written.
 * @property {MigrationStep[]} steps
 */

/**
 * @typedef {object} MigrationStep A migration applied in memory, with the writes that store its changes.
 * @property {import('./migrations.js').Migration} migration
 * @property {PendingWrite[]} writes
 * @property {number} failed The documents the migration failed for in memory
 */

/**
 * @typedef {object} PendingWrite
 * @property {string} documentName
 * @property {function(object[], object): Promise<foundry.abstract.Document[]>} update Writes a batch of changes,
 *   each with the `_id` of its document, and returns the documents that were saved. Foundry assigns `parent` and `pack`
 *   to the operation it is given, so each call gets new options.
 * @property {object[]} changes
 */

/**
 * Applies a migration to the documents in memory, then to their embedded documents, and collects the writes that store
 * the changes in the step. A failing document is logged and counted, and the remaining ones are still migrated.
 * @param {MigrationStep} step
 * @param {string} documentName
 * @param {Iterable<foundry.abstract.Document>} documents
 * @param {PendingWrite['update']} update
 */
function applyToDocuments(step, documentName, documents, update) {
  const { migration } = step;
  const migrate = migration.handlers[documentName];
  if (migrate) {
    const changes = [];
    for (const document of documents) {
      try {
        const source = document.toObject();
        const documentChanges = migrate(source, { replace });
        if (_.isEmpty(documentChanges)) continue;
        // Handlers are pure, so the source update gets its own copy of the changes, operators included.
        document.updateSource(migrate(source, { replace }));
        changes.push({ _id: document.id, ...documentChanges });
      } catch (error) {
        logError(`Migration ${migration.version} failed for ${document.uuid}`, error);
        step.failed += 1;
      }
    }
    if (changes.length) step.writes.push({ documentName, update, changes });
  }

  for (const document of documents) {
    for (const embedded of embeddedCollections(documentName, document)) {
      const updateEmbedded = (batch, options) =>
        embedded.parent.updateEmbeddedDocuments(embedded.documentName, batch, options);
      applyToDocuments(step, embedded.documentName, embedded.documents, updateEmbedded);
    }
  }
}

/**
 * Writes the changes already applied in memory. The documents match them now, so the changes are sent as they are
 * instead of being diffed against the document.
 * @param {PendingWrite[]} writes
 * @returns {Promise<{migrated: number, failed: number}>}
 */
async function storeWrites(migration, writes) {
  const report = { migrated: 0, failed: 0 };
  for (const { documentName, update, changes } of writes) {
    for (const batch of _.chunk(changes, BATCH_SIZE)) {
      let documents;
      try {
        documents = await update(batch, { diff: false });
      } catch (error) {
        logError(`Migration ${migration.version} failed to update ${documentName} documents`, batch, error);
        report.failed += batch.length;
        continue;
      }
      // Validation and hooks can omit updates without rejecting the operation. A result that isn't an array, from a
      // wrapper breaking the update contract, can't show which were omitted, so the whole batch counts as saved.
      const requestedIds = batch.map(({ _id }) => _id);
      const omittedIds = Array.isArray(documents) ? _.difference(requestedIds, _.map(documents, 'id')) : [];
      report.migrated += batch.length - omittedIds.length;
      report.failed += omittedIds.length;
      if (omittedIds.length) {
        logError(`Migration ${migration.version} omitted updates for ${documentName} documents`, omittedIds);
      }
    }
  }
  return report;
}

/** Migrates a world compendium, unlocking it for the migration if needed. */
async function migratePack(migration, pack) {
  const locked = pack.locked;
  if (locked) await pack.configure({ locked: false });
  try {
    const documents = await pack.getDocuments();
    const update = (batch, options) => pack.documentClass.updateDocuments(batch, { ...options, pack: pack.collection });
    const step = { migration, writes: [], failed: 0 };
    applyToDocuments(step, pack.documentName, documents, update);
    const report = await storeWrites(migration, step.writes);
    return { migrated: report.migrated, failed: report.failed + step.failed };
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
      const packReport = await migratePack(migration, pack);
      report.migrated += packReport.migrated;
      report.failed += packReport.failed;
    } catch (error) {
      logError(`Migration ${migration.version} failed for compendium ${pack.collection}`, error);
      report.failed += 1;
    }
  }
}

const storedVersion = () => game.settings.get(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.migrationVersion);

/** @type {MigrationPlan|null} */
let pendingPlan = null;

/**
 * Applies the pending migrations to the world documents in memory, on every client. It runs in the `setup` hook, after
 * the documents are created and before the sidebar, chat log and canvas render them, so they never show legacy data.
 * The active GM stores the changes in `ready`, see {@link migrateWorld}.
 */
export function applyPendingMigrations() {
  pendingPlan = null;
  const currentVersion = storedVersion();
  if (currentVersion > LATEST_MIGRATION_VERSION) return;
  const migrations = pendingMigrations(currentVersion);
  if (!migrations.length) return;

  const plan = { steps: [] };
  for (const migration of migrations) {
    const step = { migration, writes: [], failed: 0 };
    for (const collection of WORLD_COLLECTIONS.map((name) => game[name])) {
      const update = (batch, options) => collection.documentClass.updateDocuments(batch, options);
      applyToDocuments(step, collection.documentName, collection, update);
    }
    plan.steps.push(step);
  }
  pendingPlan = plan;
}

/**
 * Asks the GM whether to skip the documents a migration failed for, or to retry the migration on the next load.
 * @param {import('./migrations.js').Migration} migration
 * @param {number} count
 * @returns {Promise<boolean>} true to skip, false to retry, also when the dialog is closed
 */
async function confirmSkipFailed(migration, count) {
  const prompt = game.i18n.format('OQ.Migration.SkipPrompt', { version: migration.version, count });
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: 'OQ.Migration.SkipTitle' },
    content: `<p>${prompt}</p>`,
    modal: true,
    buttons: [
      { action: 'retry', label: 'OQ.Migration.Retry', icon: 'fas fa-rotate-right', default: true },
      { action: 'skip', label: 'OQ.Migration.Skip', icon: 'fas fa-forward' },
    ],
  });
  return result === 'skip';
}

/**
 * Stores the migrations applied by {@link applyPendingMigrations} and migrates the world compendia, storing the version
 * of each migration once applied. When a migration fails for some documents, the GM chooses whether to retry it on the
 * next load or to skip those documents. Runs on the active GM's client only.
 */
export async function migrateWorld() {
  if (!game.users.activeGM?.isSelf) return;

  const currentVersion = storedVersion();
  if (currentVersion > LATEST_MIGRATION_VERSION) {
    ui.notifications.warn(game.i18n.format('OQ.Migration.NewerVersion', { version: currentVersion }), {
      permanent: true,
    });
    return;
  }
  if (!pendingPlan?.steps.length) return;

  const notification = ui.notifications.warn('OQ.Migration.Begin', { localize: true, permanent: true });
  let failed = 0;
  let skipped = 0;
  for (const { migration, writes, failed: failedInMemory } of pendingPlan.steps) {
    log(`Applying migration ${migration.version}: ${migration.name}`);
    const report = await storeWrites(migration, writes);
    report.failed += failedInMemory;
    await migratePacks(migration, report);
    if (report.failed) {
      // A failed migration is retried on the next load, and later migrations wait for it: they may rely on its changes.
      // Failures that come back on every load would block them for good, so the GM can skip the documents instead.
      if (!(await confirmSkipFailed(migration, report.failed))) {
        failed = report.failed;
        break;
      }
      log(`Migration ${migration.version} skipped ${report.failed} documents`);
      skipped += report.failed;
    }
    await game.settings.set(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.migrationVersion, migration.version);
    log(`Applied migration ${migration.version}`, report);
  }
  pendingPlan = null;

  ui.notifications.remove(notification);
  if (failed) {
    ui.notifications.error(game.i18n.format('OQ.Migration.Failed', { count: failed }), { permanent: true });
  } else if (skipped) {
    ui.notifications.warn(game.i18n.format('OQ.Migration.CompleteSkipped', { count: skipped }), { permanent: true });
  } else {
    ui.notifications.info('OQ.Migration.Complete', { localize: true });
  }
}
