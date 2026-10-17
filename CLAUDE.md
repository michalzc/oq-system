# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

OpenQuest SRD game system (`id: oq`) for Foundry VTT 14 (minimum and verified 14, dev version 14.368). Plain ES
modules bundled by Vite; no TypeScript. Node.js 24 and Yarn 1.

## Commands

```sh
yarn install --frozen-lockfile
yarn build            # build:packs then build:code, output in build/
yarn build:code       # Vite: bundle JS, compile Less, system.yaml/lang YAML -> JSON, copy src/public
yarn build:packs      # compile src/packs/ YAML into LevelDB under build/packs/ (Foundry must be stopped)
yarn build:docs       # regenerate journal sources in src/packs/ from docs/packs/ HTML; not part of build, commit output
yarn dev              # watch mode for code/styles/meta/public assets; never rebuilds packs
yarn clean            # remove build/ (stop Foundry and the watcher first)
yarn lint             # eslint JS + stylelint Less + eslint on Handlebars templates, --max-warnings 0
yarn lint:fix
yarn test             # mocha, runs test/*.js
npx mocha test/test-roll.js           # one test file
npx mocha test/test-roll.js -g 'mastered'   # filter by test name
```

Run `yarn test`, `yarn lint` and `yarn build` before submitting changes. A pre-commit hook runs lint-staged (eslint
--fix, stylelint, prettier). Prettier: single quotes, trailing commas, 120 columns.

The optional Nix shell (`direnv allow` / `nix develop`) provides `start-dev [--watch]`, which builds, links `build/`
into `foundryvtt-data/Data/systems/oq`, starts Foundry on port 32000 with the `oq-dev` world, and opens Chromium
with remote debugging on `127.0.0.1:9222` (usable through the Chrome DevTools MCP). The shell also creates the
`foundryvtt-api` symlink to the Foundry sources, the place to look up Foundry v14 APIs. There is no live reload:
refresh the browser after a rebuild; after changing `src/packs/`, stop Foundry, run `yarn build:packs`, restart.

## Architecture

**Entry point** `src/module/oq.js` registers everything on Foundry hooks: `init` (data models, document classes,
sheets, Handlebars helpers, hooks, chat commands, settings, template preload, money service), `setup` (core setting
defaults, in-memory migrations), `ready` (GM persists migrations). `CONFIG.OQ` is the `OQ` object from
`consts/consts.js`, which aggregates `ActorConfig`, `ItemConfig`, `RollConfig`, `ChatConfig`, `SettingsConfig`.

**Type dispatch through config.** Actor types (`character`, `npc`) and item types (`skill`, `weapon`, `armour`,
`equipment`, `spell`, `specialAbility`) are mapped to their document class and sheet class in
`consts/actors-config.js` and `consts/items-config.js`. `CONFIG.Actor/Item.documentClass` is a `Proxy`
(`document/document-proxy.js`) that constructs the per-type subclass from those maps. Adding a type means touching:
the data model (`dataModel/`, registered in `init/register-data-models.js`), the document subclass, the sheet, the
config maps, `documentTypes` in `src/system.yaml`, and `src/lang/en.yaml` (`TYPES.*`).

**Data preparation order** (`document/actor/base-actor.js`) is deliberate:
1. `prepareBaseData` — attributes derived from characteristics only.
2. `prepareEmbeddedDocuments` — items prepared in dependency order (skills before weapons/spells that reference them).
   Items may read only `actor.getDataForItems()` (level-1 attributes plus skills prepared so far).
3. `prepareDerivedData` — attributes that need prepared items.

Items compute `system.rollValues` / `system.damageRollValues` in their own `prepareDerivedData`.

**UI** is all ApplicationV2: sheets extend `HandlebarsApplicationMixin(ActorSheetV2/ItemSheetV2)` with static
`DEFAULT_OPTIONS.actions` handlers; dialogs live in `application/`. Templates are in `src/public/templates/`
(preloaded in `init/preload-templates.js`). Sheets keep the light parchment theme (`theme-light` class). Vite runs with
`keepNames: true` because Foundry persists sheet identifiers derived from class names — do not rename sheet classes.

**Rolls and chat**: `utils/roll.js` (percentile test results, damage), dialogs in `application/*-roll-dialog.js`,
chat card templates in `templates/chat/`, chat-card button handling in `chat-handlers/updates-from-chat.js`, chat
commands in `chat-handlers/chat-command-listener.js`. `game.oq` exposes `rollItem` / `rollDamageFromItem` for macros.

**Combat** (`document/combat.js`, `combatant.js`, `application/combat-tracker.js`): a declaration phase per round.
Non-GM requests go to the active GM through `CONFIG.queries` (`OQCombat.registerQueries`); the tracker re-renders on
actor/item/token/effect changes via hooks in `init/custom-hook-handlers.js`.

**Default items for new actors**: compendium/world items flagged `flags.oq.newActor: [types]` are copied into new
actors in `OQBaseActor._preCreate` (`utils/compendium-utils.js`); embedded copies drop the flag.

**Settings, i18n**: settings in `init/register-settings.js` / `consts/settings-config.js`. Localization source is
`src/lang/en.yaml` (converted to JSON at build); keys live under `OQ.*`. `src/system.yaml` is the manifest source,
converted to `system.json`; the release workflow rewrites its `version`/`url`/`manifest`/`download` keys.

## Data migrations

Migrations in `src/module/migration/` are appended to `migrations` in `migrations.js` with the next `version`. Each
has handlers per document name (`Actor`, `Item`, `Token`, ...) receiving the document source and helpers `replace`,
`remove`, `parent`, and returning the changes (or `{}`). They run on world documents (with embedded ones) and world
compendia; system compendia are rebuilt from `src/packs/`, so fix those sources directly. Add tests to
`test/test-migrations.js`. **Never edit a released migration** — add a new one.

## Compendium content

- `src/packs/<pack>/` holds one YAML file per document (`<Name>_<id>.yml`); keep `_id`s stable so `@UUID` links work.
- Journal packs (`documentation`) are generated from `docs/packs/` by `yarn build:docs` (see `docs/packs/README.md`);
  edit the HTML there, not the generated YAML.
- `scripts/*.sc` are Scala (Ammonite/scala-cli) one-off generators that built spells/equipment/weapons packs from
  `CSV/`; `scripts/generateId.sc` generates Foundry IDs.
- `docs/OpenQuest3-SRD/` is a reference copy of the rules in AsciiDoc.

## Icons

Use only `systems/oq/assets/icons/themed/...` in code, templates and packs. The SVGs directly in
`src/public/assets/icons/` (except `cultist.svg`) are legacy black-background copies kept for unmigrated stored
references; `test/test-legacy-icons.js` checks they match the themed set.

## Tests

Mocha with Node `assert` / `expect.js`, run in plain Node without Foundry. Tests import pure modules from
`src/module/` and stub the globals they need (e.g. `globalThis.CONFIG = { OQ: { RollConfig } }`), so logic meant to
be tested should stay free of direct Foundry API calls at import time.
