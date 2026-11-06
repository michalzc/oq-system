# 02: Condition sources, removal notification and sheet condition summary

**What to build:** An actor has a hand-made "Ghoul venom" effect carrying Paralysed and a standalone Paralysed marker.
The Referee removes the standalone marker from the HUD: the venom effect is untouched, a notification names it as
still supplying Paralysed, and the Paralysed icon stays. On the actor's sheet, the Effects list opens with a
**condition summary**: one chip per active condition with its icon and label, and a tooltip listing its active sources
and the palette rules summary. Each effect row shows the markers it carries. Disabled records stay listed with their
inactive reason and supply no chip. Second slice of chunk **Cnd1**; see [the spec](../spec.md), sections "Pure
condition-sources module (the seam)", "Markers and standalone markers" (removal notification) and "Display surfaces"
(actor sheet), and user stories 6, 7, 24–26, 44, 45.

This slice creates the main seam: a pure condition-sources module, free of Foundry calls at import time, taking the
palette and the actor's effect records as plain data (id, name, icon, source name, statuses, whether it has curated
changes, show-icon setting, whether it is temporary, active state and inactive reason, owner kind: actor or item with
item id and name, and whether its id is a palette standalone id). This ticket gives it:

- **active sources per condition**: each palette condition and each out-of-palette stored status, with its active
  sources classified as standalone marker, actor effect or item passive. Disabled, suppressed and expired records are
  excluded and returned separately with their reason. Item passives and expiry arrive with later tracks, but the
  module handles them from plain data now and the tests cover them;
- **summary data** for the sheet chips (and later the tracker tooltips): per condition, its label, rules summary and
  source names;
- **toggle plan** for a HUD click or a defeated toggle, in its Cnd1 form: create standalone, remove standalone, or
  remove standalone and report the remaining sources. Ticket 06 adds "open the sources view".

The status toggle keeps core behaviour for the standalone marker; the system only adds the notification. Before writing
code, check in the v14 sources whether an effect's active state already excludes expired effects (read the v14 notes
doc first).

**Blocked by:** 01 (Condition palette replaces the core status list),
[actor-effects 01 (Effects list with reminder-only effects)](../../v09-actor-effects/issues/01-effects-list-reminder-only.md),
which adds the Effects list this ticket extends

**Status:** ready-for-agent

- [ ] Removing a standalone marker from the HUD or unmarking defeated from the tracker, while other active sources
      still supply the condition, removes only the standalone marker and shows a notification naming those sources.
- [ ] The Effects list on characters and NPCs opens with the condition summary chips; each chip's tooltip lists active
      sources and the rules summary. Effect rows show their markers (palette icon and label).
- [ ] Disabled effects carrying a condition stay listed with their reason and supply no chip.
- [ ] Effects with statuses outside the palette (Stunned, Shocked) stay listed with their stored icon and status and
      appear in the summary under their stored status id; they have no HUD entry.
- [ ] Everything acts on the token's actor, which for an unlinked token is its synthetic actor.
- [ ] Condition-sources module tests (new test file): active sources per condition with standalone, actor-effect and
      item-passive sources; exclusion of disabled, suppressed and expired records with their reason; multi-status
      effects; out-of-palette stored statuses; summary data; toggle plans for off, standalone only, and removal with
      remaining sources (including Dead from the defeated toggle).
- [ ] The Actors documentation page explains the condition summary and row markers (edit the HTML source and
      regenerate the journal sources).
- [ ] Manual: the spec's Cnd1 rows "Character, skill 60: add standalone Prone" (now including the sheet chip),
      "Actor with a hand-made Ghoul venom effect carrying Paralysed" (the venom effect is created by giving a
      reminder-only effect the status from the browser console or a macro until ticket 03 adds the editor field) and
      "v0.8 world" (the old Dead marker notification and the Stunned effect) pass, on a character and an NPC, linked and
      unlinked, with reloads.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
