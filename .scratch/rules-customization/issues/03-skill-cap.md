# 03 — Skill cap

Status: ready-for-agent

Blocked by: 01

Spec: [../spec.md](../spec.md)

With `CONFIG.OQ.Rules.skillCap` off, skill values are no longer clamped at 100%. The floor at 0 stays.

## Where

- `src/module/utils/utils.js:19` — `minMaxValue` (clamps to 0..100).
- `src/module/utils/roll.js:25,60` — `MAX_VALUE` and the Modified skill in `evaluateTestRoll`.
- `src/module/document/item/skill.js:36-37` — skill value and value with modifier.
- `src/module/document/item/weapon.js:33` — weapon value with modifier.
- `src/module/document/item/special-ability.js:19` — rolled special-ability value.

## Work

- Replace the fixed 0..100 clamp with one that takes the upper limit from the rules (100 when capped, none when
  uncapped), used at every site above.
- Mastery checks (`>= 100`) are unaffected: they compare against 100, not the cap.

## Tests

- `test/test-utils.js`: the clamp keeps 0 as the floor in both modes and caps at 100 only when `skillCap` is on.
- `test/test-roll.js`: uncapped, a 120% skill at Difficult −20 rolls against 100; a 150% skill rolls against 150.

## Done

- In an uncapped world a skill with advancement above 100% shows its full value on the character and NPC sheets, and
  its weapons show the same value.
- `yarn test`, `yarn lint`, `yarn build` pass.
