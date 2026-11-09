# 16: Sp6c: sense and permission reminders

**What to build:** A player casts Water Breath and a reminder sits on their sheet and token for its duration, so they
remember what they can do and for how long. Fly's reminder states the flying speed (6m plus 2m per allocated magnitude)
and leaves walking movement alone. Care's reminder tells the Referee to apply the caster's current Protection or
Countermagic to the recipient through their normal cards. This is chunk **Sp6c**; see [the spec](../spec.md), section
"Spell batches" (Sp6c) and user stories 13–22, 69–71.

All these templates are reminder-only and need no new capability. Fly and Care are the reclassifications from Assisted to
Manual already recorded on the Overview page.

**Blocked by:** 03 (Template invariants and worked-example harness),
[conditions 04 (Icon visibility for marked effects and reminders; tracker tooltips)](../../v09-conditions/issues/04-icon-visibility-and-tracker-tooltips.md)

**Status:** ready-for-agent

- [ ] Cushion Fall, Skin of Life, Walk on (Element), Water Breath, Breathe Water, Tongues, Mindspeech, Back Eyes, Babel,
      Fly, Care, Cover Blind Side and Farsight carry reminder templates, keeping their item ids.
- [ ] Durations come from each Duration trait; rolled, concentration and until-used durations carry no clock and say so.
- [ ] Fly and Care carry the wording above and change no value.
- [ ] Every template carries no numeric change.
- [ ] These rows stay Manual on the coverage page and describe the reminder.
- [ ] Manual: on fresh pack copies, Water Breath, Fly (movement unchanged) and Care show their reminders on the token and
      tracker, plus a Divine spell (Breathe Water) from a non-rolled card, with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
