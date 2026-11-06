# 07: Group/all selectors, skill multipliers, combat order

**What to build:** A Referee applies Demoralise (combat skills halved) with one change: a sword test at Close Combat 65
rolls against 32 while Dodge is unaffected. Fanaticism-style effects target a skill group or all skills. Coordination
raises combat order (+10% per magnitude) without raising DEX, and skill test modifiers never reorder the round. Second
and last slice of chunk **Fx5**; see [the spec](../spec.md), sections "Curated change vocabulary", "Actor preparation
order" (step 3) and "Test resolution" (matching), and user stories 44, 45, 51, 52.

**Blocked by:** 06 (Named-skill test modifiers and the strongest magic modifier)

**Status:** ready-for-agent

- [ ] The skill test modifier target gains skill-group and all-skills selectors, and a multiply operation that rounds
      down. A multiplier applies to the effective skill value before difficulty and the magic modifier.
- [ ] Rolled special-ability tests match the all-skills selector against the ability's own value.
- [ ] The editor offers a combat order target (add). Combat order adds its contributions to the declared item's value
      in derived data and shows a contributions tooltip. Skill test modifiers never reach combat order.
- [ ] The dialog and card show the multiplier and its source.
- [ ] Effect-contributions module tests: group and all matching, multiplier rounding (65 halved → 32), combat order
      contributions separate from test modifiers.
- [ ] The Actors and Rolls documentation pages gain Demoralise and Coordination recipes.
- [ ] Manual: the spec's Fx5 rows "Close Combat 65, Demoralise ×0.5 combat group" and "Declared Close Combat 50,
      Coordination +20 order, +20 Dodge" pass, including the combat tracker declaration.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
