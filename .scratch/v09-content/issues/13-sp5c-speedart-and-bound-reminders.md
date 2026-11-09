# 13: Sp5c: Speedart and reminders bound to a weapon

**What to build:** A player applies Pierce and picks their sword from the recipient's weapons. Attacking with that sword,
the dialog's reminders list shows Pierce and its "ignore magnitude AP" rule; attacking with their dagger, it doesn't. If
the sword is deleted, the applied effect shows a missing target with rebind or end, as Weapon Enhance does. Speedart gives
its chosen missile weapon +20 to hit and +3 damage until someone ends it after the shot. Last slice of chunk **Sp5**; see
[the spec](../spec.md), section "Spell batches" (Sp5 table), and user stories 13–19, 22, 61, 62.

**Extension agreed when these tickets were cut, not in the spec's extension table.** Application 09 attaches binding
requirements to weapon hit and damage *changes*, but Pierce, Multimissile and Sureshot are reminders with no changes. This
ticket lets a template with no changes require a weapon binding. The reminder then appears only on that weapon's tests, and
it stays non-numeric, so the Manual treatment and the pack-content invariant still hold.

**Blocked by:** 03 (Template invariants and worked-example harness),
[application 09 (Weapon Enhance binds to a chosen weapon; missing target, rebind or end)](../../v09-application/issues/09-weapon-enhance-binding.md)

**Status:** ready-for-agent

- [ ] A template with no changes can require a weapon binding, in the editor and snapshot.
- [ ] The review asks for the weapon as it does for Weapon Enhance. The applied effect records it and follows the same
      missing-target, rebind and end behaviour.
- [ ] A bound reminder appears in the test dialog's reminders only on tests of the bound weapon. Unbound reminders behave
      as before.
- [ ] A binding doesn't count as a numeric change for the coverage invariant.
- [ ] The pack's Speedart carries bound hit +20 and damage +3, applied unconditionally, with "ends after firing" and its
      Firearrow and Multimissile exclusions in the rules text.
- [ ] The pack's Pierce, Multimissile and Sureshot carry bound reminders. Each spell keeps its item id, and the rules text
      of the missile spells says they're for a missile weapon.
- [ ] Applied-effects module tests: a binding requirement on a no-change template. Effect-contributions module tests:
      reminder selection for the bound weapon and another weapon.
- [ ] Worked example: Speedart on the bound and an unbound weapon.
- [ ] Speedart flips to Assisted; Pierce, Multimissile and Sureshot state their reminder behaviour under Manual.
- [ ] The Magic documentation page explains bound reminders.
- [ ] Manual: on fresh pack copies, Pierce on one of two weapons shows only on that weapon's test; delete the weapon and
      rebind; Speedart adds its bonuses until ended. Run with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
