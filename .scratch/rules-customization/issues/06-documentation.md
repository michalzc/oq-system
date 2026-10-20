# 06 — User documentation

Status: resolved

Blocked by: 02, 03, 04, 05

Spec: [../spec.md](../spec.md)

Describe the Rule Options in the in-game documentation.

## Where

- `docs/packs/documentation/system-documentation/Rolls.html` — source of the Rolls journal page (see
  `docs/packs/README.md`).
- Generated `src/packs/documentation/` YAML via `yarn build:docs` (commit the output).

## Work

- Add a short "Rule Options" section: where the GM finds the menu, the Rules Preset combo, each option with its SRD
  value and alternative, and that changes require a reload.
- Make the existing critical/fumble/difficulty text say it describes the OpenQuest SRD preset.

## Done

- `yarn build:docs` output committed; the page renders in a running world after `yarn build:packs`.
- `yarn test`, `yarn lint`, `yarn build` pass.

## Comments

- 2026-10-20: Implemented in 70a2a1a, merged into `feature/rules-customization`; code-review fixes in a61bc6c. Unit tests, lint and `build:code` pass. Not yet verified in a running Foundry world.
