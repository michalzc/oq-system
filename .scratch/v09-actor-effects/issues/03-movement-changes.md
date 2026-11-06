# 03: Movement changes with minimum

**What to build:** A Referee adds Mobility (+2m per magnitude) or Slow (−2m per magnitude, never below 1m) to an actor,
and the sheet shows the resulting movement rate with a contributions tooltip. When both apply, the breakdown lists both
so the Referee can adjudicate. This is chunk **Fx2**; see [the spec](../spec.md), sections "Curated change vocabulary"
and "Pure effect-contributions module", and user stories 18–21.

**Blocked by:** 02 (Protection: AP changes and contribution tooltips)

**Status:** ready-for-agent

- [ ] The editor offers a movement rate target with add, multiply and override, and an optional minimum. The change
      data model gains the minimum field.
- [ ] Movement includes its contributions in base data preparation. Fractional results from a multiplier are kept as
      calculated (no rounding).
- [ ] Movement changed by effects shows a marker and a contributions tooltip.
- [ ] Effect-contributions module tests: add, multiply (fractional kept), override, minimum applied last, both
      Mobility and Slow in the breakdown.
- [ ] The Actors documentation page gains Mobility and Slow recipes.
- [ ] Manual: the spec's Fx2 row (MR 15: Mobility +4m; Slow −6m; both; Slow −16m min 1 → 19; 9; 13 with both listed; 1) passes with reloads.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
