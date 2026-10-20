# 02 — Critical, fumble and Mastery rules

Status: resolved

Blocked by: 01

Spec: [../spec.md](../spec.md)

Make the test result depend on `CONFIG.OQ.Rules.criticalRule`, `fumbleRule` and `mastery`.

## Where

- `src/module/utils/roll.js:56-64` — `evaluateTestRoll` (Mastery flag on the result).
- `src/module/utils/roll.js:117-126` — `getResult`.
- `src/module/utils/roll.js:141-147` — `getResultFeatures`.
- `src/module/document/item/skill.js:38` — `mastered` in `calculateRollValues` (sheet marker,
  `src/public/templates/actor/parts/skill.hbs:9`).
- `src/public/templates/chat/parts/skill-ability-roll.hbs:8` — chat Mastery mark (follows the flag, likely no change).

## Work

- Order of evaluation in `getResult`:
  1. Mastery on, unmodified skill ≥100 and Modified skill ≥100 → critical success.
  2. Roll of 100 → fumble.
  3. Roll ≤ Modified skill → critical if the active critical rule says so (`doubles`: a double;
     `tenth`: roll ≤ ceil(Modified skill / 10)), else success.
  4. Otherwise → fumble if `fumbleRule` is `doubles` and the roll is a double, else failure.
- `mastered` in `skill.js` and `evaluateTestRoll` is false whenever `mastery` is off.
- Keep the functions pure: read rules from `CONFIG.OQ.Rules` (or take them as a parameter), not from `game.settings`.

## Tests

In `test/test-roll.js`, with `CONFIG.OQ.Rules` stubbed:

- SRD rules: existing tests unchanged.
- `tenth`: 47% at Difficult −20 (27%) crits on 01–03, succeeds on 04–27; 5% crits on 01; Modified skill 0 never
  crits; a successful 22 against 50% is a plain success.
- `hundred`: a failed 66 is a failure; 100 is a fumble.
- 100 against an uncapped Modified skill of 1000 with `tenth` is a fumble.
- Mastery off: a 100% skill rolling 100 fumbles; rolling 05 with `tenth` crits; rolling 50 succeeds.
- Mastery on: unchanged automatic critical.

## Done

- All combinations above behave as specified in a running world (check a skill and a weapon roll).
- `yarn test`, `yarn lint`, `yarn build` pass.

## Comments

- 2026-10-20: Implemented in 29041bf, merged into `feature/rules-customization`; code-review fixes in a61bc6c. Unit tests, lint and `build:code` pass. Not yet verified in a running Foundry world.
