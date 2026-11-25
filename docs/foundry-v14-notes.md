# Foundry v14 notes

Behaviour of Foundry 14 that the sources do not make obvious, found while building this system on 14.368 to 14.370.
Line references were last checked against the 14.370 sources. Paths are relative to the `foundryvtt-api` symlink.

## Startup order

`game.initialize()` (`client/game.mjs:648`) runs, in order:

1. `Hooks.callAll("init")`. Stored world settings are already in memory (loaded by the `Game` constructor), so
   `game.settings.get` right after `register` returns the saved value. Core settings and translations are not
   available yet: `i18n.initialize()` runs after `init`.
2. `setupGame()` → `initializeDocuments()` (`game.mjs:733`) constructs every world Actor and Item and prepares its data.
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

## Data model fields and migration

- `DataField#getInitialValue` (`common/data/fields.mjs:264`) returns a non-function `initial` by reference, so
  `initial: []` or `initial: {}` is one object shared by every document that gets it. An in-place source update (e.g.
  `updateSource` in `_preCreate`) then leaks into the next new document. Use a factory: `initial: () => []`.
- A `TypeDataModel`'s `migrateData` also runs on update changes and on creation input, which are cleaned with
  `partial: true` (`common/abstract/data.mjs` `_preUpdateSource`, `client/data/client-backend.mjs`
  `#preCreateDocumentArray`); the creation constructor then passes `migrate: false`. Check `options.partial` before
  reading an absent key as legacy data. World load, compendium load and `fromImport` (JSON import) migrate complete
  sources.
- `ActorDelta#system` is an `ObjectField`: token deltas are never passed to the system's `migrateData`.

## ApplicationV2 forms

- `_onSubmitForm` (`client/applications/api/application.mjs:2159-2178`) catches an error thrown by the form handler,
  shows its message with `ui.notifications.error(err.message)`, logs it to the console and keeps the form open. To
  reject a submission without a console error, call `ui.notifications.error(message)` and return instead of throwing.
- `_onChangeForm(formConfig, event)` fires on every input change; override it for live updates and call `super`.
- `{{formGroup field ...}}` renders a `NumberField` with `min`/`max` as a `<range-picker>`. It clamps a typed value to
  the range and rounds it to the step as it is entered (`client/applications/elements/range-picker.mjs:115-119`), so a
  form cannot submit an out-of-range number through it. Its number box is 40px wide in core CSS.
- Core example of a settings menu with its own form: `client/applications/settings/menus/ui-config.mjs`.
- An action with `buttons: [0, 2]` runs its right-click on `auxclick` (`client/applications/api/application.mjs:1892`);
  `contextmenu` does not reach it.
- A plain `ApplicationV2` is not re-rendered when a document changes. One that must show live data registers in
  `document.apps` in `_onFirstRender` and removes itself in `_onClose`, as `DocumentSheetV2` does
  (`client/applications/api/document-sheet.mjs:245`, `:261`); `ClientDocument#render` re-renders every app there.

## Tokens: bars and HUD

- A bar redraws only when its value changes: an actor update makes `TokenDocument#_onRelatedUpdate`
  (`client/documents/token.mjs:3800`) animate `bar1`/`bar2`, which sets `refreshBars` only for a changed value. Any
  other bar visual needs `token.object.renderFlags.set({refreshBars: true})`, for example from an `updateActor` hook,
  which also fires for synthetic token actors. `Token#_drawBar(index, bar, data)`
  (`client/canvas/placeables/token.mjs:1797`) also runs for every animation frame.
- The HUD's bar input calls `Actor#modifyTokenAttribute(attribute, value, isDelta, isBar)`
  (`client/documents/actor.mjs:409`). Its `modifyTokenAttribute` hook may veto the update (return `false`) or rewrite
  the `updates` object in place; an override should keep both.
- The HUD's bar containers (`#token-hud .attribute.bar1`) are `position: static`: an absolutely positioned element
  inside one lands relative to the middle column, and outside the input the side columns cover it.

## Forcing dice results

A die face is `minValue - 1 + Math.ceil((1 - u) * faces)` with `u = CONFIG.Dice.randomUniform()`
(`DiceTerm#mapRandomFace`, `client/dice/terms/dice.mjs:409-413`); for a d100 `minValue` is 1. To get face `f` on a d100
in a running world, temporarily set `CONFIG.Dice.randomUniform = () => 1 - (f - 0.5) / 100`, roll, and restore the
original function.

## Active Effects

- `Actor#applyActiveEffects(phase)` (`client/documents/actor.mjs:212`) asks `ActiveEffect#shouldApplyChange(change,
  {phase})` per change and skips changes whose `key` is blank. Statuses are collected per active effect outside that
  check, and `token.`-prefixed changes are split off after it into `actor.tokenActiveEffectChanges`, so overriding
  `shouldApplyChange` to skip some changes keeps core status and token handling for the rest.
- A system can replace the change schema of `ActiveEffectTypeDataModel` but must keep `type`, `phase` and `priority`.
  Field instances cannot be reused across schemas: `SchemaField` throws when a field already has a `parent`
  (`common/data/fields.mjs:935`) and fields have no `clone`. To extend core's change fields, take them from a
  throwaway `super.defineSchema()` and clear their `parent` before adopting them.
- A new optional field without an `initial` (`StringField({required: false, blank: true})`) cleans to `undefined`,
  which is not serialized, so changes stored without that field are saved back without it.
- `ActiveEffectConfig#_onChangeForm` (`client/applications/sheets/active-effect-config.mjs:229-239`) treats every
  `<select>` whose name ends in `.type` as one of its change rows and sets the placeholder of the row's `.priority`
  input, throwing a `TypeError` when there is none. Name a subclass's own operation selects differently (the system
  editor uses `oqChanges.N.operation`).
