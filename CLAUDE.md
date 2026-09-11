# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`oq` — an OpenQuest SRD game system for Foundry VTT (compatibility: v13, see `src/system.yaml`). Package manager is yarn; the dev shell (`flake.nix` + direnv) provides node 22, yarn and a pinned FoundryVTT 13 build.

## Commands

```bash
yarn build          # vite build → dist/
yarn build:watch    # rebuild on change
yarn dev            # dev server on :32001, proxies Foundry on :32000, rebuilds + full-reloads
yarn test           # mocha (test/*.js)
yarn lint           # eslint + stylelint '**/*.less'
yarn lint:fix
yarn format         # prettier
yarn clean          # rm -rf dist
```

Single test file / case:

```bash
yarn mocha test/test-roll.js
yarn mocha --grep 'getResult'
```

### Running it in Foundry

`start-foundry` (from the nix dev shell) launches Foundry on port 32000 with `--dataPath=./foundryvtt-data --world=oq-dev`. `foundryvtt-data/Data/systems/oq` is a symlink to `dist/`, so a build is immediately live. `yarn dev` then puts a proxy on :32001 that runs `vite build --watch` internally and pushes a full page reload after each completed rebuild — open the game on :32001, not :32000, to get reloads.

## Build pipeline (`vite.config.js`)

Vite only bundles `src/module/oq.js` into `dist/module/oq.js` (ES lib build, minified). Foundry resolves class names at runtime (sheet registration, data models), so any change to the minifier settings has to keep `rollupOptions.output.keepNames` in mind. Everything else is done by the custom `oq-system-files` plugin:

- `src/styles/oq.less` → `dist/styles/oq.css`, compiled by `less` **outside** Vite's asset pipeline so that `url()`s pointing at `/systems/oq/…` survive verbatim.
- every `src/**/*.yaml` outside `src/packs` → JSON at the same relative path (`src/system.yaml` → `dist/system.json`, `src/lang/en.yaml` → `dist/lang/en.json`, `src/template.yaml` → `dist/template.json`).
- `src/packs/<pack>/*.yml` → LevelDB compendia via `@foundryvtt/foundryvtt-cli` `compilePack`; the target dir is deleted first so removed entries don't survive a watch rebuild.
- `src/public/` is Vite's `publicDir`, copied verbatim (templates, fonts, assets).

**Edit the YAML sources, never `dist/`** — `dist/` is git-ignored generated output. New files added deep inside `src/packs` or `src/public` while `--watch` runs need a restart.

Release: `.github/workflows/release.yml` runs on a published GitHub release, substitutes `version`/`url`/`manifest`/`download` into `src/system.yaml`, builds, and uploads `system.json` + `system.zip`.

## Architecture

### Boot sequence

`src/module/oq.js` is the only entry point. On the `init` hook it sets `CONFIG.OQ = OQ` (the aggregate from `consts/consts.js`) and `game.oq = oqGame`, then calls the `init/register-*.js` modules: data models, documents, handlebars helpers, custom hook handlers, settings, template preload. Anything reading `CONFIG.OQ.*` therefore runs after this.

### Config-driven types

`consts/actors-config.js` and `consts/items-config.js` are the registries: per type they map `documentClasses`, `sheetClasses`, `defaultIcons`, and (items) `itemSheetPartials`, plus enums for states/subtypes/traits. Adding an actor or item type means touching, in one pass:

1. the config map(s) in `consts/`,
2. a `DataModel` in `dataModel/data-models-{actor,item}.js` **and** its entry in `init/register-data-models.js`,
3. a document class under `document/` and a sheet under `sheet/`,
4. the type list in `src/template.yaml`,
5. `TYPES.Actor.*` / `TYPES.Item.*` labels in `src/lang/en.yaml`.

Foundry allows only one `documentClass` per collection, so `document/document-proxy.js` registers a `Proxy` whose `construct` trap dispatches to the per-type class from `CONFIG.OQ.*Config.documentClasses`, falling back to `OQBaseActor`/`OQBaseItem`.

### Data preparation ordering (the part that bites)

`document/actor/base-actor.js` deliberately splits preparation into three levels, documented in the file:

1. `prepareBaseData()` — attributes derived from characteristics alone (hp/mp/dm/mr).
2. `prepareEmbeddedDocuments()` — items prepared in dependency order: **skills first**, then `system.skillsBySlug` is published, then everything else (weapons resolve their roll values from the skill they reference by slug).
3. `prepareDerivedData()` — attributes needing prepared items (armour points, initiative).

`getDataForItems()` is the *only* actor surface an embedded item may read while preparing (characteristics, `dm`, prepared skills) — the rest of the actor does not exist yet at that point. Skills are keyed by `makeSlug(name)`, which is how weapons/initiative reference them.

### Rolls and chat

Items build roll payloads (`getBaseRollData` → `getTestRollData` / `getDamageRollData`) and delegate to `utils/roll.js`. `testRoll()` rolls `CONFIG.OQ.RollConfig.baseRollFormula` (d100), derives success/critical/fumble in the pure functions `getResultFeatures` + `getResult` (these are what `test/test-roll.js` covers, using a stubbed `globalThis.CONFIG`), renders a per-roll-type template from `templates/chat/parts/`, and stamps `CONFIG.OQ.ChatConfig.MessageFlags` on the message. Those flags are what `chat-handlers/updates-from-chat.js` keys off when rendering interactive buttons (apply damage, roll damage) on existing chat messages. Roll dialogs (`application/*-dialog.js`) are optional front-ends that fill in difficulty/modifier before calling the same functions.

### Foundry v13 API usage

Sheets and dialogs are still on AppV1 (`foundry.appv1.sheets.ActorSheet`, `foundry.appv1.api.FormApplication`) with `getData` + `activateListeners(html)` (jQuery). Everything else uses the namespaced v13 API: `foundry.applications.handlebars.renderTemplate`, `foundry.applications.ux.TextEditor.implementation.enrichHTML`, `foundry.documents.collections.{Actors,Items}.registerSheet`, `foundry.data.fields`, `foundry.utils.mergeObject`. In modules evaluated at import time, resolve `foundry.*` lazily (see the `renderTemplate` wrapper in `utils/roll.js`) — the global does not exist yet when the bundle is parsed.

Handlebars templates are referenced by absolute runtime path (`systems/oq/templates/...`), and must be listed in `init/preload-templates.js` to be usable as partials.

### Conventions

- `lodash-es` (imported as `_`) is the only runtime dependency and is used heavily, including `_.merge` onto `this.system` during preparation.
- Prettier: single quotes, semicolons, trailing commas, 120 columns. Husky + lint-staged run eslint/stylelint/prettier on commit.
- Localization keys live in `src/lang/en.yaml` under `OQ.*`, plus Foundry's `TYPES.*`.

### Known quirk

`init/register-data-models.js` registers the armour data model under the key `armor`, while the item type is `armour` everywhere else (`items-config.js`, `template.yaml`, packs). Check this before debugging missing armour schema fields.
