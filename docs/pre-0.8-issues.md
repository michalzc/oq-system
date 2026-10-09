# Pre-0.8 review findings

Review scope: changes from `v0.7.0` to `c6eeb8f` for findings 1–3, and from `v0.7.0` to `d26bb4b` for
findings 4–9. Finding locations refer to the revision each pass reviewed.

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

Suggested fix: revalidate current resources before committing the deduction.
Apply the same protection to divine spell magnitude.

Resolution: when the casting dialog is confirmed, the chosen magnitude is checked
against the actor's current MP, or the spell's current remaining magnitude.
Unaffordable selections are cancelled with a warning. After the roll, the cost is
deducted from the current MP balance, never below zero, so MP changes made during
dice fulfillment are kept. Divine casting deducts from the current remainder and
rejects spells expended while the dialog was open.

Limits: casts are not serialized. Two casts that both read MP before either update
is saved, such as rapid repeated shift-clicks or casts from different clients, can
still overwrite each other.

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
migrated. Omitted IDs are logged and counted as failures. Remaining batches and
collections still run. The shared check covers world documents, embedded
documents, and world compendia; compendium locks are restored after omissions.
An update result that isn't an array, from a wrapper breaking the update
contract, can't show which documents were omitted, so its batch counts as saved.

When a migration has failures, the GM chooses in a dialog whether to retry it on
the next load or skip the failed documents. Retrying, also when the dialog is
closed, keeps the previous migration version and blocks later migration steps;
reload retries changes that were not persisted. Skipping stores the version and
runs later migrations, and the skipped documents keep their old data. Foundry
omits the same updates on every load when a module hook vetoes them or the data
fails validation, so without the skip such failures would block migrations for
good. Failures are counted per migration, so a failure in a later migration no
longer keeps an earlier successful one from being stored.

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

Resolution: variable MP spells cast with shift-click use the lower of the
spell's magnitude and current MP; non-variable spells still require their full
magnitude. Split divine spells use their current remaining magnitude.

## 4. [P2] Moving the icons breaks references the migration doesn't reach

Status: resolved.

Locations: [`migration-runner.js:6`](../src/module/migration/migration-runner.js#L6),
[`migration-runner.js:9`](../src/module/migration/migration-runner.js#L9), and
[`migration-1-themed-icons.js:32`](../src/module/migration/migration-1-themed-icons.js#L32).

The icons moved to `assets/icons/themed/`, and nothing is left at the old paths. Migration 1 rewrites actors, items,
tokens, chat messages, macros and journal pages, in the world and in world compendia of those document types. Other
stored paths keep pointing at deleted files. The migration version still advances, so a later fix needs a new
migration. References the migration doesn't reach include:

- roll table results: core copies the image of a dropped item into the result, and `RollTable` is in neither
  `WORLD_COLLECTIONS` nor `PACK_DOCUMENT_TYPES`;
- images inserted into rich text: item descriptions, character notes and NPC descriptions;
- module compendia, which are skipped by design;
- data added after the migration has run: actors or items exported to JSON from a 0.7 world, and compendia
  copied from another world.

Reproduction:

1. In a v0.7.0 world, create a roll table and drop *Backpack* from the system Equipment compendium onto it.
2. Update the system and load the world as GM. The migration reports success and stores version 1.
3. The table result still points at `systems/oq/assets/icons/knapsack.svg`, which no longer exists, so the table
   sheet and drawn results show a broken image.

Suggested fix: also keep the icons at their old paths for at least one release, for example by having the build copy
`themed/*.svg` to `assets/icons/`. This repairs every reference the migration can't find. As 0.8 is unreleased,
migration 1 can still be extended to roll table results in the world and in world compendia. Development worlds that
already applied it can lower *Data Migration Version* to run it again.

Resolution: migration 1 also migrates roll tables and their results, in the world and in world compendia: the image
and the paths in the description of each. Development worlds that already applied migration 1 need *Data Migration
Version* set to 0 and a reload. The 94 moved icons are also back at their old paths, as copies whose background is
black instead of dark red. Every other reference the migration can't reach shows a black icon instead of a broken
one, and the odd colour should prompt users to report it. `cultist.svg` never moved. A test checks that the copies
match the themed icons apart from the background, and the README tells developers not to use them.

Limits: rich text, module compendia and data imported after the migration keep the old paths and show black icons
until someone edits them. The file picker lists the black copies next to the `themed` folder. A black icon picked
after the migration has run is never migrated.

## 5. [P3] Divine spells added on the sheet can't be cast without extra steps

Status: resolved.

Locations: [`actor-base-sheet.js:145`](../src/module/sheet/actor/actor-base-sheet.js#L145),
[`data-models-item.js:180`](../src/module/dataModel/data-models-item.js#L180), and
[`spell.js:88`](../src/module/document/item/spell.js#L88).

The *+* button of the Divine Magic group creates a spell with *No Magic Points* unchecked. Clicking the spell starts
a magic point casting test, which stops with "The spell has no casting skill". Ticking *No Magic Points* leaves
`remainingMagnitude` at its initial 0, so the spell counts as expended and casting is refused until the Regain icon
is used. The same happens to any spell switched to *No Magic Points*, and raising the magnitude of an unspent spell
leaves it partly spent. Divine spells from the compendium are not affected, because their remaining magnitude equals
their magnitude. Before 0.8, clicking a spell only posted it to chat, so these defaults didn't affect play.

Reproduction:

1. On a character's Magic tab, add a spell with the *+* button of the Divine Magic group, then click it. The result is
   "The spell has no casting skill".
2. On the spell sheet, tick *No Magic Points* and set the magnitude to 2. The remaining magnitude shows 0.
3. Click the spell. The result is "The spell is expended. Regain it before casting it again."

Suggested fix: create spells from the Divine Magic group with `noMagicPoints: true`. Set `remainingMagnitude` to
`magnitude` when a spell is created with, or switched to, *No Magic Points*, and when the magnitude of an unspent
spell changes, for example in `OQSpell#_preCreate` and `_preUpdate`.

Resolution: a new divine spell gets *No Magic Points* unless its creation data sets the option, so spells added in
the Divine Magic group need no casting skill. Changing a spell's type to Divine Magic checks the option too. Leaving
Divine Magic keeps the option as it is. A spell created with *No Magic Points* starts with its full magnitude
remaining, unless its creation data sets the remaining magnitude, as compendium spells and copied expended spells do.
A spell switched to *No Magic Points* also gets its full magnitude. When the magnitude of such a spell changes, an
unspent spell stays unspent and a spent one keeps no more than the new magnitude. The rules are pure helpers in
[`magic.js`](../src/module/utils/magic.js), called from the `SpellDataModel` creation and update hooks.

## 6. [P3] Fractional magnitudes are charged inconsistently

Status: resolved.

Locations: [`data-models-item.js:11`](../src/module/dataModel/data-models-item.js#L11),
[`spell.js:124`](../src/module/document/item/spell.js#L124), and
[`spell-cast-dialog.js:33`](../src/module/application/spell-cast-dialog.js#L33).

Spell `magnitude` and `remainingMagnitude` accept fractions. Magic points are integers, and the cast dialog requires
a whole number. A magic point spell with magnitude 2.5 can't be cast from the dialog, but shift-click casts it at
2.5. Core's `NumberField` rounds the new MP value, so the chat card and the actual deduction differ.

Reproduction:

1. Give an actor 10 MP and a variable spell with magnitude 2.5 and a casting skill.
2. Shift-click the spell and roll a success. The card shows 2.5 MP spent, but the actor is left with 8 MP.
3. Click the spell and confirm the dialog. The result is "The magnitude must be a whole number from 1 to 2.5."

Suggested fix: make `magnitude` and `remainingMagnitude` integer fields, so they match magic points and the dialog.

Resolution: `magnitude` and `remainingMagnitude` are integer fields. OpenQuest has no fractional magnitudes: the SRD
spells and the Sorcery *Manipulation cost* table use whole numbers, and so do the system packs. A stored fraction
needs no migration, because core cleans data whenever a document loads and rounds integer fields to the nearest whole
number, so 2.5 loads as 3 and stays valid. Updates are cleaned the same way, so a fraction typed on the sheet is saved
rounded. The sheet's magnitude inputs now step by 1 with a minimum of 0.

Validation: all 182 tests and the lint checks pass. There is no unit test, because the data model module can't be
loaded in the node harness without mocking Foundry's application API. Still to check in a running Foundry: a spell
with a fractional magnitude stored before the change loads rounded without validation errors.

## 7. [P3] NPC icons lose their palette in detached windows

Status: open.

Locations: [`icon-filters.js:17`](../src/module/init/icon-filters.js#L17) and
[`variables.less:18`](../src/styles/variables.less#L18).

The NPC palette is an SVG filter appended to the main window's body and referenced with `filter: url(#oq-npc-icon)`.
Foundry 14 can detach applications into popup windows. A popup copies the stylesheets from `<head>`, but not the
filter element. In a detached NPC sheet or chat log, the reference points to a missing element, so the icons are
drawn unfiltered, in the PC palette. This is inferred from the Foundry source and wasn't reproduced in the app.

Reproduction:

1. Open an NPC sheet that lists items with system icons.
2. Choose *Detach* from the sheet's header menu.
3. The item icons in the popup window use the PC palette.

Suggested fix: let `registerIconFilters` take a document, and also call it from the `openDetachedWindow` hook. Core
calls that hook with the new window once its document is ready.

## 8. [P3] Copies of default items keep the `newActor` flag

Status: open.

Location: [`compendium-utils.js:28`](../src/module/utils/compendium-utils.js#L28).

Items added to new actors keep `flags.oq.newActor`. Embedded items don't offer the *Default for New Actors* control,
so the flag can't be seen or cleared on them. It takes effect again when such an item is dragged to the Items
sidebar, because the world copy is then a default item too. With *Default Items from World* enabled, new actors get
the item twice, unless the copy replaces a compendium original.

Reproduction:

1. Enable *Default Items from World*. Create an item in the world and mark it as a default for characters.
2. Create a character, then drag the item from the character sheet to the Items sidebar.
3. Create another character. It gets the item twice.

Suggested fix: remove `flags.oq.newActor` from the item data in `getDefaultItemsForActor` before it is embedded.

## 9. [P3] Sorcery manipulation can't be paid through the cast dialog

Status: resolved; duration and range manipulation remain open.

Locations: [`spell.js:69`](../src/module/document/item/spell.js#L69) and
[`magic.js:10`](../src/module/utils/magic.js#L10).

The cast dialog uses magnitude as the magic point cost and caps it at the spell's stored magnitude. That matches
Personal Magic. In the SRD, sorcery costs one magic point plus the magic points of the manipulations chosen at
casting, which the Sorcery Casting skill limits. All 38 sorcery spells in the compendium have magnitude 1, so they
can only be cast for 1 MP. To cast a manipulated spell, the player must first edit the spell's magnitude, and the chat
card then shows the MP total as the spell magnitude. With that total entered, the costs on a critical success, a
failure and a fumble match the SRD.

Suggested fix: for sorcery, let the dialog ask for the manipulation cost, capped by the Sorcery Casting limit and
the current MP, instead of using the stored magnitude. Alternatively, document the workaround on the Magic journal
page.

Resolution: a variable sorcery spell that costs magic points takes the highest magnitude its casting skill allows
when it is added to an actor, from the SRD *Manipulation cost* table: 2 from 1%, one more for every further 10%, 10
from 81%, 15 from 91% and 20 at 100%. The skill value excludes its situational modifier, as in the cast dialog.
Sorcery casting costs follow the same table, so magnitudes above 10 cost 11 MP. The dialog and shift-click allow the
stored magnitude when the actor can pay its cost, and otherwise the magnitude the actor's MP pay for. The magnitude is
kept when the actor lacks the casting skill. The Magic journal page describes both rules.

Limits: the stored magnitude doesn't follow later changes of the casting skill. A separate ticket covers an
"Adjust sorcery spells" macro for that. Items embedded in an actor's creation data, such as default items, aren't
adjusted. A folder drop that adds the casting skill and the spell in the same batch can't see the skill yet. Only
magnitude is manipulated: duration and range manipulation, and their costs, are still not modelled.

## Validation of fixes 1–3

- All 137 tests passed, including 20 casting regression tests in
  [`test-spell-casting.js`](../test/test-spell-casting.js) and 13 new migration
  regression tests in [`test-migrations.js`](../test/test-migrations.js).
- JavaScript, template, and style lint checks passed.
- Casting tests exercise the real casting methods with controlled dialogs, dice
  fulfillment, and updates. They cover casts confirmed from dialogs opened at the
  same time, resource edits, casting costs, shortcut limits, cancellation, and
  failures. Eleven of them fail against the casting code before the fix.
- Migration tests cover empty, partial, and non-array results, returned ID
  matching, omitted embedded and compendium updates, lock restoration, rejected
  batches, and continued processing. The reload test separates persisted and
  in-memory data and verifies that only unsaved changes are retried before the
  version advances. Others cover the GM's retry and skip choices, a later
  migration running after a skip, and per-migration failure counts.
- Validation uses document harnesses, not end-to-end browser tests. Six new
  migration tests reproduced finding #2 before the fix and pass with the fix.
  Six more fail against the runner before the skip dialog and the non-array
  handling.

## Second-pass checks

- All 137 tests and the JavaScript, template and style lint checks pass at `d26bb4b`.
- `yarn build:docs` regenerates `src/packs/documentation` without changes.
- Every icon in `assets/icons/` at `v0.7.0` except `cultist.svg` exists in `assets/icons/themed/`, so migration 1
  never rewrites a path to a missing file. No code, template, style, script, CSV or pack file still uses an old path.
- These were checked against the Foundry 14.368 sources, and no issue was found:
  - the `setup` hook runs after the world documents are created and before the socket listeners start, so the
    in-memory migration can't race remote updates;
  - core applies its *Prototype Token Overrides* whenever prototype token data is initialized, so they still take
    precedence over the new token defaults for actors;
  - the server sends every world item to every user, so actors created by players also get the world default items;
  - application options concatenate `window.controls`, so the new item sheet control doesn't replace core's controls;
  - the Personal Magic casting costs match the SRD.
- Not verified in a running Foundry: migration 1 writing `system` as a `ForcedReplacement` to items in unlinked
  token deltas and to world compendia. The tests use document harnesses. Before release, run the migration on a copy
  of a v0.7.0 world with unlinked tokens and a locked world compendium.

## Validation of fixes 4, 5 and 9

### Fix 4

- All 182 tests and the lint checks pass.
- The new tests cover:
  - the roll table handlers;
  - a world roll table with its results;
  - a world RollTable compendium, while a system one is skipped;
  - the legacy icon copies.
- Three of the new tests fail against the previous migration code.
- Not yet checked in a running Foundry:
  - the black icon at an old path;
  - a 0.7 roll table migrated after *Data Migration Version* is reset to 0.

### Fixes 5 and 9

- All 178 tests and the lint checks pass. The 41 new tests cover the helpers in
  [`test-magic.js`](../test/test-magic.js), plus sorcery casting costs, magnitude caps and the magnitude a spell takes
  when it is added to an actor in [`test-spell-casting.js`](../test/test-spell-casting.js).
- Three of the new casting tests fail against the previous `spell.js`: the 11 MP cost at magnitude 15, the fumble
  cost, and the magnitude taken from the casting skill.
- `yarn build:docs` regenerates the documentation pack with only the Magic page changed.
- The `SpellDataModel` hooks are exercised only through their helpers, not in a running Foundry. Still to check
  in-app:
  - creating a spell from the Items sidebar and switching it to Divine Magic;
  - adding a spell in the Divine Magic group;
  - dropping a compendium sorcery spell on actors with Sorcery Casting at 45% and 95%.
