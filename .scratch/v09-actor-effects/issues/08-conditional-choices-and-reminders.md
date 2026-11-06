# 08: Conditional choices and reminders in the test dialog

**What to build:** A Referee marks a skill test change as conditional with a human-readable condition ("STR-based
Athletics only"). When a player opens a matching skill or weapon test, the dialog lists it unchecked, with source,
condition and contribution. Ticking it counts only for that roll, under the strongest-modifier rule, and the result card
records the selected entries. Nothing is consumed; next time it is unchecked again. A separate reminders section lists
the rules text of effects that contribute unconditionally to the test and of active reminder-only effects. Cancelling
changes nothing. First slice of chunk **Fx6a**; see [the spec](../spec.md), section "Test resolution", and user
stories 55–58, 62, 63, 65.

**Blocked by:** 07 (Group/all selectors, skill multipliers, combat order)

**Status:** ready-for-agent

- [ ] Skill test changes gain a conditional flag and condition text in the editor and data model.
- [ ] Conditional changes are never applied automatically. The dialog lists only those matching the current test,
      unchecked every time; selection is not stored on the effect.
- [ ] Selected conditional choices join the unconditional modifiers in the strongest-magic-modifier selection.
- [ ] The dialog shows a reminders section listing the rules text of active effects contributing unconditionally to
      this test, plus active reminder-only effects.
- [ ] The result card lists the selected conditional entries and their contribution.
- [ ] Effect-contributions module tests: conditional choices listed only on matching tests, reminder selection.
- [ ] Roll test file: selected conditional choices in the Modified skill.
- [ ] The Rolls documentation page explains conditional choices and reminders.
- [ ] Manual: the spec's Fx6a row "Skill 60, conditional +20 matching it" (60 unchecked; 80; card lists entry;
      unchecked again, effect intact) passes, plus cancel-changes-nothing.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
