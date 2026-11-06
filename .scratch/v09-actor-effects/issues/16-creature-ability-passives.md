# 16: Creature ability passives

**What to build:** A Referee gives a creature's special ability (thick hide, or a regeneration reminder) an "owner
while active" effect. It applies whenever its switch is on; switching it off removes the benefit and leaves the ability
item unchanged. A passive bound to a named skill shows a missing target after being copied to another actor, until
someone rebinds it in the editor. Second and last slice of chunk **Itm2**; see [the spec](../spec.md), section "Item
effects (Itm1, Itm2)", and user stories 81, 83.

**Blocked by:** 15 (Owner passives from weapons, armour and equipment)

**Status:** ready-for-agent

- [ ] Special-ability sheets gain the Effects section with the "owner while active" role. Special abilities have no
      eligible states; only the switch gates them.
- [ ] Ability passives appear in the actor's passives group with their source.
- [ ] A named-skill selector on a passive binds by skill identity within the owning actor. After a copy to another
      actor it shows a missing target with no contribution until rebound. Group, all and characteristic selectors
      work anywhere.
- [ ] Effect-contributions module tests: ability passive eligibility by switch only; missing named target after copy.
- [ ] The Items documentation page covers creature ability passives.
- [ ] Manual: the spec's Itm2 row "Creature ability passive +2 AP: switch off; on" passes, plus a named-skill passive
      copied to another actor and rebound.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
