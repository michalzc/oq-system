# OQ System

OpenQuest SRD system for Foundry VTT

## Status

Beta. The current development version requires Foundry VTT 14 and is verified on 14.368.
Both actor sheets, all six item sheets, the dialogs and the combat tracker use ApplicationV2.
Sheets and dialogs retain the light parchment theme. See [docs/migration-issues.md](docs/migration-issues.md) for
the migration review and completed combat tracker redesign.

## Contributors

[tuirgin](https://github.com/tuirgin) - SRD Bestiary as journal pages.

## Roadmap

Issue numbers refer to the [GitHub tracker](https://github.com/michalzc/oq-system/issues).

### v0.8 — Magic and quality of life

* ~~Spell casting dialog: roll the referenced casting skill, deduct MP by magnitude, post a chat card~~ —
  [#94](https://github.com/michalzc/oq-system/issues/94). **Done**
* ~~Custom spell type~~ — [#110](https://github.com/michalzc/oq-system/issues/110). **Done**: spells of the *Custom
  Type* are grouped by their custom type name, after the other spells on the Magic tab and in the NPC spell list.
* ~~Item sheet option to add an item to new characters / NPCs, instead of editing `flags.oq.newActor` by hand~~ —
  [#121](https://github.com/michalzc/oq-system/issues/121). **Done**: GMs use *Default for New Actors* in the item
  sheet's header menu, for items outside actors. With the *Default Items from World* setting, marked world items are
  added next to the ones from the selected compendium.
* ~~Documentation compendium updated for the new sheets and combat flow~~ —
  [#61](https://github.com/michalzc/oq-system/issues/61). **Done**: the journals are generated from HTML in
  [docs/packs](docs/packs/README.md) with `yarn build:docs`.
* ~~Change colours for NPCs items and actions (optional)~~ — [#152](https://github.com/michalzc/oq-system/issues/152)
  **Done**, also migations mechanism introduced.
* ~~Recommended world settings~~ — [#153](https://github.com/michalzc/oq-system/issues/153) **Done**

### v0.9 — Buffs and Active Effects

* Temporary HP / MP above the maximum, independent of Active Effects —
  [#124](https://github.com/michalzc/oq-system/issues/124).
* Active Effects support — [#14](https://github.com/michalzc/oq-system/issues/14):
  * decide which fields effects may change;
  * fix the data preparation order: base data, effects, derived values;
  * effects tab on actor and item sheets, effects transferred from items.
* Statuses with OpenQuest conditions — [#109](https://github.com/michalzc/oq-system/issues/109).
* Enchanted items: magic point stores and stored spells — [#96](https://github.com/michalzc/oq-system/issues/96).

### v1.0 — Content and polish

* SRD creatures as NPC actors in a compendium, generated from the bestiary journal into YAML packs —
  [#11](https://github.com/michalzc/oq-system/issues/11), [#118](https://github.com/michalzc/oq-system/issues/118).
* Dark theme for sheets and dialogs (deferred in the migration, C8).
* Unit tests for actor and item data preparation.

### Later

* Token Action HUD support, probably as a separate module — [#56](https://github.com/michalzc/oq-system/issues/56).
* Combat automation — [#10](https://github.com/michalzc/oq-system/issues/10).

### Completed

#### v0.7 — Release the v14 / ApplicationV2 work

The AppV2 sheets and dialogs, the new combat tracker and the pack cleanup are merged but not yet released
(`v0.6.0` contains only the v14 compatibility pass).

* ~~Release v0.7.0.~~ **Done**
* ~~Release workflow: update the deprecated actions (`checkout`, `setup-node`) and replace the archived
  `microsoft/variable-substitution` step — [#29](https://github.com/michalzc/oq-system/issues/29).~~ **Done**
* Optional: publish releases to the Foundry package registry from the release workflow —
  [#68](https://github.com/michalzc/oq-system/issues/68).
* Tracker cleanup:
  * ~~Verify and close [#47](https://github.com/michalzc/oq-system/issues/47) (context menu) and
    [#104](https://github.com/michalzc/oq-system/issues/104) (icons by item subtype).~~ **Done**
  * ~~Close the v0.5 milestone; move its open issues to the milestones below.~~ **Done**
  * ~~Move `issues.md` to `docs/` as the migration record.~~ **Done**

* ~~v0.6 - Foundry VTT V14 support~~ **Done**
* ~~v0.5 - https://github.com/michalzc/oq-system/issues/138 - Support for V13~~ **Done**
* ~~v0.5 - https://github.com/michalzc/oq-system/milestone/5. Quality of life improvements.~~ _Postponed_
* ~~v0.4 - Update to FoundryVTT V12~~ **Done**
* ~~v0.3 - https://github.com/michalzc/oq-system/milestone/3. SRD content (without bestiary) in compendiums and few QoL features.~~ **Done**
* ~~v0.2 - https://github.com/michalzc/oq-system/milestone/2.~~ **Done**
* ~~v0.1 - Basic character and npc sheets, skill, damage rolls. Skills in compendium.~~ **Done**

## Licencing

* Icons: [Game-Icons.net](https://game-icons.net/) - [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)
* Fonts: Merriweather - [Open Font Licence](https://openfontlicense.org/),
  Leander - [Tension Type Font License v1.00](https://www.fontsquirrel.com/license/leander)
* Game Rules and content: [OpenQuest SRD](https://openquestrpg.com/srd/) by D101
  Games - [Creative Commons](https://creativecommons.org/)
* OpenQuest 3 SRD reference copy in [docs/OpenQuest3-SRD](docs/OpenQuest3-SRD/README.adoc), converted to
  AsciiDoc - [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)
* Foundry VTT: Limited License Agreement for module development.
* Project skeleton: [Foundry Factory](https://github.com/ghost-fvtt/foundry-factory) - [REUSE](https://reuse.software/)
* The rest of the source code: [WTFPL](http://www.wtfpl.net/)

This work is based on the OpenQuest System Resource Document (found at https://openquestrpg.com/srd), a D101 Games
product developed, authored by Newt Newport with Paul Mitchener. OpenQuest System Resource Document © 2021 by Newt
Newport with Paul Mitchener is licensed under Attribution 4.0 International. To view a copy of this license,
visit http://creativecommons.org/licenses/by/4.0/

![Made with OpenQuest](assets/docs/Made-With-OQ-Logo.png "Mage with OpenQuest")

OpenQuest is the trademark of Paul Newport, used with Permission.

## Install

Put below link into 'Manifest URL' field.

https://github.com/michalzc/oq-system/releases/latest/download/system.json

## Documentation

The in-game manual is the *System Documentation* journal in the *Documentation* compendium. It covers settings,
actors, items, magic, rolls, chat commands and the combat tracker.

## Development

Building the system needs only Node.js (`^20.19` or `>=22.12`; Node.js 24 is recommended) and Yarn 1.
Running Foundry VTT 14.368 also requires Node.js 24 (24.13.1 or later).
Nix is optional: the [Nix environment](#nix-environment-optional) below adds pinned tooling, a packaged
Foundry VTT and one-command launchers, but nothing in the build depends on it.

```sh
yarn install --frozen-lockfile
yarn build
```

To use the build in Foundry VTT 14, stop Foundry, then copy or symlink `build/` as `Data/systems/oq`
in your Foundry data directory and start Foundry. With a symlink, run `yarn dev` to rebuild code and assets
when sources change, and refresh the browser after each rebuild.

- `yarn build:packs`: replace generated compendia in `build/packs/` from `src/packs/`.
- `yarn build:code`: bundle JavaScript, compile Less, convert metadata to JSON, and copy public assets to `build/`.
- `yarn build`: run both steps in order.
- `yarn build:docs`: regenerate the journal sources in `src/packs/` from the HTML in `docs/packs/`; see
  [docs/packs/README.md](docs/packs/README.md). Not part of `yarn build`: run it after editing the docs and commit the
  result.
- `yarn dev` (alias `yarn build:watch`): rebuild code, Less styles, YAML metadata, and public assets on change.
- `yarn clean`: remove generated `build/` and legacy `dist/` output.

Code builds and watch mode preserve existing compendium databases. After changing `src/packs/`, stop
Foundry, run `yarn build:packs`, then restart Foundry. A browser refresh does not reopen Foundry's databases.
Also stop Foundry and the watcher before running `yarn clean`. Code builds do not remove obsolete output files;
use `yarn clean && yarn build` for a fresh distribution after removing or renaming sources.
Restart the watcher after adding new public assets or language files.

Run `yarn test`, `yarn lint`, and `yarn build` before submitting changes. Lint checks JavaScript, Less,
and Handlebars syntax and markup.

### Data migrations

Changes to stored data, such as renamed fields or moved assets, are written to the world by migrations in
`src/module/migration/`. Migrations newer than the `migrationVersion` world setting are applied in memory on every
client in the `setup` hook, before anything renders, and the active GM's client stores them in `ready`. They run on
world documents with their embedded documents, and on world compendia. The setting is shown as *Data Migration
Version* in the system settings: lowering it applies the newer migrations again after the reload. System compendia are
rebuilt from `src/packs/`, so update their sources directly.

To add a migration, create a module with a handler per document name (`Actor`, `Item`, `Token`, ...). Each handler
gets the document source and returns the changes to write, or `{}` when the document is up to date. Its helpers
include `replace(value)` and `remove()`, which replace or delete a stored value, and `parent`, the document the
migrated one is embedded in. Append it to
`migrations` in `migrations.js` with the next version number and add tests to `test/test-migrations.js`. Never edit
a migration that has been released: worlds that already applied it won't run it again.

The system icons live in `src/public/assets/icons/themed/`. The SVGs directly in `src/public/assets/icons/`, apart
from `cultist.svg`, are copies with a black background, kept at the paths used before 0.8. They serve stored
references that migrations can't reach, such as images in rich text, module compendia, or data imported later, and
their colour tells users something wasn't migrated. Never use them in code, templates or packs.
`test/test-legacy-icons.js` checks that they match the themed icons.

### Nix environment (optional)

The project uses the shared [foundry-dev](https://github.com/michalzc/foundry-dev) flake,
pinned in `flake.lock`. `flake.nix` owns the Foundry 14.368 archive hash and Node.js 24 selection;
Yarn uses the same Node.js version. Download your licensed Node.js archive, name it
`FoundryVTT-14.368.zip`, and import it before entering the shell:

```sh
nix-store --add-fixed sha256 FoundryVTT-14.368.zip
direnv allow
# Or without direnv:
nix develop
```

With direnv configured, entering the checkout loads the tools into the current shell. Run `direnv reload`
after changing the flake if needed. Without direnv, use `nix develop --command zsh` for an interactive zsh shell.

Install Chromium on the host, then run:

```sh
yarn install --frozen-lockfile
start-dev
# Rebuild code and assets when sources change:
start-dev --watch
# Or without entering the development shell:
nix run .#start-dev -- --watch
```

The launcher builds the system, links `build/` into `foundryvtt-data/Data/systems/oq`, starts Foundry
on port 32000, creates or reuses the `oq-dev` world, and opens its join screen in Chromium.
Select the GM/user in the browser. Stop any Foundry instance using this checkout's build before launching;
the initial build replaces compendium databases. Existing worlds are preserved and checked for the `oq` system.
Use a separate data directory when switching Foundry major versions: a world created or opened by Foundry 14
cannot be launched by Foundry 13. Set `FOUNDRY_DATA_PATH` to choose another data directory.

`--watch` runs `yarn dev` after startup, watching code, Less styles, YAML metadata, and public assets.
Refresh the browser after a rebuild; there is no automatic page reload. Ctrl+C or closing Chromium stops
the processes started by the launcher.

`start-dev` defaults to the `oq-dev` world and `foundryvtt-data` at the Git checkout root,
including from subdirectories. Use `FOUNDRY_WORLD`, `FOUNDRY_PORT`, and `FOUNDRY_DATA_PATH` to override these
defaults. Relative data overrides for `start-dev` resolve against the Git root. Both build and watch use
the packaged Yarn with Node.js 24, including when invoked through `nix run` outside the shell.

Chromium uses the ignored `.dev/chromium` profile and exposes remote debugging on loopback port 9222,
compatible with Chrome DevTools MCP at `http://127.0.0.1:9222`. The launcher discovers `chromium` or
`chromium-browser` on PATH; override this with `CHROMIUM_BIN`. Use `CHROMIUM_DEBUG_PORT` to change the debugging
port and update the MCP endpoint accordingly. Occupied Foundry or debugging ports cause startup to fail.

On first use, enter the Foundry license and accept its terms in Chromium if requested. If the data directory
requires administrator authentication, set `FOUNDRY_ADMIN_PASSWORD` and optionally `FOUNDRY_ADMIN_USERNAME`,
or create and launch `oq-dev` manually in Chromium when prompted. Player login remains interactive.

For manual startup, build with `yarn build` while Foundry is stopped and link
`foundryvtt-data/Data/systems/oq` to this checkout's `build/` directory. Run `start-foundry` for the setup screen,
or `FOUNDRY_WORLD=oq-dev start-foundry` for an existing world, then run `yarn dev` in another terminal.
Outside the shell, use `FOUNDRY_WORLD=oq-dev nix run .#start-foundry`. This launcher also accepts
`FOUNDRY_PORT` and `FOUNDRY_DATA_PATH`; relative data overrides resolve against the current directory.
Extra command-line arguments are forwarded to Foundry.

The development environment uses Foundry 14.368; the system manifest sets both the minimum and verified
compatible version to 14.

Entering the shell exports `FOUNDRY_APP_PATH` and refreshes the ignored `foundryvtt-api`
symlink for editor navigation. Existing real files or directories at that path are preserved.
The `foundry` shell alias is available. The `foundryvtt` package provides the pinned Foundry 14.368 build;
the legacy `foundryvtt-13` package alias currently points to that same build.

Run `nix flake update foundry-dev` to upgrade the shared environment, then commit
`flake.lock`. This does not change the project's Foundry version or archive hash.
Format the flake with `nix fmt -- flake.nix`. To try the sibling shared checkout without
changing the committed input or lock file:

```sh
nix develop --override-input foundry-dev path:../foundry-dev --no-write-lock-file
```
