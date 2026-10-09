# Pre-0.8 review findings

Review scope: changes from `v0.7.0` to `c6eeb8f`.
Finding locations below refer to that reviewed revision.

## 1. [P2] Casting can overwrite resource changes made while a dialog is open

Status: resolved.

Locations: [`spell.js:64`](../src/module/document/item/spell.js#L64),
[`spell.js:83`](../src/module/document/item/spell.js#L83), and
[`spell.js:100`](../src/module/document/item/spell.js#L100).

Magic-point casting captures the actor's MP balance before awaiting the casting
dialog and roll, then deducts the cost from that captured balance. Other casts or
resource edits made in the meantime can be overwritten. Divine casting uses the
same stale-value pattern for remaining magnitude.

Reproduction:

1. Start with 10 MP and a variable spell with magnitude 3.
2. Open two casting dialogs before confirming either one.
3. Confirm both casts at magnitude 3, with successful casting rolls.
4. The final balance is 7 MP instead of 4 MP.

Suggested fix: revalidate current resources before committing the deduction and
serialize competing casts. Apply the same protection to divine spell magnitude.

Resolution: confirmed casts now share a per-actor queue on each client. Dialogs
stay outside the queue. Casting rechecks current resources and spell limits when
the queued operation runs, and MP is checked again after dice fulfillment.
Unaffordable selections are cancelled with a warning. Chat cards are posted only
after resource persistence succeeds, and failed casts do not block the queue.
Divine casting deducts from the current remainder and rejects spent spells.

Limits: the queue does not serialize casts from different clients or provide
atomic transactions for arbitrary external resource edits during persistence.

## 2. [P2] Migrations can report success without saving every document

Status: resolved.

Location: [`migration-runner.js:104`](../src/module/migration/migration-runner.js#L104).

The migration runner counts every document in a requested batch as migrated when
the update promise resolves, without checking which documents were returned.
Foundry can skip documents during validation or hook cancellation without
rejecting the promise. The migration version can therefore advance while some
documents still contain legacy data, preventing an automatic retry on reload.

Reproduction in a document harness:

1. Provide a document with a legacy system icon path and migration version 0.
2. Have its collection's update operation resolve with an empty array, matching
   an operation in which Foundry skips every requested document.
3. Run the migration.
4. The runner reports one migrated document and advances the version to 1,
   although the stored icon path remains unchanged.

Suggested fix: compare returned document IDs with the requested IDs and count
omitted updates as failures, retaining the previous migration version for retry.

Resolution: each batch now counts only requested IDs returned by Foundry as
migrated. Omitted IDs are logged and counted as failures, keeping the previous
migration version and blocking later migration steps. Remaining batches and
collections still run. The shared check covers world documents, embedded
documents, and world compendia; compendium locks are restored after omissions.
Reload retries changes that were not persisted.

Limits: this does not repair worlds whose migration version already advanced
incorrectly before the fix.

## 3. [P2] Shift-click rejects affordable variable spells

Status: resolved.

Location: [`spell.js:70`](../src/module/document/item/spell.js#L70).

The shortcut chooses the spell's full magnitude, while the normal casting dialog
caps variable spells at the actor's available MP. This conflicts with the
documented behavior of casting at the highest available magnitude.

Reproduction:

1. Start with 2 MP and a variable spell with magnitude 5.
2. Shift-click the spell to cast it without a dialog.
3. Casting is rejected with "Not enough magic points", although a magnitude-2
   cast is affordable and available through the normal dialog.

Suggested fix: cap the shortcut's magnitude at available MP for variable spells,
using the same limit as the dialog.

Resolution: shift-click selects the magnitude when its queued cast executes.
Variable MP spells use the lower of the spell's magnitude and current MP;
non-variable spells still require their full magnitude. Split divine spells use
their current remaining magnitude.

## Validation

- All 138 tests passed, including 26 casting regression tests in
  [`test-spell-casting.js`](../test/test-spell-casting.js) and eight new migration
  regression tests in [`test-migrations.js`](../test/test-migrations.js).
- JavaScript, template, and style lint checks passed.
- Casting tests exercise the real casting methods with controlled dialogs, dice
  fulfillment, and updates. They cover overlapping casts, resource edits, casting
  costs, shortcut limits, cancellation, failures, and independent token actors.
- Migration tests cover empty and partial results, returned ID matching, omitted
  embedded and compendium updates, lock restoration, rejected batches, and
  continued processing. The reload test separates persisted and in-memory data
  and verifies that only unsaved changes are retried before the version advances.
- Validation uses document harnesses, not end-to-end browser tests. Six new
  migration tests reproduced finding #2 before the fix and pass with the fix.
