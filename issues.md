# Pre-migration review — known issues

## Migration sequence

v14 first, with the existing AppV1 sheets, then the AppV2 port on v14. AppV1 still works in v14 (it is removed in v16),
and several v14 changes land in the code the port rewrites: B6, B9, `data-tooltip-html`, Handlebars `preventIndent` and
theming (C8). Porting on v14 means writing the new sheets once, against the final API.

1. **v14 release** — AppV1 sheets unchanged:
   1. ~~B13 — Node 24 and Foundry 14 in `flake.nix`; check that the build toolchain runs on Node 24.~~
   2. ~~B8 and B10 together, so every item type has a `TypeDataModel` schema and `template.json` can go.~~
   3. ~~B12~~, ~~B6 (core part: `messageMode`)~~, ~~B11~~, ~~B5~~, ~~B9~~.
   4. ~~Raise the minimum compatible version to 14 and test in a v14 world.~~
2. **AppV2 port on v14** — C, folding in E. AppV1 and AppV2 sheets can be registered side by side, so this can ship
   in pieces:
   1. The six item sheets — they share a base class and are the simplest.
   2. The dialogs, mostly with `DialogV2`; add the B6 message mode selector here.
   3. The two actor sheets, with jQuery removal (C2) and theming (C8).
3. **Combat tracker redesign** (C10) — independent of the sheets, so it can be scheduled on its own.

Stay on v13 for the port only if the group has to remain on v13 for a while (for example, modules it relies on aren't
updated yet).

---

Code review of the whole system ahead of the migration to Foundry VTT v14 and ApplicationV2 (2026-10-03).

Scope: all of `src/module` (~3.5k lines), `src/public/templates`, `src/styles`, `src/packs`, manifest and build
config. Findings were checked against the Foundry sources in the nix store (13.351 and 14.368, unminified `client/` and
`common/`) and the v14 release notes (14.349 – 14.368).

**Verification legend**

- _verified_ — confirmed by reading the system code and the matching Foundry source, or by running the code.
- _inferred_ — follows from the source, but not reproduced in a running Foundry; confirm in-app before fixing.

## Recommended order

1. **First batch — small, mostly data integrity:** A1–A5, A14, B1, B2, B3, B10, B13.
2. **Rest of A** — still on v13, so behaviour can be compared before and after.
3. **v14 compatibility pass** with the existing AppV1 sheets: the rest of B. AppV1 works in v14 and is removed in v16.
4. **AppV2 migration**: C, folding in E as files get rewritten.
5. **D (packs)** can be done independently at any point; do it after A1 and B10 so the pack data is validated against
   the final schemas.

---

## A. Bugs (present today on v13)

### [x] A1. Armour items have no data model

- **Where:** `src/module/init/register-data-models.js:22`
- **Problem:** `ArmorDataModel` is registered under the key `armor`, but the item type is `armour` everywhere else
  (`items-config.js`, `template.yaml`, packs). `CONFIG.Item.dataModels.armour` is therefore undefined, and armour
  `system` is the schemaless `template.json` stub `{}` plus whatever happens to be stored.
- **Impact:**
  - New armour gets no `ap` and no `state`. With no `state` it is never counted as worn, so it contributes neither AP
    nor encumbrance.
  - Nothing is validated, and no migration ever runs for armour.
- **Fix:** register it as `armour`.
- **Side effect:** existing armour without `state` will pick up the initial `worn`, so it starts counting towards AP
  and encumbrance.
- _verified_

### [x] A2. `hotbarDrop` hook blocks almost every hotbar drop

- **Where:** `src/module/utils/item-macro.js:25`
- **Problem:** the hook returns `false` (after a warning) for any drop whose `data.type` isn't skill, weapon or special
  ability. Core aborts the drop when the hook returns `false` (`client/applications/ui/hotbar.mjs:489` in 13.351).
- **Impact:** none of these work:
  - dragging a Macro from the directory onto the hotbar;
  - moving a macro between hotbar slots;
  - dropping RollTables, JournalEntries, or standard `{type: 'Item', uuid}` drops from the sidebar.
- **Fix:** return nothing (`undefined`) for drops the system doesn't handle. Return `false` only after creating an
  item macro.
- _verified_

### [x] A3. Item macro command breaks on names containing quotes

- **Where:** `src/module/utils/item-macro.js:9`
- **Problem:** `` `game.oq.rollItem('${data.name}')` `` interpolates the raw name into script code. A name such as
  "Thieves' Tools" yields a syntax error when the macro runs.
- **Fix:** `` `game.oq.rollItem(${JSON.stringify(data.name)})` ``.
- **Better long term:** store the item UUID in macro flags and resolve the item at run time.
- _verified_ (by reading)

### [x] A4. Dragging an item onto its own actor sheet duplicates it

- **Where:**
  - `src/module/sheet/actor/actor-base-sheet.js:244` (`onItemDragStart`)
  - `src/module/sheet/actor/actor-base-sheet.js:92` (`_onDrop`)
  - `src/module/document/item-directory.js` (`_onDrop`)
- **Problem:** drag start puts the whole `item.toObject()` plus `dragSource: 'oq'` into `text/plain`. `_onDrop`
  unconditionally calls `createEmbeddedDocuments` for that payload. It never reaches core's same-actor check, which
  would sort instead of create.
- **Impact:** any accidental drag of an item row that lands on the same sheet creates a copy. The custom payload also
  bypasses `_stats.compendiumSource`, sorting and core's permission handling.
- **Fix:** use the standard `item.toDragData()` (`{type: 'Item', uuid}`) and the core `_onDropItem` and directory drop
  handlers.
  - The item directory override and the hotbar macro (A2/A3) then work from the UUID.
  - v14 routes actor-sheet item drops through `game.items.fromCompendium` (#13166), which handles the copy semantics.
- _verified_ (by reading core `ActorSheet._onDropItem` / `_onSortItem`)

### [x] A5. Money consolidation loses coins

- **Where:** `src/module/utils/money.js:82`, `:37`, `:58`
- **Problems:**
  1. `.sortBy((elem) => -elem.modifier)` sorts `[abbr, {label, multiplier}]` pairs by a property that doesn't exist, so
     it does nothing. Consolidation assumes the coins are ordered from largest to smallest.
     - If the GM writes the coin setting in ascending order, `{SP: 25}` consolidates to `1250 LB`.
     - `getMultiplier()` also reads the wrong "smallest" coin in that case (it computes `1` instead of `100`).
  2. Floating-point arithmetic: `Math.floor(remains % (multiplier * this.multiplier))` on floats drops value.
     - `{CP: 5, LB: 4}` → `5 CP 3 LB` (one lead bit lost).
     - 22 of 1,000 small CP/LB combinations lose value.
  3. `consolidate({})` → `reduce` without an initial value → `NaN` for every coin, which then gets written to the actor.
- **Fix:**
  - Sort by `-pair[1].multiplier`.
  - Convert everything to integer units of the smallest coin (`Math.round(count * multiplier * scale)`) and do integer
    division and remainder.
  - Give `reduce` an initial value of `0`.
  - Add tests for ascending configs and for the lossy cases.
- _verified_ (script against `money.js`)

### [x] A6. Combat: round advance and initiative rolling

- **Where:** `src/module/document/combat.js:7` (`nextRound`), `:2` (`startCombat`)
- **Problems:**
  1. `nextRound` updates every combatant's initiative from whichever client advanced the round.
     - When a player ends the last turn of a round, `nextTurn` → `nextRound` runs on the player's client.
     - Updates to combatants the player doesn't own are rejected by `BaseCombatant.#canUpdate`.
     - `Promise.all` rejects before `super.nextRound()` runs, so the round most likely won't advance. _inferred_
  2. `startCombat` fires N concurrent `combatant.rollInitiative()` calls. Each runs its own `Combat#rollInitiative`
     with its own turn update and chat message, so turn updates race and the chat gets spammed.
- **Fix:**
  - Move the per-round initiative refresh to `_onStartRound(context)`, which runs on the active GM, and use a single
    `this.updateEmbeddedDocuments('Combatant', updates)`.
  - Replace the per-combatant loop with `this.rollAll()` (or one `this.rollInitiative(ids)`).
- _verified_ (2), _inferred_ (1)

### [x] A7. `OQSpell.prepareDerivedData` is `async`

- **Where:** `src/module/document/item/spell.js:29`
- **Problem:** Foundry doesn't await data preparation.
  - `system.tooltip` is first set to the raw description by the base class, then replaced later, outside the
    preparation cycle and with no re-render.
  - Rejections are unhandled.
  - It runs `TextEditor.enrichHTML` for every spell on every actor preparation.
- **Fix:** keep preparation synchronous. Build the enriched tooltip in the sheet context (`getData` /
  `_prepareContext`) only for the items being rendered.
- _verified_

### [x] A8. Characteristic rolls post as the wrong speaker

- **Where:** `src/module/application/characteristics-dialog.js:115`, `:147`
- **Problem:** `ChatMessage.getSpeaker(this.object)` passes the Actor itself. The method destructures
  `{scene, actor, token, alias}`, so the speaker falls back to the controlled token or the user's character.
- **Fix:** `ChatMessage.getSpeaker({ actor: this.object })`.
- _verified_

### [x] A9. Item chat cards show stale or missing data

- **Where:**
  - `src/module/document/item/weapon.js:86`
  - `src/module/document/item/equipment.js:50`
  - `src/public/templates/chat/parts/item-template.hbs:20`
- **Problems:**
  - The weapon card reads `parentSystem.groupedItems.groupedSkillBySlug`, which no longer exists, so the skill field is
    never shown. Use `this.parent.system.skillsBySlug[ref]?.name`.
  - The equipment card checks `consumable`, which was replaced by `type` (see `EquipmentDataModel.migrateData`).
  - Descriptions are rendered raw with `{{{description}}}` and never enriched, so `@UUID` links, inline rolls and
    similar are not processed.
  - The armour and equipment `fields` arrays aren't filtered for falsy entries, unlike the weapon one.
- _verified_

### [x] A10. "Roll damage" chat button crashes when the item was deleted

- **Where:** `src/module/chat-handlers/updates-from-chat.js:84`
- **Problem:** `fromUuid(uuid)` returns `null` for a deleted item, and `item.parent` then throws.
- **Fix:** null-check the result and show a notification.
- _verified_ (by reading)

### [x] A11. Sheet `getData` writes into the live documents

- **Where:** `src/module/sheet/actor/actor-base-sheet.js:34`, `src/module/sheet/item/base-item-sheet.js:18`
- **Problem:**
  - `_.merge(system, {characteristics, attributes})` deep-merges `label`/`abbr` into `this.actor.system`.
  - `_.merge(system, { tooltip })` does the same with `tooltip` on `this.item.system`.
  - Render-only data leaks into document state and stays there until the next re-initialisation.
- **Fix:** build a separate context object (for example `context.characteristics = …`) and leave `system` untouched.
  This is the pattern AppV2 `_prepareContext` expects anyway.
- _verified_

### [x] A12. HP/MP click adjuster isn't clamped

- **Where:** `src/module/sheet/actor/actor-base-sheet.js:256`
- **Problems:**
  - Clicking down at 0 writes `-1`, which fails the field's `min: 0` validation (error toast).
  - There is no upper clamp.
  - `event.which === 1 ? 1 : -1` makes any non-left button (including middle-click) decrement.
- **Fix:** clamp to `[0, max]`, use `event.button` explicitly, and switch to `click` / `contextmenu` events.
- _verified_ (by reading)

### [x] A13. `prepareMoney` warning is broken

- **Where:** `src/module/sheet/actor/character-sheet.js:41`, `:49`
- **Problem:**
  - `ui.notifications.warning` doesn't exist; the method is `warn`.
  - The branch is unreachable anyway, because `fields` defaults to `[]`, which is truthy.
- **Fix:** check `fields.length` and call `warn`.
- _verified_

### [x] A14. Resistance "add" button on the combat tab creates an untyped skill

- **Where:** `src/public/templates/actor/parts/combat.hbs:47`
- **Problem:** the button uses `data-group="combat"`, but `onAddNewItem` reads `dataset.systemType`. The new skill gets
  no `type` and doesn't show up in any group. The equivalent button in `magic.hbs:18` correctly uses
  `data-system-type="resistance"`.
- **Fix:** `data-system-type="resistance"`.
- _verified_

### [x] A15. Rolling one characteristic recalculates points before writing the new value

- **Where:** `src/module/application/characteristics-dialog.js:152` (`rollCharacteristic`)
- **Problem:** `updatePoints` runs before the rolled value is written into `#char-<key>-base`. Setting the value with
  `.val()` fires no `change` event, so spent/remaining points stay calculated from the old value until another input
  changes. `rollAllCharacteristics` (`:127`) does it in the right order.
- **Fix:** write the value first, then call `updatePoints`.
- _verified_ (by reading)

### [x] A16. New skills get `"false"` as their custom type name

- **Where:** `src/module/sheet/actor/actor-base-sheet.js:120` (`onAddNewItem`)
- **Problem:** `systemType === custom && dataset.customTypeName` is `false` for every non-custom type, and `StringField`
  stores it as the string `"false"`. Every "add" button except the custom-group one does this, including both
  resistance buttons. If such a skill is later switched to the custom type, its name field is prefilled with "false" and
  it is grouped under a "false" heading.
- **Fix:** `|| ''`, or only set `customTypeName` for the custom type.
- _verified_ (`StringField#_cast` is `String(value)` in 14.368)

### [x] A17. Blind rolls can ask the roller for the dice

- **Where:** `src/module/utils/roll.js:41`, `:145`; `src/module/chat-handlers/chat-command-listener.js:9`
- **Problem:** rolls are evaluated with `Roll#roll()` (default `allowInteractive: true`) before `createChatMessage`
  applies the message mode. With manual or interactive dice entry configured and the chat mode set to blind, the roller
  is asked to enter a result they shouldn't see. Core's `/broll` evaluates with `allowInteractive: messageMode !==
  "blind"`. This only matters since B6 made blind mode take effect.
- **Fix:** read the message mode before rolling and pass `allowInteractive: mode !== 'blind'` to `evaluate`.
- _inferred_

---

## B. Foundry v14 compatibility

All items were checked in the 14.368 source. "Deprecated X→Y" means it still works, with a console warning, from
version X until it is removed in version Y.

### [x] B1. Global `mergeObject` is removed — skill sheet throws

- **Where:** `src/module/sheet/item/skill-sheet.js:7`
- **Problem:** the bare `mergeObject` global was a v12 alias (deprecated 12→14). It no longer exists in 14.368
  `client.mjs`, so opening a skill sheet throws `ReferenceError`.
- **Fix:** `foundry.utils.mergeObject` or `_.merge`, like the other sheets.

### [x] B2. Active Effects application phases

- **Where:** `src/module/document/actor/base-actor.js:59`
- **Problems:**
  - `Actor#applyActiveEffects(phase)` now takes `"initial"` or `"final"`. Calling it with no argument warns
    (deprecated 14→16) and falls back to `"initial"`. Each phase can run only once per preparation cycle.
  - Core calls `"initial"` at the end of `prepareEmbeddedDocuments` and `"final"` at the end of `prepareData`. The
    override replaces `prepareEmbeddedDocuments` without calling `super`, so it must call
    `this.applyActiveEffects('initial')` itself.
  - `Actor#prepareBaseData` now calls `_clearData()` (statuses, overrides, completed phases).
    `OQBaseActor.prepareBaseData` already calls `super`; keep it that way.
  - ActiveEffect data changed: `changes` moved to `effect.system.changes` (#13740), `mode` became a string `type`
    (#13566), and change values can reference roll data (#5841). The system doesn't use effects yet (the Effects tab is
    commented out), but any future effects UI has to target the v14 model.
- **Fix:** `this.applyActiveEffects('initial')`.

### [x] B3. `migrateData` must return the source

- **Where:** `src/module/dataModel/data-models-item.js:91` (Weapon), `:143` (Equipment); also `:34` (Skill)
- **Problems:**
  - Weapon and Equipment `migrateData` return `undefined`. v14 `TypeDataField#_migrate` logs "migrateData
    implementation that does not return a value" (deprecated 14→16) for every such item initialised.
  - None of the three call `super.migrateData`.
  - The migrations re-apply on every load and never delete the legacy keys.
- **Fix:**
  - Always `return super.migrateData(source)`.
  - Guard with `'weaponType' in source` (and similar), and delete the old key after copying it.
  - Alternatively use `foundry.abstract.Document._addDataFieldMigration` / `DataModel` field shims.

### [x] B4. `renderChatMessage` hook deprecated (removed in v15)

- **Where:** `src/module/init/custom-hook-handlers.js:6`, `src/module/chat-handlers/updates-from-chat.js`
- **Problem:** the jQuery-based hook is deprecated 13→15. It still fires in v14 with a warning.
- **Fix:** `renderChatMessageHTML(message, html: HTMLElement, context)`. Replace `html.find(...).on(...)` with
  `querySelectorAll` + `addEventListener`, and drop `$(button).blur()`.

### [x] B5. Copied combat tracker templates are out of date

- **Where:** `src/public/templates/applications/combat-tracker/{header,tracker}.hbs`,
  `src/module/application/combat-tracker.js`
- **Problems:**
  - v14 removed the `COMBAT.ToggleVis`, `COMBAT.ToggleDead`, `COMBAT.PingCombatant` and `COMBAT.PanToCombatant` keys
    from `en.json` (replaced by `COMBATANT.Show`/`Hide`, `COMBATANT.MarkDefeated`/`UnmarkDefeated`, `COMBATANT.Ping`,
    `COMBATANT.PanTo`). Our copies would show raw keys.
  - v14 core templates add the encounter name (`combat.name`, `editName` action, combat selector tooltips).
  - Effect icons are built from `appliedEffects` + `showIcon`.
  - `CombatTracker#initialize` is deprecated 14→15.
  - `PARTS` names and `_prepareTurnContext(combat, combatant, index)` are unchanged.
- **Fix:** either re-copy from the 14.x templates (keeping the two OQ changes, which are already documented in the
  template headers), or stop replacing the core templates. To do the latter, keep the `_prepareTurnContext` override
  and inject the initiative name in a `renderCombatTracker` hook, which drifts much less.
- **Done:** the copied templates are gone. `OQCombatTracker` renders the core templates and applies the OQ changes in
  `_onRender` (bulk rolls removed, initiative read-only, initiative item name shown). This is a stopgap — see C10.

### [x] B6. Roll mode → message mode (and the system ignores roll mode today)

- **Where:** all `ChatMessage.create` calls:
  - `src/module/utils/roll.js`
  - `src/module/utils/chat.js`
  - `src/module/chat-handlers/*.js`
  - `src/module/application/characteristics-dialog.js`
- **Problems:**
  - Every system roll is public; the user's roll-mode selection is ignored.
  - v14 replaced roll modes with message modes (#8856). The following are deprecated 14→16 and replaced as shown:

    | Deprecated | Replacement |
    | --- | --- |
    | `core.rollMode` setting | `core.messageMode` |
    | `ChatMessage.applyRollMode` | `ChatMessage.applyMode` |
    | `rollMode` create option | `messageMode` create option |

  - `CHAT_MESSAGE_STYLES.ROLL` and `WHISPER` are removed.
- **Fix:** implement visibility directly against the v14 API, e.g.
  `ChatMessage.create(data, { messageMode: game.settings.get('core', 'messageMode') })`. Optionally expose a mode
  selector in the roll dialogs.
- **Done:** every system message goes through `createChatMessage` (`src/module/utils/chat.js`), which passes the
  selected `core.messageMode`. The mode selector in the roll dialogs is left for the AppV2 dialog port (sequence 2.2).

### [ ] B7. ApplicationV1 is deprecated (removed in v16)

- **Where:**
  - `src/module/sheet/**` — 2 actor sheets and 6 item sheets
  - `src/module/application/*-dialog.js` and `short-desc-editor.js` — 5 FormApplications
- **Problem:**
  - Constructing any AppV1 app warns once (deprecated 13→16).
  - The `ActorSheet`/`ItemSheet` global aliases go in v15; the namespaced `foundry.appv1.sheets.*` used here is fine
    until v16.
  - Other v14 changes to AppV1:
    - AppV1 windows are forced to `.theme-light`.
    - Pop-out windows only work for AppV2.
    - TinyMCE is removed (our `{{editor}}` calls already use `engine="prosemirror"`).
- **Plan:** the system can run on v14 with the current sheets, so ship v14 compatibility first and AppV2 second (see C).

### [x] B8. Item data models extend `DataModel` instead of `TypeDataModel`

- **Where:** `src/module/dataModel/data-models-item.js` (all six item models)
- **Problem:**
  - It still works, but core only calls the `system` lifecycle methods when `system instanceof TypeDataModel`:
    - `prepareBaseData` / `prepareDerivedData`;
    - `_preCreate` / `_preUpdate` / `_onCreate` / …;
    - `toEmbed` / `onEmbed`.
  - Issue #13429 (template.json deprecation, B10) expects types to have either no schema or a `TypeDataModel` schema.
- **Fix:** extend `foundry.abstract.TypeDataModel`. The three copy-pasted `_preUpdate` icon-swap methods (Weapon,
  Equipment, Spell, all marked `FIXME`) can then become one helper on the models.

### [x] B9. Context menu entry format

- **Where:** `src/module/sheet/actor/actor-base-sheet.js:74-78` (`statusMenu`)
- **Problem:** v14 deprecates `ContextMenuEntry#callback` and `#condition` (14→16). The new fields are `onClick(event,
  target)` and `visible`, and entries use `label` instead of `name`. The constructor is already called the v14 way (an
  HTMLElement, `jQuery: false`).
- **Fix:** switch the entries to `{label, icon, onClick}`.

### [x] B10. `template.json` deprecated (removed in v16)

- **Where:** `src/template.yaml` (compiled to `template.json` by `tools/vite-plugin-system-meta.mjs`), `src/system.yaml`
- **Problem:** the v14 server adds a package warning for any system that ships `template.json`. Support is removed in
  v16.
- **Fix:** move the type lists and `htmlFields` into `documentTypes` in `src/system.yaml` (per subtype `htmlFields`,
  `filePathFields`, `gmOnlyFields`), drop `template.yaml`, and update the vite meta plugin. Do it together with A1 and
  B8 so every type has a real schema.

### [x] B11. `/hp` and `/mp` chat commands will probably stop matching

- **Where:** `src/module/chat-handlers/chat-command-listener.js:5`
- **Problem:** the v14 chat input is ProseMirror and submits serialized HTML, e.g. `<p>/hp 1d6</p>`.
  - The `chatMessage` hook receives that raw string; core strips the `<p>` only inside its own `ChatLog.parse`, after
    the hook has run.
  - The anchored regex `^\/(?<command>[a-zA-Z]+)\s(?<param>.*)$` therefore won't match.
- **Fix:** register the commands in `ChatLog.CHAT_COMMANDS` (`{rgx, fn, isMultiline, isRoll, mode}`) instead of the
  `chatMessage` hook.
- _inferred_ — confirm in a running v14 world.

### [x] B12. Settings registered in `ready`

- **Where:** `src/module/oq.js:34`, `src/module/init/register-settings.js:15`
- **Problem:** the default-items compendium setting is registered in `ready` because its `choices` need `game.packs`.
  Anything that reads the setting before `ready` throws.
- **Fix:** register it in `init` with `choices` filled in later, or in `setup`, where `game.packs` already exists.
- **Note:** not a v14 break as such — settings with `type: String` and `choices` are unchanged — but it is worth fixing
  while touching boot.

### [x] B13. v14 server needs Node ≥ 24.13.1

- **Where:** `flake.nix` (`nodejsMajor = 22`, `foundry.version = "13.351"`)
- **Problem:** 14.368 `package.json` declares `"node": ">=24.13.1 <25.0.0"`.
- **Fix:** bump `nodejsMajor` to 24 together with the Foundry version. Check that the build toolchain (vite 8, mocha,
  eslint 8) runs on 24.

### Other v14 notes (no action now, keep in mind)

- v14 is the last version with the v13 global aliases (`renderTemplate`, `loadTemplates`, `ActorSheet`, …); they go in
  v15. The code already uses namespaced forms. `Roll`, `ChatMessage`, `Item`, `Hooks`, `fromUuid` and `Macro` remain
  globals.
- **Templates and localisation:**
  - Handlebars templates are compiled with `preventIndent: true`.
  - The `{{select}}` and `{{colorPicker}}` helpers are removed (not used here).
  - `game.i18n.format` is merged into `localize`, and there is a new `_loc` global.
- **Tooltips:** `data-tooltip` content that isn't a localisation key is still rendered as sanitised HTML, but
  `data-tooltip-html` is the explicit form for HTML content (item description tooltips).
- **Combat:** `Combatant.roundJoined`, `turnNumber` and `Combat.name` are new. `getCombatantByActor` /
  `getCombatantByToken` are deprecated 14→15.
- **`_preCreate`:** `updateSource({items})` still works. Embedded arrays are now merged by `_id` unless wrapped in
  `ForcedReplacement`, and new elements are validated strictly. Our `_preCreate` only runs when there are no items, so
  the result is the same.
- **Updates:** `-=` and `==` update keys are deprecated 14→16 (not used here).
- **Tokens and scenes:**
  - Scene Levels are new.
  - `MeasuredTemplate` is replaced by Regions.
  - Token bars animate.
  - Tracked-attribute logic is unchanged.
- **Manifest:**
  - Unknown top-level keys now produce a package warning; check `system.yaml` after B10.
  - There is a new optional `type: "system"` field.
  - `styles` entries can carry a CSS `layer`.
- **Checked, unchanged:**
  - The `Proxy`-based `documentClass` (`document/document-proxy.js`): no static-private-member hazards in 14.368.
  - `ItemDirectory#_onDrop`.
  - `CONFIG.ui.items` / `CONFIG.ui.combat`.
  - `registerSheet`.
  - `getDefaultArtwork`.
  - `Combat#startCombat` / `nextRound` signatures.
  - `hotbarDrop` (now skipped while the hotbar is locked).

---

## C. AppV2 migration work

- [ ] **C1. Port the sheets.**
  - Actor and item sheets → `foundry.applications.sheets.ActorSheetV2` / `ItemSheetV2` with
    `HandlebarsApplicationMixin`.
  - Forms and dialogs → `ApplicationV2`, or `foundry.applications.api.DialogV2.input/prompt` for the simple ones:
    test-roll, damage-roll, attributes, characteristics, short description.
- [ ] **C2. Remove jQuery.** It is used throughout: `html.find(...).on(...)`, `$(...).closest(...).data()`, and
  `$(this.form).find(...)`. Replace it with `static DEFAULT_OPTIONS.actions` (`data-action`) and `_onRender` listeners.
- [ ] **C3. Remove the `setTimeout` focus and reset hacks:**
  - `damage-roll-dialog.js:49`
  - `test-roll-dialog.js:63`
  - `characteristics-dialog.js:62`
  - `base-item-sheet.js:58`

  Use `_onRender` and the form `autofocus` attribute instead.
- [ ] **C4. Unique application ids.** The dialogs use fixed ids (`attributes-dialog`, `characteristics-dialog`,
  `short-description`, `roll-damage-dialog`, `roll-test-dialog`), so opening them for two actors collides. AppV2 needs
  unique ids, e.g. `` `attributes-${actor.id}` ``.
- [ ] **C5. Drop the redundant re-renders.** Several handlers call `this.render(true)` after `document.update()` (5
  places); document updates already re-render the sheet.
- [ ] **C6. Drag and drop.** Use the `DocumentSheetV2` drag/drop handlers (`_onDropItem`, `_onDropFolder`). Keep the
  recursive folder import from `_onDropFolder` (`actor-base-sheet.js:104`) as a small override if it's still wanted.
  See A4.
- [ ] **C7. Form handling.** AppV1 `_updateObject(event, formData)` with `update({system: formData})` becomes
  `form.handler` / `submitOnChange`. Field names should use full `system.*` paths so the default document submit works.
- [ ] **C8. Theming.** AppV2 sheets follow the user's colour scheme (dark by default), whereas AppV1 windows are forced
  to light. The styles (`src/styles`, ~1.4k lines of LESS) hard-code a light palette over `sheetbg.webp` and don't use
  CSS layers.
  - Either force a light sheet theme, or define theme tokens and support both.
  - Consider shipping the CSS in a `@layer` (system.json `styles: [{src, layer}]`).
- [ ] **C9. Listeners bound for read-only viewers.** The NPC sheet binds `.roll-characteristics` and
  `.show-short-description-dialog` even when the sheet isn't editable (`npc-sheet.js:28`). The base sheet binds the
  roll/chat listeners before the `isEditable` check. Use `actions` plus permission checks in the new sheets.
- [ ] **C10. Redesign the combat tracker.** The current tracker is a placeholder: core's tracker with the OQ changes
  patched into the DOM in `_onRender` (B5). Rethink how OQ combat should work, then reimplement the tracker properly.
  - First decide whether OQ's combat flow fits core's turn order. If it does, extend `CombatTracker` (`PARTS`, context
    preparation, `actions`). If it doesn't, write an own ApplicationV2 sidebar tab registered as `CONFIG.ui.combat`,
    which means reimplementing what core provides: hover and ping, context menus, encounter cycling, turn controls and
    pop-out.
  - Initiative is derived from the actor (`initiative: "@attributes.initiative.value"` in `system.yaml`), so core's
    roll buttons already produce the right value. Overriding `OQCombat#rollInitiative` to set it without a dice
    message would let the core buttons stay instead of being removed.
  - Keep the initiative item name per combatant, and review the combatant context menu (`_getEntryContextOptions`:
    "Clear" and "Reroll" initiative).
  - Today "Reset Initiative" (encounter menu) and "Clear" set initiative to `null`, and with the roll buttons removed
    nothing restores it until `OQCombat.refreshInitiative` runs at the next round, so turn order is arbitrary until
    then.
  - The stopgap passes `initiativeName` from `_prepareTurnContext` to `_onRender` through `context.turns`, which relies
    on core giving both the same context object (`combat-tracker.js:16`). Reading the name from the combatant in
    `adjustTurns` would be simpler, if the stopgap lives long enough to matter.

---

## D. Pack data

- [ ] **D1. Legacy skill fields.** 27 skills in `src/packs/basic-skills` still use the old `group` / `customGroupName`
  fields instead of `type` / `customTypeName`, and rely on `SkillDataModel.migrateData` on every load. Migrate the YAML
  so the runtime migration can eventually be removed.
- [ ] **D2. Dev-world user ownership.** 32 pack documents carry ownership entries for dev-world user ids
  (`KsTXxaVKKsCmFqBq`, `jzN44THfEHA8DC8v`). Strip them, keeping only `default` if anything.
- [ ] **D3. Validate after the schema fixes.** After A1, B8 and B10, run the packs through the data models (`yarn
  build:packs` plus a load in Foundry) to catch values that the new schemas coerce or reject. For example, weapon
  `rate: 1` is a number stored in a `StringField`.

---

## E. Smaller cleanups

- [x] **E1. Data preparation isn't idempotent.** It uses `_.merge` everywhere:
  - `base-item.js:37`
  - `skill.js:14`
  - `equipment.js:40`
  - `base-actor.js:43`, `:67`
  - `character-actor.js:9`

  `_.merge` never removes keys or overwrites with `undefined`. Core states that `prepareData` may run more than once per
  initialisation. Examples:
  - A weapon whose referenced skill disappears keeps its old `rollValues`, because `calculateRollValues` returns `{}`
    (`weapon.js:64`).
  - `calculateDamageRollValues` returning `undefined` leaves the previous `damageRollValues` in place.
  - The actor's `initiative.name` survives clearing the initiative reference.

  Assign the derived objects instead of merging them. `this.system = _.merge(...)` in `skill.js:14` is also redundant.
- [x] **E2. Dead or duplicated code:**
  - `CharacteristicsParams` (`actors-config.js:40`): a second damage-modifier table using `'0'` where the live one uses
    `''`, plus a `FIXME`.
  - `BaseRollFormula` / `DifficultyLevels` / `RollResults` (`rolls-config.js:18-28`), which duplicate `RollConfig`.
  - `getRollByType` (`oq-game.js:6`).
  - `getNewImage` (`equipment.js:26`).
  - `OQBaseActor.combatItems` (`base-actor.js:6`).
  - The no-op `OQBaseItem.getRollData` (`base-item.js:29`).
  - The unused second argument to `splitSkills` (`character-sheet.js:25`).
  - The lazy `renderTemplate` wrapper, defined twice (`chat.js:3`, `roll.js:33`); other modules still bind
    `renderTemplate` when they load.
- [x] **E3. Item chat helpers assume an owned item.** `getBaseRollData` / `getItemDataForChat` (`base-item.js:97`,
  `:140`) call `this.actor.token` and crash for world or compendium items. This is unreachable today, but will matter
  if the new item sheets get a "send to chat" button.
- [x] **E4. `EquipmentDataModel.state` initial value** uses `ItemConfig.armourStates.carried.key`
  (`data-models-item.js:126`). It has the same value as the equipment state, but is a copy-paste slip.
- [x] **E5. `onUpdateItemAdv`:** `parseInt(...) ?? 0` (`actor-base-sheet.js:183`) — `parseInt` never returns
  null/undefined, so the `?? 0` does nothing. The `isNaN` check is what actually guards.
- [ ] **E6. Chat commands:**
  - `canvas.tokens.controlled` throws when the canvas is disabled (`chat-command-listener.js:8`,
    `updates-from-chat.js:6`). A GM with no token selected rolls `/hp` and `/mp` without actor data, so formulas like
    `@str` fail.
  - The `/hp` and `/mp` pattern (`chat-command-listener.js:33`) captures all the HTML after the command, and
    `htmlToText` (`:24`) drops `<br>` instead of turning it into a newline. A Shift+Enter line break therefore merges
    the next line into the formula (`/hp 1d6` + `fire` → `1d6fire`). Core's `ChatLog.parse` converts `<br>` first.
- [ ] **E7. `characteristics-dialog.js:146` passes `class: ['oq']` to `ChatMessage.create`.** This isn't a ChatMessage
  field and is silently dropped.
- [ ] **E8. Tooling:**
  - JavaScript lint uses ESLint 8 with legacy `.eslintrc.cjs`, while the template lint uses a flat config via
    `ESLINT_USE_FLAT_CONFIG`. Unify on flat config with ESLint 9+.
  - `husky install` (husky 8) is deprecated in husky 9.
  - `package.json` still has placeholder `description` / `repository.url`.
- [ ] **E9. Manifest placeholders.** `src/system.yaml` has `url`, `manifest` and `download` set to `tbd` (the release
  workflow fills them) and `version: 0.1.0-SNAPSHOT`. These are fine for dev, but check the v14 manifest validation
  warnings after B10.
