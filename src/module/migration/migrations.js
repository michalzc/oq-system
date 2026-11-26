import { themedIconsMigration } from './migration-1-themed-icons.js';
import { embeddedNewActorFlagMigration } from './migration-2-embedded-new-actor-flag.js';
import { legacyHpExcessMigration } from './migration-3-legacy-hp-excess.js';
import { legacyMpExcessMigration } from './migration-4-legacy-mp-excess.js';

/**
 * @callback MigrationHandler
 * @param {object} source The document source, from `toObject()`.
 * @param {{replace: function(*): *, remove: function(): *, parent: foundry.abstract.Document|null,
 *   worldActor: function(string): object|null}} helpers
 *   `replace` wraps a value so it replaces the stored one instead of being merged into it, which drops keys the data
 *   models no longer define. `remove()` is a value that deletes the key it is assigned to. `parent` is the document the
 *   migrated one is embedded in, null for world and compendium documents. `worldActor(id)` is the source of a world
 *   actor as it is in memory (already migrated), null when there is none: the base actor of a token.
 * @returns {object} The changes to write, empty when the document is up to date.
 */

/**
 * @typedef {object} Migration
 * @property {number} version Applied in ascending order, and stored in the world once applied.
 * @property {string} name
 * @property {Record<string, MigrationHandler>} handlers By document name; documents without a handler are skipped.
 */

/**
 * World data migrations, in ascending version order. A shipped migration is never edited: changes go into a new one
 * with the next version.
 * @type {Migration[]}
 */
export const migrations = [
  themedIconsMigration,
  embeddedNewActorFlagMigration,
  legacyHpExcessMigration,
  legacyMpExcessMigration,
];

/**
 * The version of the latest of the given migrations, 0 when there are none.
 * @param {Migration[]} migrationList
 * @returns {number}
 */
export const latestVersion = (migrationList) => Math.max(0, ...migrationList.map((migration) => migration.version));

export const LATEST_MIGRATION_VERSION = latestVersion(migrations);

/**
 * The migrations not applied yet to a world at the given version.
 * @param {number} currentVersion
 * @param {Migration[]} migrationList
 * @returns {Migration[]}
 */
export const pendingMigrations = (currentVersion, migrationList) =>
  migrationList.filter((migration) => migration.version > currentVersion);
