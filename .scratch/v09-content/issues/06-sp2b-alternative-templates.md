# 06: Sp2b: alternative templates, Fear and Madness

**What to build:** A caster succeeds at Fear, and the Apply dialog lists each lasting branch from the Fear Effects table
with checkboxes, none ticked and Confirm disabled. The Referee ticks Shaken for a target that succeeded its Persistence
test, and that target gets −20 to all skill tests. Fear's fumble HP loss and Madness's permanent INT loss stay as manual
instructions, so nothing irreversible happens from a click. Second and last slice of chunk **Sp2**; see
[the spec](../spec.md), sections "Template capability extensions" (alternative templates) and "Spell batches", and user
stories 13–19, 22, 35–38.

When a snapshot holds more than one template, the review dialog lists them; Confirm needs at least one. Each chosen
template creates its own applied effect, and the deterministic effect id includes the template id. One-template snapshots
are unchanged. Before writing code, check how the application track handles several templates on one snapshot. The
non-Shaken branches are reminders.

**Blocked by:** 03 (Template invariants and worked-example harness),
[actor-effects 07 (Group/all selectors, skill multipliers, combat order)](../../v09-actor-effects/issues/07-group-selectors-multipliers-combat-order.md)

**Status:** ready-for-agent

- [ ] A snapshot with several templates shows them as checkboxes, none preselected; Confirm needs at least one.
- [ ] Each chosen template creates its own applied effect with its own deterministic id, so repeat clicks and double
      submits stay safe per branch.
- [ ] One-template snapshots behave exactly as before.
- [ ] The pack's Fear and Madness carry one template per lasting branch, keeping their item ids. Shaken has all skills
      −20. Other branches are reminders. Rules text states the one-off consequences as manual steps.
- [ ] Applied-effects module tests: several templates in a snapshot, none selected refused, per-template ids.
- [ ] Worked example: Fear's Shaken branch gives −20 on a skill test.
- [ ] Fear and Madness flip to Assisted on the coverage page.
- [ ] The Magic documentation page explains alternatives.
- [ ] Manual: the spec's Sp2 "Fear card" row passes on fresh pack copies, plus Madness and a one-template spell, with a
      reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
