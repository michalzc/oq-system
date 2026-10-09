import { themedIconsMigration } from './migration-1-themed-icons.js';

/**
 * @callback MigrationHandler
 * @param {object} source The document source, from `toObject()`.
 * @param {{replace: function(*): *}} helpers `replace` wraps a value so it replaces the stored one instead of being
 *   merged into it, which drops keys the data models no longer define.
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
export const migrations = [themedIconsMigration];

export const LATEST_MIGRATION_VERSION = Math.max(0, ...migrations.map((migration) => migration.version));

/**
 * The migrations not applied yet to a world at the given version.
 * @param {number} currentVersion
 * @returns {Migration[]}
 */
export const pendingMigrations = (currentVersion) =>
  migrations.filter((migration) => migration.version > currentVersion);
