# 10: Sp4b: damage additions, Befuddle, Hinder and Sun Disc

**What to build:** Strength 2 adds +2 to the recipient's weapon damage without changing STR, and offers its Athletics
bonus unchecked for STR-based uses. Hinder 2 bound to Stealth lists −20 unchecked on Stealth tests and nothing on
Perception. Befuddle subtracts 20 from skills whose formula directly references INT. Enhance Unit adds 1D6 to the damage
of the troops it's applied to. Sun Disc offers two alternatives, the caster's cold resistance and a blinded target, so
the two don't get mixed up. Second and last slice of chunk **Sp4**; see [the spec](../spec.md), section "Spell batches"
(Sp4 table), and user stories 13–19, 22, 48, 50–53, 55.

This is template authoring only, with no new capability. Hinder uses the identity binding from application 10 and its
rules text says to end it after use. Sun Disc's blinded alternative carries the Blinded marker.

**Blocked by:** 05 (Sp2a: standard-skill selector and skill test spells), 06 (Sp2b: alternative templates, Fear and
Madness),
[actor-effects 08 (Conditional choices and reminders in the test dialog)](../../v09-actor-effects/issues/08-conditional-choices-and-reminders.md),
[actor-effects 09 (Characteristic-based skill selector)](../../v09-actor-effects/issues/09-characteristic-based-selector.md),
[actor-effects 10 (Actor-wide weapon damage addition)](../../v09-actor-effects/issues/10-actor-wide-weapon-damage.md),
[application 10 (Enhance Skill binds to a chosen skill)](../../v09-application/issues/10-enhance-skill-binding.md),
[conditions 05 (Markers on effect templates and applied effects)](../../v09-conditions/issues/05-markers-on-templates.md)

**Status:** ready-for-agent

- [ ] The pack's Strength, Befuddle, Hinder (Skill), Enhance Unit and Sun Disc carry the templates in the spec's Sp4
      table, keeping their item ids.
- [ ] Sun Disc has two alternatives: the caster's resistance-group +50 conditional "against cold", and the target's
      Blinded with its 1D4-hour duration stated in the rules text and no clock.
- [ ] Rules text carries each remainder: Befuddle's restrictions, Enhance Unit's limit of 30 and its immunities, Hinder's
      "end after use".
- [ ] Worked examples: Strength 2, Befuddle on an INT-based and a non-INT skill, Enhance Unit, Hinder 2 bound to a skill.
- [ ] These spells' coverage rows flip to their target treatments.
- [ ] Manual: on fresh pack copies, the spec's Sp4 Hinder row and the Strength part of its Athletics row pass, with
      Coordination if ticket 09 has merged. Sun Disc applied to a target shows the Blinded marker, and the caster's
      alternative shows no marker. Run on a character and an NPC with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
