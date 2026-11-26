---
name: dev-world-qa
description: >-
  Drive the running oq-dev Foundry world through the Chrome DevTools MCP. Use for in-world QA, a ticket's Manual
  acceptance rows, or seeing a change work in Foundry.
---

# In-world QA in the oq-dev world

`start-dev` (see CLAUDE.md) runs Foundry on port 32000 with the `oq-dev` world and Chromium on `127.0.0.1:9222`, which
the `chrome-devtools` MCP attaches to. Drive the world with `evaluate_script`, check with data reads and screenshots.

## Steps

1. **Attach.** `list_pages` shows `http://127.0.0.1:32000/game`. When the page or Foundry is missing, ask the user to
   run `start-dev`; it starts processes they own. On `/setup` the world was shut down: ask the user before launching
   it (`[data-package-id="oq-dev"] [data-action="worldLaunch"]`). On `/join`, log in as the GM (no password); the
   navigation destroys the script, so wait for ready in the next one:

   ```js
   const form = document.getElementById('join-game-form');
   form.querySelector('[name=userId]').value = [...form.userId.options].find((o) => o.text === 'Gamemaster').value;
   setTimeout(() => form.querySelector('button[type=submit]').click(), 50);
   ```

2. **Rebuild.** `yarn build:code`, then `navigate_page` with `type: reload, ignoreCache: true`. Pack changes need
   the world closed, not Foundry stopped: ask the user, return to Setup, run `yarn build:packs` (or `yarn build`),
   then relaunch the world as in step 1. While the world runs, `yarn check:packs` only checks that they compile.
3. **Wait for ready** at the start of every script that follows a reload:

   ```js
   for (let i = 0; i < 60 && !game.ready; i++) await new Promise((r) => setTimeout(r, 500));
   ```

4. **Drive the UI** with DOM clicks inside the sheet, the same path a user takes:

   ```js
   const actor = game.actors.getName('A'); // unlinked token: canvas.scene.tokens.get(id).actor
   await actor.sheet.render(true);
   actor.sheet.changeTab('effects', 'primary');
   actor.sheet.element.querySelector('[data-action=addEffect]').click();
   await new Promise((r) => setTimeout(r, 1000)); // let the update and re-render land
   ```

   Fill a form by setting input values, then click its `button[type=submit]`. Other input paths:
   - A right-click action (`buttons: [0, 2]`) fires on `auxclick`:
     `el.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 2 }))`. A `contextmenu` event does nothing.
   - A value set from a script and then blurred fires no `change`. For Enter, Tab or blur behaviour, focus the field
     in `evaluate_script`, then type with `type_text` (its `submitKey`) or `press_key`.
   - Token HUD: `canvas.tokens.hud.bind(token.object)`, then set `input[name=bar1]` and fire `change` on it.
   - Chat card buttons: post the card (`await ui.chat.processMessage('/hp 5')`), select the target token
     (`token.object.control({ releaseOthers: true })`), then click the button inside
     ``ui.chat.element.querySelector(`[data-message-id="${message.id}"]`)``.
5. **Verify** each step:
   - Prepared values (`actor.system...`) and stored data (`actor.toObject()`). To prove "no stored field changes",
     save a baseline in `localStorage` (page state is lost on reload) and compare after each reload.
   - What the server stored, when a data model's `migrateData` converts on load and so `toObject()` cannot tell:
     `await new Promise((r) => game.socket.emit('modifyDocument', { type: 'Actor', action: 'get', operation: { query:
     {}, pack } }, r))` returns the raw sources in `.result` (omit `pack` for world documents).
   - `take_screenshot` with `format: 'jpeg', quality: 70` and without `filePath`, then `Read` the returned path: a
     1400×900 JPEG is about 110 KB, the same PNG 1.4 MB. Before the first one, set a small viewport with `emulate`
     (`viewport: '1400x900x1'`): the full window returns images of about 2500×2000 px.
     Call `emulate` without `viewport` when the QA is done, to give the user their window back. To show a tooltip
     first: `game.tooltip.activate(element)`. Shoot every sheet type a changed template appears on, one at a time
     and unobstructed: a layout bug hidden behind an overlapping window goes unseen.
   - Every control of a form the change touches, not only the ones the scenario needs: set each `select`/`input`
     and fire `change` on it while a `window` `error` listener records exceptions. Core listeners that throw on a
     change (see `docs/foundry-v14-notes.md`, Active Effects) leave no console warning and no visible trace.
   - `list_console_messages` with `types: ["error", "warn"]`: none expected.
6. **Record** the result in the ticket's `## Comments`: date, Foundry version, world, client (GM or player), each
   scenario with its observed values, and anything not checked.

## Recipe: migration QA

Legacy data has to be stored by the old code. While the page still runs the previous build, create the fixtures
(actors, unlinked tokens with deltas, a locked world compendium, an exported JSON kept in `localStorage`); then
`yarn build:code` and reload into the new build, which runs the migration. Check what was stored with the raw
`modifyDocument` read above. To test a retry, pass `navigate_page` an `initScript` that waits for `window.Hooks` and
registers a `preUpdateActor` hook returning `false` for one document while `options.diff === false`; answer the
migration's dialog with Retry, then reload without the script.

## Traps

- `take_snapshot` on `/game` includes the whole chat log: about 1,400 lines in `oq-dev`. Read state through
  `evaluate_script` instead.
- A reload clears `window`: a helper one script defines there is gone in the next. Define helpers inside each script
  that follows a reload.
- `take_screenshot` with `filePath` writes only inside the MCP's workspace roots; the job tmp directory is outside.
- Core `ActiveEffectConfig` (the system effect editor) closes on submit. Call `effect.sheet.render(true)` again before
  the next interaction; `sheet.form` is `null` while closed.
- An action that submits the form without closing it (add or delete a change row) re-renders the sheet: query inputs
  again afterwards.
- Find an open dialog by class and document, not by a guessed id (ids embed the document, e.g.
  `TemporaryPointsDialog-Actor-<id>-mp`):
  `[...foundry.applications.instances.values()].find((a) => a.constructor.name === 'TemporaryPointsDialog' && a.actor === actor)`.
- After a browser restart, page ids change: call `list_pages` again.
- `resize_page` resizes the user's real browser window, and the window manager overrides the size it asks for (a
  1400×900 request left a 513 px wide page at a new device pixel ratio). Size screenshots with `emulate`, which
  changes only the page's viewport.
