# OQ System

OpenQuest SRD system for Foundry VTT

## Status

Beta

## Development

Building the system needs only Node.js (`^20.19` or `>=22.12`; Node.js 22 is recommended) and Yarn 1.
Nix is optional: the [Nix environment](#nix-environment-optional) below adds pinned tooling, a packaged
Foundry VTT and one-command launchers, but nothing in the build depends on it.

```sh
yarn install --frozen-lockfile
yarn build
```

To use the build in Foundry VTT 13, stop Foundry, then copy or symlink `build/` as `Data/systems/oq`
in your Foundry data directory and start Foundry. With a symlink, run `yarn dev` to rebuild code and assets
when sources change, and refresh the browser after each rebuild.

- `yarn build:packs`: replace generated compendia in `build/packs/` from `src/packs/`.
- `yarn build:code`: bundle JavaScript, compile Less, convert metadata to JSON, and copy public assets to `build/`.
- `yarn build`: run both steps in order.
- `yarn dev` (alias `yarn build:watch`): rebuild code, Less styles, YAML metadata, and public assets on change.
- `yarn clean`: remove generated `build/` and legacy `dist/` output.

Code builds and watch mode preserve existing compendium databases. After changing `src/packs/`, stop
Foundry, run `yarn build:packs`, then restart Foundry. A browser refresh does not reopen Foundry's databases.
Also stop Foundry and the watcher before running `yarn clean`. Code builds do not remove obsolete output files;
use `yarn clean && yarn build` for a fresh distribution after removing or renaming sources.
Restart the watcher after adding new public assets or language files.

Run `yarn test`, `yarn lint`, and `yarn build` before submitting changes. Lint checks JavaScript, Less,
and Handlebars syntax and markup.

### Nix environment (optional)

The project uses the shared [foundry-dev](https://github.com/michalzc/foundry-dev) flake,
pinned in `flake.lock`. `flake.nix` owns the Foundry 13.351 archive hash and Node.js 22 selection;
Yarn uses the same Node.js version. Download your licensed Node.js archive, name it
`FoundryVTT-13.351.zip`, and import it before entering the shell:

```sh
nix-store --add-fixed sha256 FoundryVTT-13.351.zip
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
A world created or opened by Foundry 14 cannot be launched by Foundry 13; remove it or point
`FOUNDRY_DATA_PATH` at another data directory.

`--watch` runs `yarn dev` after startup, watching code, Less styles, YAML metadata, and public assets.
Refresh the browser after a rebuild; there is no automatic page reload. Ctrl+C or closing Chromium stops
the processes started by the launcher.

`start-dev` defaults to the `oq-dev` world and `foundryvtt-data` at the Git checkout root,
including from subdirectories. Use `FOUNDRY_WORLD`, `FOUNDRY_PORT`, and `FOUNDRY_DATA_PATH` to override these
defaults. Relative data overrides for `start-dev` resolve against the Git root. Both build and watch use
the packaged Yarn with Node.js 22, including when invoked through `nix run` outside the shell.

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

The development environment uses Foundry 13, matching the version verified in the system manifest.

Entering the shell exports `FOUNDRY_APP_PATH` and refreshes the ignored `foundryvtt-api`
symlink for editor navigation. Existing real files or directories at that path are preserved.
The `foundry` shell and `foundryvtt-13` package aliases are available.

Run `nix flake update foundry-dev` to upgrade the shared environment, then commit
`flake.lock`. This does not change the project's Foundry version or archive hash.
Format the flake with `nix fmt -- flake.nix`. To try the sibling shared checkout without
changing the committed input or lock file:

```sh
nix develop --override-input foundry-dev path:../foundry-dev --no-write-lock-file
```

## Contributors

[tuirgin](https://github.com/tuirgin) - SRD Bestiary as journal pages.

## Roadmap

* v0.6 - Support for V14
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
