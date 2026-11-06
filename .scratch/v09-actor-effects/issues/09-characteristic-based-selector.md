# 09: Characteristic-based skill selector

**What to build:** A Referee adds Befuddle (−20 to INT-based skills) without listing skills: only skills whose own
formula directly references INT are affected. Lore (`@int`) gets −20, while a fixed `70` skill and Dodge (`@dex+10`)
don't. Athletics (`@dex+@str`) matches both STR and DEX selectors, so Strength's and Coordination's conditional entries
both appear when it is tested. Part of chunk **Fx6a**; see [the spec](../spec.md), sections "Pure effect-contributions
module" (characteristic reference matching) and "Test resolution" (matching), and user stories 59–61.

Matching reads only the skill's own base formula and returns the set of directly referenced characteristics. Braced
references count. `70` and `@skills.x.value` give none. There is no recursion, name inference or algebra.

**Blocked by:** 06 (Named-skill test modifiers and the strongest magic modifier)

**Status:** ready-for-agent

- [ ] The skill test modifier target gains a characteristic-based selector (one characteristic) in the editor and data
      model.
- [ ] Skill, weapon and casting tests match through the referenced skill's own formula; rolled special-ability tests
      match against the ability's own formula.
- [ ] Effect-contributions module tests: `@int+@pow` → INT, POW; braced references; `70` and `@skills.x.value` → none;
      a formula whose characteristic term cancels still counts as a direct reference; selector matching per skill.
- [ ] The Actors documentation page gains a Befuddle recipe.
- [ ] Manual: the spec's Fx6a rows "Befuddle −20 INT-based" and "Athletics `@dex+@str`, Strength and Coordination
      conditionals, Ironmind on Persistence" pass (the latter once ticket 08 is in).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
