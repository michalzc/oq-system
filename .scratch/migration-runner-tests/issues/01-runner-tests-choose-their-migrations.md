# 01: Migration runner tests choose the migrations they run

**What to build:** the runner tests in `test/test-migrations.js` (`describe('migration-runner.js')`) run a migration
list they choose, so appending a migration to `src/module/migration/migrations.js` leaves the existing runner tests
untouched. Today `applyPendingMigrations()` and `migrateWorld()` (`src/module/migration/migration-runner.js`) always
run every registered migration above the stored version, starting from version 0 in most tests.

Found in the Res2 retro (2026-11-26): adding migration 4 (`migration-4-legacy-mp-excess.js`) broke three tests that
were about other migrations:

- the "legacy HP excess" block saw migration 4's writes in its recorded updates, and had to be rewritten to cover HP
  and MP together;
- the locked-compendium assertion counted one unlock/relock `configure` pair per migration, so it now checks only
  `.at(-2)` and `.at(-1)`;
- the retry test had to store `legacyHpExcessMigration.version - 1` instead of a fixed version.

Every later migration (the v0.9 chunks still to come) would repeat this rework.

**Status:** done

- [x] A runner test states which migrations it runs: generic runner behaviour (writes, failures, skip/retry, locked
      compendia, newer stored version) runs on small fixture migrations; tests of a real migration through the runner
      run that migration alone.
- [x] The production entry points still run the registered `migrations` list, and their `setup`/`ready` callers in
      `oq.js` are unchanged.
- [x] Check: append a dummy migration with handlers for `Actor` and `Token` to `migrations.js` locally; every runner
      test still passes without edits. Remove the dummy afterwards.
- [x] `yarn test` and `yarn lint` pass.

Design is open. Two candidates:

- An optional parameter (`applyPendingMigrations(migrations = registered)`), with `LATEST_MIGRATION_VERSION` and the
  newer-version check derived from the list in use, carried by the pending plan into `migrateWorld()`.
- No production change: the tests replace the contents of the exported `migrations` array in `beforeEach` and
  restore it in `afterEach`, as the "with a later migration" block already does with `push`/`pop`.

The first makes the seam explicit; the second is smaller but keeps tests coupled to a mutable module export. Prefer the
first unless it spreads beyond the runner.

## Comments

Implemented the first candidate: `applyPendingMigrations(migrations = registered)`; the pending plan carries the
newer stored version to `migrateWorld()`. Generic runner tests run an icon fixture migration; the flag test runs
migration 2 alone, the HP/MP excess block runs migrations 3 and 4. Checked with a dummy migration 5 (Actor and Token
handlers): every test passed unedited.
