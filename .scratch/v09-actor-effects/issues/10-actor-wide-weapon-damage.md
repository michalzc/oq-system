# 10: Actor-wide weapon damage addition

**What to build:** A Referee adds Strength (+1 damage per magnitude, nonmagical) to an actor, and every weapon's damage
formula shows the bonus after the Damage Modifier (sword 1D8 + DM becomes 1D8 +1D4 +2) without raising STR. Part of
chunk **Fx6a**; see [the spec](../spec.md), sections "Curated change vocabulary", "Pure effect-contributions module"
(weapon contributions) and "Actor preparation order" (step 2), and user story 64.

**Blocked by:** 02 (Protection: AP changes and contribution tooltips)

**Status:** ready-for-agent

- [ ] The editor offers an actor-wide weapon damage addition target that adds a formula term.
- [ ] Weapons append actor-wide damage terms after the Damage Modifier when preparing their damage roll values. STR and
      the Damage Modifier are unchanged.
- [ ] Weapon damage changed by effects shows a marker and a contributions tooltip.
- [ ] Effect-contributions module tests: actor-wide damage terms for a weapon, several sources combined.
- [ ] The Actors documentation page gains a Strength recipe.
- [ ] Manual: the spec's Fx6a row "Strength +2 damage, sword 1D8 + DM" passes; rolling damage uses the shown formula.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
