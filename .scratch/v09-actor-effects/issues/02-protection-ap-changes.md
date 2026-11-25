# 02: Protection: AP changes and contribution tooltips

**What to build:** A Referee adds a "Protection 3" effect with a +3 AP change to an actor wearing 2 AP armour, and the
sheet shows 5 AP with a marker. Hovering over it lists the contributing effects and amounts. Disabling, re-enabling,
deleting and reloading restore exactly the calculated value; no stored field changes. Second and last slice of chunk
**Fx1**; see [the spec](../spec.md), sections "Effect records", "Curated change vocabulary", "Pure
effect-contributions module", "Actor preparation order" and Fx1 user stories 4, 5, 7, 8, 11, 87, 88.

This slice introduces the main seam: a pure effect-contributions module, free of Foundry calls at import time, that
takes the active changes (with effect identity, name, source name and rules text) and returns the effective value and
source breakdown per target. It supports only the AP target for now, and later tickets extend it. The effect data
model gains the OpenQuest change fields (target, operation, value; minimum, selector and conditional come with the
targets that need them). Core key-path application skips OpenQuest changes. The `applyActiveEffects('initial')` call
stays for non-OpenQuest changes only. Confirm in the v14 sources that this override keeps core status and token change
handling.

**Blocked by:** 01 (Effects list with reminder-only effects)

**Status:** resolved

- [x] The editor replaces free key/type/value rows with curated change rows offering only targets that exist (AP) and
      the operations each target allows (add, multiply, override). Unmanaged stored changes stay listed separately and
      are preserved on save.
- [x] Per-target combination is deterministic: multipliers apply to the unmodified value, then additions, then an
      override replaces the result, then any minimum. With mixed multiplicative and additive contributions, or more
      than one override, the breakdown lists them all.
- [x] Effect AP adds on top of native AP (base + modifier) and the best worn or natural armour, in derived data.
      Preparation never writes back to source.
- [x] AP changed by effects shows a marker and a tooltip listing each contributing effect and amount.
- [x] Effect-contributions module tests (new test file): AP add/multiply/override, combination order, multi-source and
      multi-override breakdowns, disabled effects contribute nothing.
- [x] The Actors documentation page explains the Effects list, editor, reminder-only effects and contribution
      tooltips, with a Protection recipe (edit the HTML source and regenerate the journal sources).
- [x] Manual: the spec's Fx1 rows "Worn armour 2 AP: add Protection 3; disable; enable; delete; reload after each"
      (5; 2; 5; 2 AP; no stored field changes) and "Two unlinked tokens of one actor" pass, on a character and an NPC.
- [x] `yarn test`, `yarn lint` and `yarn build` pass.

## Comments

- 2026-11-25: Implemented on `feature/v09-fx1-actor-effects`. The effect data model's change schema gains an optional
  `target` (core's own `key`/`type`/`value`/`phase`/`priority` fields are kept). An OpenQuest change has a `target`
  from `EFFECT_TARGETS`, a blank `key`, `type` as its operation and a numeric `value`.
  `OQActiveEffect#shouldApplyChange` skips changes with a target. Core still collects statuses and `token.` changes
  outside that check (`client/documents/actor.mjs:240-257`). The seam is `utils/effect-contributions.js`
  (`activeEffectChanges`, `attributeContribution`, `effectChangesToSave`, `formatContribution`), tested in
  `test/test-effect-contributions.js`. AP is calculated in `calculateItemDependentAttributes`: the effect breakdown
  sits on `system.attributes.ap.effects`, and the sheet tooltip uses `actor/parts/effect-contributions-tooltip.hbs`.
  Judgement calls:
  - AP rounds down after multiplying.
  - Of several overrides, the highest wins. The tooltip flags mixed multiply+add contributions, and several overrides,
    for review.
  - Changes that change nothing (add 0, ×1) are ignored.
  - Curated rows are offered on actor effects only, and only the actor's own effects feed the calculation. Item roles
    come in Itm1/Itm2.
  - Saving puts unmanaged changes first, each exactly as stored, then the OpenQuest changes. Effects that mix both
    kinds may change their relative order.

  Two v14 traps are now in `docs/foundry-v14-notes.md`: change fields can't be reused across schemas, and how
  `shouldApplyChange` interacts with statuses and token changes.

- 2026-11-25 in-world QA (Foundry 14.370, `oq-dev` world, GM client): passed.
  - Character A (worn leather 2 AP): "Protection 3" was created from the Effects tab in the editor (source
    Protection, Armour points / Add / 3). Then disable, enable and delete from the list, with a reload after each:
    AP 5; 2; 5; 2. The actor's stored data (without effects) was identical after every reload. The marker and tooltip
    showed "Without effects 2, Protection 3 (Protection) +3".
  - Unlinked Elf token: the same sequence from its NPC sheet gave 5; 2; 5; 2. The other Elf token and the base actor
    stayed at 2 with no effects.
  - Mundek: a macro-style effect had a legacy `system.attributes.ap.mod` +1, a `token.alpha` override, the `blind`
    status and an OpenQuest +2. Core applied the +1 (in `overrides`), the status and the token change; the system
    applied the +2. Editing the OpenQuest value, adding a ×2 row and deleting a row all saved the legacy changes
    byte-for-byte (AP 6, flagged for review).
  - A freshly added (+0) row leaves AP unmarked.
  - No console errors or warnings.
  - `yarn build:packs` was not run, because Foundry was running and the script deletes `build/packs`. The packs were
    compiled into a scratch directory instead.

