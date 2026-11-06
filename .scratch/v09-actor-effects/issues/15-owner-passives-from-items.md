# 15: Owner passives from weapons, armour and equipment

**What to build:** A Referee gives a ring an "owner while active" effect with +2 AP. While the ring is readied its
owner gains 2 AP; carried or stored it gives nothing; readied again it gives 2 (never 4). Each passive has its own
on/off switch and a set of eligible states the Referee can change (tick "carried" and it works while carried). The
actor's Effects list shows passives from items in their own group, with the source item, its state and why an inactive
one is inactive; toggling there updates the definition on the item. Worn-armour AP stays separate from an armour
passive. First slice of chunk **Itm2**; see [the spec](../spec.md), sections "Item effects (Itm1, Itm2)", "Actor
preparation order" and "Sheets and editor", and user stories 77–80, 82–86.

Owner passives use transfer on and are collected from the actor's items before base data preparation, using their
stored state. Ineligibility is reported through the effect's suppression (core `isSuppressed`), so core expiry and
disabling checks still apply. No actor-owned mirror copy is ever created. Confirm in the v14 sources that transferred
item effects are visible to the actor before base data preparation.

**Blocked by:** 13 (Item-local weapon damage; item Effects section and role)

**Status:** ready-for-agent

- [ ] The role field gains "owner while active" (transfer on), offering the actor change vocabulary in the editor.
- [ ] Each passive stores eligible states (defaults: readied for weapons and equipment, worn for armour, natural for
      natural weapons and armour; carried or stored can be ticked) and a switch defaulting to on.
- [ ] Armour and equipment sheets gain the Effects section; weapons offer both roles.
- [ ] Passive eligibility is computed in the pure module (item type, state, eligible states, switch) and reported
      through suppression.
- [ ] The actor Effects list shows a passives group with source item, state and inactive reason (disabled, item not in
      an eligible state); toggling there writes to the item's definition.
- [ ] Deleting an item removes its passives; copying an item to another actor brings them with no duplicate left behind.
- [ ] Passives on an unlinked token's items affect only that token's actor.
- [ ] Effect-contributions module tests: passive eligibility by item type, state, eligible states and switch.
- [ ] The Items and Actors documentation pages explain owner passives and eligible states, with a ring of protection
      recipe.
- [ ] Manual: the spec's Itm2 rows "Ring readied", "Ring passive with carried ticked", "Ring copied to actor B" and
      "Two unlinked tokens share base actor and item IDs" pass, with reloads.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
