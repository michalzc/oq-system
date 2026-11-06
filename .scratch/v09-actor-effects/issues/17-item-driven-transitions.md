# 17: Item-driven maximum/current transitions

**What to build:** An owner passive that changes the HP or MP normal maximum moves current points exactly like an
actor effect does. Its switch, a change of the item's state, and creating or deleting the item each cause one
transition. Equipping, toggling and reloading never create temporary points or repeat an adjustment, so passives can't
be farmed for HP. This wires item-driven transitions, which the spec gives to whichever of **Fx4** and **Itm2** lands
second; ship it in that chunk's PR. See [the spec](../spec.md), section "Maximum/current transitions (Fx4)", and user
stories 37, 38, 85.

**Blocked by:** 05 (HP/MP maximum effects move current points), 15 (Owner passives from weapons, armour and equipment)

**Status:** ready-for-agent

- [ ] Passive switch toggles, item state changes and creation or deletion of items carrying passives trigger the same
      before/after effective-maximum comparison on the initiating client, with one follow-up actor update when the
      maximum changed.
- [ ] Preparation, reload, re-render and other clients never adjust. Temporary pools are untouched.
- [ ] Changes to item state that leave the effective maximum unchanged move no points.
- [ ] The Actors documentation page notes that item passives move current points like actor effects.
- [ ] Manual: a ring with a +4 HP maximum passive on HP 6/10: ready (10/14), store (6/10), ready again (10/14, not
      more), switch off and on, delete the ring, reload between steps; repeated on an unlinked token.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
