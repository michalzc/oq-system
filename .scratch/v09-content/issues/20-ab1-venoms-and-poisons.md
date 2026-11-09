# 20: Ab1: venoms and poisons

**What to build:** A basilisk's victim has failed its resistance. The Referee clicks **Use ability** on Basilisk Venom,
with no roll and no MP, and applies it. The victim's CON drops by 6, HP maximum and current fall by the same amount, and
the token shows Poisoned. Ending the effect restores both. The immediate and recurring HP damage stays an instruction, so
it's applied once, by hand. Ghoul Venom shows Paralysed with its "ends when healing restores at least 1 HP" rule. This is
chunk **Ab1**; see [the spec](../spec.md), sections "Creature ability pack", "Template authoring rules" and "Creature
ability batches" (Ab1 table), and user stories 76–79, 81–86.

Rolled durations (6D10 minutes) are stated in the rules text and left off the template clock. Each item quotes its
potency, delay and the SRD's ingested-versus-sting wording. Giant Spider and Viper quote the full Animal List rule and
cite it, because the journal has no page for them.

**Blocked by:** 03 (Template invariants and worked-example harness), 17 (SRD Creature Abilities compendium and rules-text
items, Basilisk to Mummy),
[actor-effects 05 (HP/MP maximum effects move current points)](../../v09-actor-effects/issues/05-maximum-current-transitions.md),
[application 07 (Ability templates, Use ability and Apply on rolled abilities)](../../v09-application/issues/07-ability-templates-use-ability.md),
[conditions 05 (Markers on effect templates and applied effects)](../../v09-conditions/issues/05-markers-on-templates.md)

**Status:** ready-for-agent

- [ ] The seven items in the spec's Ab1 table exist with their numbers, markers and rules text.
- [ ] Giant Spider Venom lowers DEX by 6, with paralysis at DEX 0 as a reminder.
- [ ] HP damage appears only as an instruction and never happens during preparation.
- [ ] Worked examples: the spec's Basilisk row and a DEX venom.
- [ ] Six items flip to Assisted, Ghoul Venom stays Manual, and all seven rows link their items.
- [ ] Manual: on fresh copies, both of the spec's Ab1 rows pass (Basilisk Venom applied and ended; Ghoul Venom still
      Paralysed after healing 2 HP until ended by hand), on a character and an NPC, with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
