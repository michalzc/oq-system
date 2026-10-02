# Repository Guidelines

## Project Structure & Module Organization

This repository implements the OpenQuest SRD system for Foundry VTT 13.

- `src/module/`: JavaScript ES modules; `oq.js` initializes documents, data models, sheets, dialogs, and hooks.
- `src/public/`: Handlebars templates, fonts, and runtime assets; `src/styles/`: Less stylesheets.
- `src/system.yaml`, `src/template.yaml`, and `src/lang/en.yaml`: manifest, document types, and localization.
- `src/packs/`: YAML compendium sources; `CSV/` and `scripts/`: content data and maintenance utilities.
- `test/`: unit tests; `assets/docs/`: documentation images.

Edit source files, not generated `build/` output. `tools/build-packs.mjs` compiles compendia; Vite bundles JavaScript, compiles Less, converts YAML to JSON, and copies public assets.

## Build, Test, and Development Commands

Use Yarn 1 with Node.js `^20.19` or `>=22.12` (22 recommended). Nix is optional: nothing in the build, lint, or tests depends on it. `nix develop` (or direnv) provides Node 22, Yarn, Foundry VTT 13.351, and the `start-dev` / `start-foundry` launchers.

- `yarn install`: install dependencies and Git hooks.
- `yarn build`: generate the distributable system in `build/`.
- `yarn build:packs`: replace generated compendia with Foundry stopped.
- `yarn build:code`: build code, Less, metadata, and public assets while preserving compendia.
- `yarn build:watch`: rebuild code and assets when sources change.
- `start-dev` / `start-dev --watch` (Nix shell only): build, link the system, create or launch `oq-dev`, and open Chromium; optionally watch code and assets.
- `yarn dev`: watch code and assets; refresh Foundry after rebuilding.
- `yarn clean`: remove generated `build/` and legacy `dist/` output with Foundry and the watcher stopped.
- `yarn test`: run Mocha tests.
- `yarn lint`: check JavaScript with ESLint Less with Stylelint, and Handlebars syntax and markup.
- `yarn lint:fix` / `yarn format`: apply ESLint fixes / Prettier formatting.

For local playtesting without Nix, stop Foundry VTT 13, run `yarn build`, copy or symlink `build/` as `Data/systems/oq` in the Foundry data directory, start Foundry, and run `yarn dev` to rebuild on change.

With Nix, install Chromium and use `start-dev --watch` in the Nix shell, or `nix run .#start-dev -- --watch`. The launcher links `foundryvtt-data/Data/systems/oq` to `build/` and uses an ignored `.dev/chromium` profile with remote debugging on port 9222. Stop Foundry before launching because the initial build replaces compendia. For manual startup, build and link the system, then run `FOUNDRY_WORLD=oq-dev start-foundry` and `yarn dev`; open `http://localhost:32000`. Worlds created or opened by Foundry 14 cannot be launched by Foundry 13.

## Coding Style & Naming Conventions

Use two-space indentation, LF endings, single quotes, semicolons, trailing commas, and a 120-column Prettier width. Follow existing kebab-case filenames, camelCase functions, and PascalCase classes such as `OQMoneyService`. Keep user-facing labels in `src/lang/en.yaml`. Husky runs lint-staged checks on commits.

## Testing Guidelines

Tests use Mocha with Node assertions or `expect.js`. Name files `test/test-<subject>.js`, group behavior with `describe`, and write descriptive `it` cases. Run one file with `yarn mocha test/test-roll.js`. Cover changed calculations and edge cases; stub Foundry globals where needed. No coverage threshold is configured. Verify sheet, dialog, and chat changes manually in Foundry; run tests, lint, and build before submitting.

## Commit & Pull Request Guidelines

History uses short descriptive subjects, often prefixed with an issue number, such as `#138 Combat tracker updated`; no strict Conventional Commits pattern is evident. Keep commits focused. PRs should explain the behavior change, link relevant issues, report validation, and include screenshots for visible UI changes.
