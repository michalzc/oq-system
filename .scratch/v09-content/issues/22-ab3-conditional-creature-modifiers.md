# 22: Ab3: conditional creature modifiers

**What to build:** A gargoyle with Statue-Like Stillness tests Deception and sees +50 offered unchecked; ticking it applies
the bonus once. Bloodweed's plant cover and the Elemental's hidden-character detection work the same way on the creature's
own tests. A slime's victim gets Envelop's −40 Athletics offered only as a choice on escape or substitute-Dodge tests,
with the Held marker, so ordinary Athletics isn't penalised. This is chunk **Ab3**; see [the spec](../spec.md), section
"Creature ability batches" (Ab3 table), and user stories 76, 79, 92, 93.

The first three are owner passives on the creature's own ability, switched on. Envelop is a template applied to the
victim, and it's the only one that uses Use ability.

**Blocked by:** 05 (Sp2a: standard-skill selector and skill test spells), 17 (SRD Creature Abilities compendium and
rules-text items, Basilisk to Mummy),
[actor-effects 08 (Conditional choices and reminders in the test dialog)](../../v09-actor-effects/issues/08-conditional-choices-and-reminders.md),
[application 07 (Ability templates, Use ability and Apply on rolled abilities)](../../v09-application/issues/07-ability-templates-use-ability.md),
[conditions 05 (Markers on effect templates and applied effects)](../../v09-conditions/issues/05-markers-on-templates.md)

**Status:** ready-for-agent

- [ ] The four items in the spec's Ab3 table exist with their definitions and rules text. Statue-Like Stillness applies
      the Overview page's reading of the gargoyle's "50% modifier" as +50.
- [ ] Passives use the standard-skill selector, so they work on any creature with an ordinary skill name and survive
      being dragged to another actor.
- [ ] Envelop's enmeshed acid is a reminder, and it carries the Held marker.
- [ ] Worked examples: the spec's Ab3 row, and Envelop's conditional selected and unselected.
- [ ] These rows flip to Assisted and link their items.
- [ ] Manual: on fresh copies, the spec's Ab3 row passes, plus Envelop applied to a victim, on a linked and an unlinked
      NPC, with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
