# 14: Sp6a: condition and behaviour spells, Earth Scream and Venom

**What to build:** A caster applies Block Sense, chooses Deafened, and the target's token shows Deafened and not Blinded.
Glue, Invisibility, Palsy, Slip and Venom carry their palette markers with their own escape and ending rules. Scare,
Vomit, Puppet, Dominate and Earth Scream leave a named reminder on the affected creature. Earth Scream and Venom, two real
SRD spells that were missing, are now in the spells pack. This is chunk **Sp6a**; see [the spec](../spec.md), section
"Spell batches" (Sp6a table) and "Template authoring rules", and user stories 13–22, 64–66, 72, 73.

All these templates are reminder-only, so their treatment stays Manual. The new items follow the pack's existing Divine
and Sorcery conventions and use generated stable ids.

**Blocked by:** 03 (Template invariants and worked-example harness), 06 (Sp2b: alternative templates, Fear and Madness),
[conditions 04 (Icon visibility for marked effects and reminders; tracker tooltips)](../../v09-conditions/issues/04-icon-visibility-and-tracker-tooltips.md),
[conditions 05 (Markers on effect templates and applied effects)](../../v09-conditions/issues/05-markers-on-templates.md)

**Status:** ready-for-agent

- [ ] The spells pack has Earth Scream (Divine) and Venom (Sorcery) with their SRD traits and rules and stable ids.
- [ ] Their coverage rows link the new items, and the row count is unchanged.
- [ ] Block Sense has three alternatives: Blinded, Deafened and an "other sense" reminder.
- [ ] Glue, Invisibility, Palsy, Slip and Venom carry the palette markers in the spec's Sp6a table, with their rules text.
- [ ] Scare, Vomit, Puppet, Dominate (Species) and Earth Scream carry reminders with their behaviour and ending.
- [ ] Venom's reminder gives potency, onset and per-round damage.
- [ ] Existing items keep their ids; every template carries no numeric change.
- [ ] These rows stay Manual on the coverage page and describe the reminder.
- [ ] Manual: on fresh pack copies, the spec's Sp6a rows pass, and a Glue target shows Stuck on the token and tracker with
      its rules, with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
