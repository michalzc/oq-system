# 04: Sp1: per-N-magnitude step and movement and combat order spells

**What to build:** A caster succeeds at Haste magnitude 3 and clicks **Apply effect**: the recipient's movement rises by
3m and combat order by 10, because the order bonus counts only full pairs of magnitude. Close Combat tests and Master
status don't change. Mobility, Slow, Hamper and Rout work the same way from the pack, with Slow never below 1m and Hamper
never below 0m. This is chunk **Sp1**; see [the spec](../spec.md), sections "Template capability extensions" (per-N step),
"Template authoring rules" and "Spell batches", and user stories 13–19, 22–27.

A per-magnitude value may carry a step N: contribution = value × floor(magnitude / N), default 1. The editor offers it
and snapshot resolution computes it, so a recorded card keeps the resolved number.

**Blocked by:** 03 (Template invariants and worked-example harness),
[actor-effects 03 (Movement changes with minimum)](../../v09-actor-effects/issues/03-movement-changes.md),
[actor-effects 07 (Group/all selectors, skill multipliers, combat order)](../../v09-actor-effects/issues/07-group-selectors-multipliers-combat-order.md)

**Status:** ready-for-agent

- [ ] Per-magnitude template values can have a step N in the editor and data model; the default is 1 and existing
      templates are unchanged.
- [ ] Snapshot resolution applies the step and rounds odd magnitudes down.
- [ ] The pack's Mobility, Slow, Haste, Hamper and Rout carry the templates in the spec's Sp1 table, keeping their item
      ids. Durations come from each spell's Duration trait.
- [ ] Rout's rules text carries the unit cap, escape direction, no defence and attacks through blockers.
- [ ] Applied-effects module tests cover the step: magnitude 2 and 3 with N 2; default N.
- [ ] Worked examples: the spec's Sp1 rows (MR 15 with Haste 3, Hamper 3 and Slow 8; MR 4 with Hamper 6).
- [ ] Mobility, Slow, Haste and Hamper flip to Automated and Rout to Assisted on the coverage page.
- [ ] The Magic documentation page explains the step.
- [ ] Manual: on fresh pack copies, every Sp1 row passes, including Close Combat 50 with Haste 3 declared (order 60, test
      still 50, not Master), on a character and an NPC with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
