# 13: Item-local weapon damage; item Effects section and role

**What to build:** A Referee opens a weapon sheet, adds an effect in its new Effects section and gives it a +1D4 damage
change for "this item". That weapon's damage formula gains +1D4; a second weapon using the same skill, and the skill
itself, are unaffected. The enhancement survives renaming, state changes, reload and copying the weapon to another
actor. First slice of chunk **Itm1**; see [the spec](../spec.md), section "Item effects (Itm1, Itm2)", and user stories
72–74, 76.

Each item-borne effect gets an explicit **role**. This slice introduces the role field with the value "this item"
(transfer off). Owner passives (ticket 15) add the second value. Item sheets gain an Effects section listing
definitions with their role; this slice adds it to weapons. "This item" definitions offer only weapon targets and are
prepared by their own item.

**Blocked by:** 02 (Protection: AP changes and contribution tooltips)

**Status:** resolved

- [x] Item effects carry a role field; "this item" has transfer off.
- [x] The weapon sheet has an Effects section (create, edit, enable/disable, delete, role shown) using the system
      editor in the parchment theme.
- [x] For "this item" definitions the editor offers only the weapon damage addition target (this weapon only).
- [x] The weapon adds its item-local damage terms after the Damage Modifier (and alongside any actor-wide terms) in its
      own preparation, with a marker and contributions tooltip.
- [x] Item-local effects travel with copies natively and survive rename, state change and reload.
- [x] Effect-contributions module tests: weapon-local vs actor-wide damage terms.
- [x] The Items documentation page explains item effects and roles, with an intrinsically enchanted weapon recipe.
- [x] Manual: the spec's Itm1 row "Sword A local +1D4 damage" passes, plus rename, store, ready and copy to another
      actor with reloads.
- [x] `yarn test`, `yarn lint` and `yarn build` pass.

## Comments

### 2026-11-26: implemented

- Role: `system.role` on the effect data model (choices from `EFFECT_ROLES`, absent on actor effects and pre-v0.9 item
  effects). `OQActiveEffect#_preCreate` sets `transfer` from the role (`roleTransfer`), so a "this item" definition
  never transfers.
- Vocabulary per effect: `effectTargets(effect, parentDocumentName)` gives the targets an effect may name (actor
  targets, its role's targets, or none for an item effect without a role). The list entry, the editor's target options
  and `effectChangesToSave` use it; changes outside it are kept as stored. The actor reads only `ACTOR_TARGETS` changes,
  so an actor effect's weapon damage change does nothing until ticket 10 adds the target to the actor vocabulary.
- `weaponDamage(weapon, itemEffects)` puts the weapon's own "this item" terms after the Damage Modifier. A term is a
  dice/number term (`damageTerm`); the editor refuses unreadable ones (`unreadableDamageTerms`) and keeps the editor
  open. One target key, `weaponDamage`, serves both scopes: the effect's role or parent decides whether it is local.
  Ticket 10 should add it to `ACTOR_TARGETS` and give `weaponDamage` the actor's changes through `getDataForItems()`.
- Deviation: the "weapon-local vs actor-wide" test covers locality only (sword A's term stays off sword B). Review
  found the actor-wide path unreachable here and an item reading `actor.effectChanges` against CLAUDE.md, so the
  actor-wide terms and their test move to ticket 10.
- `transfer` follows the role on create and on update (`_preCreate`, `_preUpdate`).
- Damage values carry `formula`, the whole formula as written; the damage dialog and the weapon chat card read it
  instead of rebuilding formula + DM.
- Weapon damage changed by effects shows the wand marker and a contributions tooltip on the actor sheet's weapon
  rows; the damage roll dialog starts from the full formula and the damage card lists each effect's term.
- The edit/delete/toggle handlers of effects lists are shared by actor and item sheets
  (`sheet/effect/effect-list-actions.js`).

### 2026-11-26: manual QA

Foundry 14.370, world `oq-dev`, GM client. Character "QA Itm1 PC" (STR 13, SIZ 13, DM +1d4) with Sword A and Sword B
(both Close Combat, 1d8 + DM).

- Weapon sheet Effects section: Add effect created "New effect" with role This item, `transfer: false`; the editor
  showed the role with its hint, no Transfer checkbox, and one target (Weapon damage, Add, text value, no minimum).
- `1d4 + @str` refused with "Not a damage term: 1d4 + @str…", editor stayed open, nothing stored; `1d4` saved.
- Sword A `1d8 + 1d4 + 1d4` with marker; tooltip "Damage: 1d8 + 1d4 + 1d4 / Without effects 1d8 + 1d4 / Enchanted
  edge (Dwarf smith) +1D4". Sword B `1d8 + 1d4`, no marker. Close Combat 47 unchanged.
- Quick damage roll formula `1d8 + 1d4 + 1d4`, card lists "Enchanted edge +1D4"; damage dialog prefilled
  `1d8 + 1d4 + 1d4`.
- Rename, stored, carried, readied: formula unchanged each time. Disable from the section: `1d8 + 1d4`, row greyed,
  marker gone; enable: back. Reload: A and B unchanged.
- Dropped Sword A on NPC "QA Fx3 NPC" (no DM): copy `1d8 + 1d4` with marker, effect `transfer: false`, role
  thisItem; original kept its effect. Copy to the Items directory kept the effect. After reload the NPC copy still
  `1d8 + 1d4`.
- Every editor control fired `change` with no exception; deleting from the section emptied it ("No effects").
- Actor effect editor still offers ap, mr and the seven characteristics only, no Transfer. Armour sheet has no Effects
  section. No console errors or warnings.

Checks: `yarn test` 404 passing, `yarn lint` clean; with the dev world open, `yarn build:code` and `yarn check:packs`
stood in for `yarn build`.

After review fixes: `update({transfer: true})` on a "this item" effect stored `false`; damage dialog prefilled
`1d8 + 1d4 + 1d4` (A) and `1d8 + 1d4` (B); a special ability (`3d6 @dm`) prefilled `3d6` as before.

Not checked: a player client, unlinked tokens, copying into a compendium.

