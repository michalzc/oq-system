# 01: Give data model fields a fresh default object per document

**What to build:** Data model fields whose `initial` is a plain array or object share that one object between every
document that receives the default, because `DataField#getInitialValue` (`common/data/fields.mjs:264`) returns a
non-function `initial` by reference (see `docs/foundry-v14-notes.md`, "Data model fields and migration"). Any code that
changes such a value in place, rather than replacing it, then leaks the change into documents created later. Res1
ticket 01 hit this with the HP pool list (fixed in `04b879b` with `initial: () => []`).

Remaining fields with a plain default, found while reviewing Res1 ticket 01:

- `personal.money`: `ObjectField`, `initial: {}` (character data model, `src/module/dataModel/data-models-actor.js`).
- `traits`: `ArrayField`, `initial: []`, in the weapon, equipment, spell and special ability data models
  (`src/module/dataModel/data-models-item.js`).

Not yet confirmed as a live bug: first check whether anything mutates these values in place (the money service,
trait editing on item sheets, `_preCreate`/`updateSource` paths, macros in `src/packs/`). Either way the fix is cheap
and removes the trap: switch each to a factory (`initial: () => ({})`, `initial: () => []`).

**Blocked by:** None

**Status:** needs-triage

- [ ] Each field listed above uses a factory `initial`; no data model field in `src/module/dataModel/` has a plain
      array or object `initial`.
- [ ] Manual: create a character, change its money; create a second character: it starts with empty money. Same for
      an item's traits.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
