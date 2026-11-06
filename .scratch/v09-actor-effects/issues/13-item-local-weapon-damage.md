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

**Status:** ready-for-agent

- [ ] Item effects carry a role field; "this item" has transfer off.
- [ ] The weapon sheet has an Effects section (create, edit, enable/disable, delete, role shown) using the system
      editor in the parchment theme.
- [ ] For "this item" definitions the editor offers only the weapon damage addition target (this weapon only).
- [ ] The weapon adds its item-local damage terms after the Damage Modifier (and alongside any actor-wide terms) in its
      own preparation, with a marker and contributions tooltip.
- [ ] Item-local effects travel with copies natively and survive rename, state change and reload.
- [ ] Effect-contributions module tests: weapon-local vs actor-wide damage terms.
- [ ] The Items documentation page explains item effects and roles, with an intrinsically enchanted weapon recipe.
- [ ] Manual: the spec's Itm1 row "Sword A local +1D4 damage" passes, plus rename, store, ready and copy to another
      actor with reloads.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
