# 08: Sp3b: value entered at application, Shapechange and Mischief

**What to build:** A caster applies Shapechange to a human with STR 12 and SIZ 13, and the review asks for the new form's
STR, DEX, CON and SIZ. Entering 30, 12, 20 and 30 overrides those values and recalculates the Damage Modifier and HP
maximum, while INT, POW and CHA stay put; anatomy and abilities remain the Referee's job. A blank or fractional value
keeps Confirm disabled. Mischief offers each lasting result from its table as an alternative after the D20 is rolled.
Second and last slice of chunk **Sp3**; see [the spec](../spec.md), sections "Template capability extensions" (value
entered at application) and "Spell batches", and user stories 13–19, 22, 44–46.

A change value may be "entered at application", with a label ("New STR", "Spirit's POW") and a sign. The review asks for a
whole number and shows the resolved change; Confirm needs every value. Spirit abilities reuse this in ticket 21.

**Blocked by:** 05 (Sp2a: standard-skill selector and skill test spells), 06 (Sp2b: alternative templates, Fear and
Madness), [actor-effects 05 (HP/MP maximum effects move current points)](../../v09-actor-effects/issues/05-maximum-current-transitions.md)

**Status:** ready-for-agent

- [ ] A template change value can be entered at application, with a label and sign, in the editor and data model.
- [ ] The review asks for each entered value, accepts only whole numbers, shows the resolved change and keeps Confirm
      disabled until every value is valid.
- [ ] Entered values work on spell and ability templates.
- [ ] The pack's Shapechange carries STR, DEX, CON and SIZ overrides entered at application, with anatomy, abilities and
      the magnitude example in its rules text, keeping its item id.
- [ ] The pack's Mischief offers each lasting result as an alternative: test penalties and half SIZ numeric, others
      reminders. One-off results stay in the rules text.
- [ ] Applied-effects module tests: entered values in a snapshot, invalid and missing values refused, signs.
- [ ] Worked examples: the spec's Shapechange row and one numeric Mischief result.
- [ ] Shapechange and Mischief flip to Assisted on the coverage page.
- [ ] The Magic documentation page explains entered values.
- [ ] Manual: on fresh pack copies, the Sp3 Shapechange row passes on a character and an NPC with a reload, plus a
      refused fractional value and a Mischief numeric and reminder result.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
