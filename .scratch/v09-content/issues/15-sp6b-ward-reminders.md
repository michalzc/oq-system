# 15: Sp6b: ward reminders with the magnitude in their name

**What to build:** A caster applies Countermagic 3 to themselves, and the token and tracker show the reminder
"Countermagic 3" with its rules. No values change, but the GM can see what to compare an incoming spell against. All eight
wards work this way, and Countermagic's reminder says it ends after its first attempt even if it fails. This is chunk
**Sp6b**; see [the spec](../spec.md), section "Spell batches" (Sp6b) and user stories 13–22, 67, 68.

**Extension agreed when these tickets were cut, not in the spec's extension table.** The spec wants the magnitude in a
ward's name, but the application track copies a template's name unchanged. This ticket adds a template option, "append
cast magnitude to the applied name". It's resolved into the snapshot, so a card always shows the magnitude it was cast
with. Duplicate review keeps matching on the template key, so Countermagic 2 and Countermagic 3 are still flagged as
possible duplicates.

**Blocked by:** 03 (Template invariants and worked-example harness),
[conditions 04 (Icon visibility for marked effects and reminders; tracker tooltips)](../../v09-conditions/issues/04-icon-visibility-and-tracker-tooltips.md)

**Status:** ready-for-agent

- [ ] Templates have an "append cast magnitude to the applied name" option, off by default, in the editor and data model.
- [ ] Snapshot resolution produces the resolved name; templates without the option are unchanged.
- [ ] Countermagic, Spirit Shield, Damage Resistance, Spell Resistance, Spirit Resistance, Spirit Block, Absorption and
      Reflection carry reminder templates using the option, keeping their item ids.
- [ ] Rules text gives each ward's comparison rule and what ends it. Countermagic ends after its first attempt even if it
      fails, and Spell Resistance also blocks beneficial spells.
- [ ] Applied-effects module tests: name resolution with and without the option; a duplicate found across magnitudes.
- [ ] Worked example: Countermagic 3 resolves to its name and changes no value.
- [ ] These rows stay Manual on the coverage page and describe the reminder.
- [ ] The Magic documentation page mentions the option.
- [ ] Manual: on fresh pack copies, the spec's Sp6b row passes, plus a Divine ward from a non-rolled card, with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
