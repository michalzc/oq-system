# 04 — Difficulty modifiers

Status: resolved

Blocked by: 01

Spec: [../spec.md](../spec.md)

Difficulty levels take their modifiers from `CONFIG.OQ.Rules.difficulty`; Normal stays 0.

## Where

- `src/module/consts/rolls-config.js:3-9` — fixed `difficultyLevels`.
- `src/module/application/test-roll-dialog.js:28,39` — `difficultyContext` and `toDifficulty`.
- Any other reader of `RollConfig.difficultyLevels` (grep before changing).

## Work

- Replace the fixed values with a lookup built from `CONFIG.OQ.Rules.difficulty` plus `normal: 0`, keeping the level
  order Easy, Simple, Normal, Difficult, Hard in the dialog.
- The dialog labels already show the value, e.g. "Simple (25%)"; check positive values render with their sign as
  today.

## Tests

- `test/test-roll.js` (or a new test of the lookup): with difficulty +50/+25/−25/−50, `toDifficulty('simple')` gives
  25 and `normal` gives 0.

## Done

- With the requester's values, the test roll, weapon and spell cast dialogs offer ±25/±50 and apply them.
- `yarn test`, `yarn lint`, `yarn build` pass.

## Comments

- 2026-10-20: Implemented in 4f69e98, merged into `feature/rules-customization`; code-review fixes in a61bc6c. Unit tests, lint and `build:code` pass. Not yet verified in a running Foundry world.
