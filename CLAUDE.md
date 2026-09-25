# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`oq` — an OpenQuest SRD game system for Foundry VTT (compatibility: v13, see `src/system.yaml`). Package manager is yarn; the dev shell (`flake.nix` + direnv) provides node 22, yarn and a pinned FoundryVTT 13 build.

## Commands

```bash
yarn build          # compile packs, then code/assets → build/
yarn build:watch    # rebuild on change
yarn dev            # watch code/assets; refresh Foundry on :32000 manually
yarn test           # mocha (test/*.js)
yarn lint           # JavaScript, Less, Handlebars syntax and markup
yarn lint:fix
yarn format         # prettier
yarn clean          # remove build/ and legacy dist/
```

Single test file / case:

```bash
yarn mocha test/test-roll.js
yarn mocha --grep 'getResult'
```

### Running it in Foundry

`start-foundry` (from the nix dev shell) launches Foundry on port 32000 with `--dataPath=./foundryvtt-data --world=oq-dev`. Link `foundryvtt-data/Data/systems/oq` to `build/` (update older links to `dist/`). Run `yarn build` before starting Foundry, then `yarn dev` to watch code and assets. Open :32000 and refresh after rebuilds.

## Build pipeline

The build follows the split tooling in `tools/`:

- `yarn build:packs` compiles `src/packs/<pack>/` into LevelDB compendia in `build/packs/`. It replaces the generated pack directory, including removed packs. Stop Foundry first.
- `yarn build:code` uses Vite to bundle `src/module/oq.js` into `build/module/oq.js`. Preserve `rolldownOptions.output.keepNames: true` because Foundry persists class names.
- `systemMeta` emits `system.json`, `template.json`, and `lang/*.json` from YAML and watches metadata and public assets.
- `systemStyles` compiles `src/styles/oq.less` into `build/styles/oq.css` outside Vite's asset pipeline, preserving Foundry URLs verbatim.
- Vite copies `src/public/` into `build/`.

**Edit source files, never `build/`.** `yarn build` runs pack compilation followed by code compilation. `yarn dev` and `yarn build:watch` only rebuild code and assets, preserving compendia. After changing packs, stop Foundry, run `yarn build:packs`, then restart Foundry. Stop Foundry and the watcher before `yarn clean`. Code builds retain old output files; run `yarn clean && yarn build` for a fresh distribution after deleting or renaming sources. Restart the watcher after adding new public assets or language files.

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
