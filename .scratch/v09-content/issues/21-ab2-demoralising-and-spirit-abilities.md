# 21: Ab2: demoralising and spirit abilities

**What to build:** A ghoul howls. The Referee clicks **Use ability** on Ghoul Howl and applies it to two targets, one
after another or together once multiple recipients exist. Each target's combat skills are halved and its reminders are
visible, with no roll and no MP. Applying Disease Spirit Possession asks for the spirit's POW: entering 12 gives Resilience
−12 with no clock, because possession lasts until the spirit is ousted. This is chunk **Ab2**; see [the
spec](../spec.md), section "Creature ability batches" (Ab2 table), and user stories 76, 78, 79, 87–91.

Ghoul Howl, Mocking Laughter and Fear Spirit Possession reuse Demoralise's numbers and reminders. The Healing spirit's
bonus is an unchecked choice on Resilience tests against mundane illness. Pain Spirit Possession states its ambiguity, so
the Referee can disable the applied effect between spasms under the other reading.

**Blocked by:** 05 (Sp2a: standard-skill selector and skill test spells), 08 (Sp3b: value entered at application,
Shapechange and Mischief), 17 (SRD Creature Abilities compendium and rules-text items, Basilisk to Mummy),
[actor-effects 08 (Conditional choices and reminders in the test dialog)](../../v09-actor-effects/issues/08-conditional-choices-and-reminders.md),
[application 07 (Ability templates, Use ability and Apply on rolled abilities)](../../v09-application/issues/07-ability-templates-use-ability.md)

**Status:** ready-for-agent

- [ ] The six items in the spec's Ab2 table exist with their templates and rules text, in the Ghoul, Pentaghast and
      Spirits folders.
- [ ] Disease, Pain and Healing spirit abilities ask for the spirit's POW at application.
- [ ] Possession effects carry no clock and say they last until the spirit is ousted.
- [ ] Healing Spirit Aid is offered unchecked on Resilience tests, and its rules text says to end it after use.
- [ ] Worked examples: the spec's Ghoul Howl and Disease Spirit rows, and Healing Spirit with its choice selected.
- [ ] These six rows flip to Assisted and link their items.
- [ ] Manual: on fresh copies, both of the spec's Ab2 rows pass, on a character and an NPC, with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
