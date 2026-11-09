# 07: Sp3a: characteristic chosen at application, Enhance, Diminish and Mindblast

**What to build:** A caster applies Enhance (characteristic) magnitude 3 and the review asks which characteristic. They
pick STR: STR goes from 12 to 15, the Damage Modifier recalculates, and it stays that way after a reload. Enhance CON
moves HP maximum and current together, Enhance POW leaves MP alone, Diminish never goes below 1 and Mindblast never below
0. One pack spell covers all seven variants. First slice of chunk **Sp3**; see [the spec](../spec.md), sections "Template
capability extensions" (characteristic chosen at application) and "Spell batches", and user stories 13–19, 22, 39–43.

A characteristic change may target "the characteristic chosen at application". The review asks for one of the seven and
the applied effect records it as a fixed characteristic. This extends the binding requirement from application 09;
characteristics never go missing, so there is no missing-target state or rebind.

**Blocked by:** 03 (Template invariants and worked-example harness),
[actor-effects 05 (HP/MP maximum effects move current points)](../../v09-actor-effects/issues/05-maximum-current-transitions.md),
[application 09 (Weapon Enhance binds to a chosen weapon; missing target, rebind or end)](../../v09-application/issues/09-weapon-enhance-binding.md)

**Status:** ready-for-agent

- [ ] A template characteristic change can target the characteristic chosen at application, in the editor and data model.
- [ ] The review lists the seven characteristics and keeps Confirm disabled until one is chosen.
- [ ] The applied effect records a fixed characteristic and survives a reload.
- [ ] The pack's Enhance (characteristic), Diminish (characteristic) and Mindblast carry the templates in the spec's Sp3
      table, keeping their item ids. Diminish has minimum 1 and Mindblast minimum 0; Mindblast's CHA-days duration is a
      reminder.
- [ ] Applied-effects module tests: the requirement in a snapshot, a missing choice, the resolved fixed characteristic.
- [ ] Worked examples: the spec's Sp3 rows for Enhance STR, Enhance CON, Enhance POW and Mindblast.
- [ ] These spells flip to Automated on the coverage page.
- [ ] The Magic documentation page explains the choice.
- [ ] Manual: on fresh pack copies, the Sp3 rows above pass on a character and an NPC with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
