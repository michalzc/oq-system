# 01 — Rules config and settings storage

Status: resolved

Spec: [../spec.md](../spec.md)

Foundation for the other issues: the SRD Rule Option values, the world setting that stores the GM's choices, and the
`CONFIG.OQ.Rules` snapshot every rule reads from. No behaviour changes yet.

## Where

- `src/module/consts/` — new `rules-config.js` (SRD values, option keys, enum values for critical and fumble rules),
  aggregated in `consts/consts.js`.
- `src/module/consts/settings-config.js` — setting key.
- `src/module/init/register-settings.js:17` — register the setting.
- `src/module/oq.js:18-28` — resolve the snapshot into `CONFIG.OQ.Rules` after `registerSettings()`.
- `src/lang/en.yaml` — labels for the options and their choices (`OQ.Settings.rules.*`).

## Work

- Define the SRD values once: `skillCap: true`, `criticalRule: 'doubles'` (alternative `'tenth'`),
  `fumbleRule: 'doubles'` (alternative `'hundred'`), `mastery: true`,
  `difficulty: { easy: 50, simple: 20, difficult: -20, hard: -50 }`.
- Register one world setting holding all Rule Options (`config: false`, `requiresReload: true`), typed by a
  `SchemaField` that enforces the ranges from the spec (integers; Easy/Simple 0..100, Difficult/Hard −100..0;
  choices for the two rule enums). One setting keeps saves atomic and gives one reload prompt.
- In `init`, after registering, set `CONFIG.OQ.Rules` to the stored value (falling back to SRD values). Check that
  world settings are readable during `init` in Foundry 14 (`foundryvtt-api`); otherwise move the snapshot to `setup`,
  before anything prepares documents.
- Export a pure helper `isSrdRules(rules)` (deep-equals the SRD values) for the preset combo in 05.

## Tests

- `test/test-rules-config.js`: `isSrdRules` is true for the SRD values and false when any single option differs.

## Done

- `CONFIG.OQ.Rules` equals the SRD values in a fresh world; a value written to the setting shows up in
  `CONFIG.OQ.Rules` after reload.
- `yarn test`, `yarn lint`, `yarn build` pass.

## Comments

- 2026-10-20: Implemented in f67e131, merged into `feature/rules-customization`; code-review fixes in a61bc6c. Unit tests, lint and `build:code` pass. Not yet verified in a running Foundry world.
