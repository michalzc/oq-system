# 11: Choices and reminders in casting and rolled-ability dialogs

**What to build:** A player casting an MP spell or rolling a special ability sees the same matching conditional choices
(Ironmind against mental magic, Hinder on the next relevant test) and reminders section as in skill tests, and the
result card records the selection and the reminders. Non-rolled Divine casting stays unchanged: no skill test or
checkbox is invented. First slice of chunk **Fx6b**; see [the spec](../spec.md), section "Test resolution", and user
stories 70, 71.

**Blocked by:** 08 (Conditional choices and reminders in the test dialog), 09 (Characteristic-based skill selector)

**Status:** ready-for-agent

- [ ] The spell cast dialog lists conditional choices matching its casting skill, unchecked, and a reminders section.
- [ ] Rolled special-ability dialogs list conditional choices matching the all-skills selector or characteristic
      selectors against the ability's own formula, and a reminders section.
- [ ] Selected choices join the strongest-magic-modifier selection; the result card shows selected entries and
      reminders.
- [ ] Non-rolled Divine casting is unchanged.
- [ ] The Rolls documentation page covers casting and ability dialogs.
- [ ] Manual: an MP spell with a matching conditional on its casting skill and a rolled ability with an all-skills
      conditional each list and apply the choice; a Divine spell is unchanged.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
