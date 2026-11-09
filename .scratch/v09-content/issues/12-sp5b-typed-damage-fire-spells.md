# 12: Sp5b: typed damage term, Fireblade and Firearrow

**What to build:** A player applies Fireblade to a 1D8 sword, attacks and rolls damage. The card shows 1D8 normal and
1D10 fire as separate labelled components, so the GM can tell fire from normal damage. Firearrow adds its 1D10 fire to
the chosen missile weapon, and its rules text tells the GM to edit the damage dialog when ruling that fire replaces
normal damage. Part of chunk **Sp5**; see [the spec](../spec.md), sections "Template capability extensions" (typed damage
term) and "Spell batches", and user stories 13–19, 22, 59, 60, 63.

An added damage term may carry a damage type label. The damage basis and card show it as a separate labelled component.
There are no damage-type immunity or resistance rules: the label is information for the table.

**Blocked by:** 03 (Template invariants and worked-example harness),
[application 08 (Damage basis on test cards)](../../v09-application/issues/08-damage-basis-snapshot.md),
[application 09 (Weapon Enhance binds to a chosen weapon; missing target, rebind or end)](../../v09-application/issues/09-weapon-enhance-binding.md)

**Status:** ready-for-agent

- [ ] Damage additions can carry a damage type label, in the editor and data model.
- [ ] The damage basis keeps the typed term separate, and the damage card shows it with its label.
- [ ] Damage terms without a label look exactly as before.
- [ ] The pack's Fireblade and Firearrow carry the templates in the spec's Sp5 table, keeping their item ids. Rules text
      covers burning, the exclusions (Weapon Enhance, others listed in the spec) and Firearrow's replacement reading.
- [ ] Firearrow's rules text says it's for a missile weapon; the dialog needs no new weapon filter.
- [ ] Effect-contributions module and roll tests: a typed term survives basis capture and formula building.
- [ ] Worked example: the spec's Fireblade row.
- [ ] Fireblade and Firearrow flip to Assisted on the coverage page.
- [ ] The Magic documentation page explains typed damage terms.
- [ ] Manual: on fresh pack copies, the spec's Fireblade row passes, plus Firearrow on a bow and an edited damage dialog
      for the replacement reading, with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
