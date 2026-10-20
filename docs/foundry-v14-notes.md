# Foundry v14 notes

Behaviour of Foundry 14.369 that the sources do not make obvious, found while building this system on 14.368 and
rechecked against the 14.369 sources. Paths are relative to the `foundryvtt-api` symlink.

## Startup order

`game.initialize()` (`client/game.mjs:648`) runs, in order:

1. `Hooks.callAll("init")`. Stored world settings are already in memory (loaded by the `Game` constructor), so
   `game.settings.get` right after `register` returns the saved value. Core settings and translations are not
   available yet: `i18n.initialize()` runs after `init`.
2. `setupGame()` → `initializeDocuments()` (`game.mjs:729`) constructs every world Actor and Item and prepares its data.
3. `Hooks.callAll("setup")`, then `ready`.

Anything data preparation reads (e.g. `CONFIG.OQ.Rules`) must be in place by the end of `init`; `setup` is too late.
World settings cannot be written before `ready`.

## Settings typed by a data field

- `register` with `type: new fields.SchemaField({...})` gives `field.name = '<namespace>.<key>'`, so sub-field
  `fieldPath`s start with it. `get` returns a plain object; stored JSON missing a key is filled from that field's
  `initial`. Clone it before keeping it.
- `set` runs `type.clean(value)` and then strict validation (`client/helpers/client-settings.mjs:340-356`). Cleaning
  **silently fixes** most bad input: `NumberField` rounds integers and clamps to `min`/`max` (150 with `max: 100` is
  saved as 100). Only NaN, a disallowed null or an unknown `StringField` choice fails, and the failure thrown is a
  `DataModelValidationFailure`, which is not an `Error` (`asError()` converts it).
- `requiresReload` is honoured only by the core settings form. `game.settings.set` never prompts; a custom form calls
  `foundry.applications.settings.SettingsConfig.reloadConfirm({ world: true })` itself. The prompt is a `DialogV2`
  with id `reload-world-confirm`.
- `registerMenu` with `restricted: true` hides the menu from users without `SETTINGS_MODIFY`
  (`client/applications/settings/config.mjs:50-57`). That permission defaults to Assistant GM, so Assistant GMs see
  restricted menus too.

## ApplicationV2 forms

- `_onSubmitForm` (`client/applications/api/application.mjs:2147-2161`) catches an error thrown by the form handler,
  shows it with `ui.notifications.error(err)` (displayed as `Error: <message>`) and keeps the form open. For a clean
  message with `closeOnSubmit: false`, call `ui.notifications.error(message)` and return instead of throwing.
- `_onChangeForm(formConfig, event)` fires on every input change; override it for live updates and call `super`.
- `{{formGroup field ...}}` renders a `NumberField` with `min`/`max` as a `<range-picker>`. It clamps a typed value to
  the range and rounds it to the step as it is entered (`client/applications/elements/range-picker.mjs:112-119`), so a
  form cannot submit an out-of-range number through it. Its number box is 40px wide in core CSS.
- Core example of a settings menu with its own form: `client/applications/settings/menus/ui-config.mjs`.

## Forcing dice results

A die face is `Math.ceil((1 - u) * faces)` with `u = CONFIG.Dice.randomUniform()` (`client/dice/terms/dice.mjs:365-376`).
To get face `f` on a d100 in a running world, temporarily set
`CONFIG.Dice.randomUniform = () => 1 - (f - 0.5) / 100`, roll, and restore the original function.
