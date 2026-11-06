# 06: Named-skill test modifiers and the strongest magic modifier

**What to build:** A Referee adds Enhance Skill +10 to one named skill. Tests of that skill, and weapon and casting
tests that use it, roll against the higher Modified skill, while the learned skill and Master status are unchanged
(skill 95 + 10 rolls against 100, not mastered). When several magic modifiers apply, only the strongest counts,
independently of difficulty. Equal and opposite modifiers are shown as a tie and neither is applied. The test dialog
and result card show the magic modifier and its source. First slice of chunk **Fx5**; see [the spec](../spec.md),
sections "Test resolution" and "Pure effect-contributions module" (skill test contributions, missing targets), and user
stories 43, 46–50, 53, 54.

The Modified skill is: effective skill value, plus difficulty, plus the single strongest magic modifier, plus the
dialog's existing "other modifier" field (prefill from native modifiers kept, still editable). Skills expose their
effect test contributions to weapons and spells that reference them. A named selector binds by skill identity. When
that skill is deleted, the effect shows a missing target and contributes nothing until someone rebinds it in the
editor. It never attaches to a same-named skill.

**Blocked by:** 02 (Protection: AP changes and contribution tooltips)

**Status:** ready-for-agent

- [ ] The editor offers a skill test modifier target with a named-skill selector and add. The change data model gains
      the selector field.
- [ ] Skill, weapon and MP casting tests apply the strongest magic modifier from matching unconditional changes. Ties
      between equal and opposite modifiers are reported with both sources and neither is applied.
- [ ] Test modifiers never change the learned skill, effective skill value or Master eligibility.
- [ ] Test dialog and result card show the applied magic modifier and its source, or the tie.
- [ ] A deleted named target shows a "missing target" state on the Effects list row and in the editor, and contributes
      nothing. The editor can rebind it to an existing skill.
- [ ] Effect-contributions module tests: named matching, strongest selection, ties, missing target.
- [ ] Roll test file: Modified skill with difficulty, magic modifier and other-modifier field; skill 95 + 10 not
      mastered; skill 60, difficulty +20, magic +20 and −30 → 50.
- [ ] The Rolls documentation page explains the magic modifier, the one-modifier rule and ties; the Actors page gains
      an Enhance Skill recipe.
- [ ] Manual: the spec's Fx5 rows "Skill 95: Enhance Skill +10", "Skill 60, +20 and −30 at difficulty +20", "Skill 60,
      +20 and −20" and "Enhance bound to skill A: delete A, import same-named skill" pass, with reloads.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
