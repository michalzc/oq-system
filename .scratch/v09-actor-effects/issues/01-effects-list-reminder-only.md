# 01: Effects list with reminder-only effects

**What to build:** A Referee or owning player opens a character or NPC sheet and finds an Effects list (a tab on
characters, a section on NPCs). From it they create an effect, which opens the system effect editor, and give it a
name, icon, source name and rules text. They can enable, disable, edit and delete it, and expand a row to read its rules
text. This slice has no numeric changes: every effect is a pure **reminder** ("Owes the river spirit a favour"). First
slice of chunk **Fx1**; see [the spec](../spec.md), sections "Effect records", "Sheets and editor" and the Fx1 user
stories 1–3, 6, 9, 10, 12–17.

The system registers its own Active Effect document class and an effect data model extending the core change schema.
It keeps the `type`, `phase` and `priority` definitions core requires, and this slice adds only the source name field
(no field ahead of its behaviour). The editor is an ApplicationV2 subclass of the core effect config, registered for
Active Effects, in the light parchment theme. It hides core `statuses` and duration controls (Cnd1 and Clk1 add them).
Before writing code, confirm the effect data model and sheet registration in the Foundry v14 sources, reading the v14
notes doc first.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Actor effects use the system document class and data model. Name, icon, enabled/disabled and description (the
      rules text) are core fields. The source name is stored as readable text.
- [x] The character sheet has an Effects tab and the NPC sheet an Effects section, using the shared actor sheet part.
      Each row shows icon, name, source name, state (enabled or disabled), an enable toggle, edit, delete and
      expandable rules text. A create control adds an actor effect and opens the editor.
- [x] Disabled effects stay listed with a visible "disabled" state.
- [x] The system editor is the registered default for Active Effects and edits name, icon, enabled, rules text and
      source name. It hides statuses and duration.
- [x] Pre-v0.9 effects (macro or module changes) stay listed and are not converted, classified or repaired. Opening and
      saving one in the editor preserves its stored changes byte-for-byte. The editor shows them as "other stored
      changes not managed by OpenQuest".
- [x] An owner with edit permission on the actor can manage its effects without the Referee.
- [x] Effects created on an unlinked token's sheet change only that token's actor; on a linked token they belong to the
      world actor. Duplicating, exporting and importing an actor keeps its effects and their enabled state.
- [x] New strings live under `OQ.*`; icons come only from the themed set.
- [x] Manual: the spec's Fx1 row "Any actor: add a reminder-only effect, reload" passes on a character and an NPC, plus
      enable/disable/delete with reloads, on linked and unlinked tokens.
- [x] `yarn test`, `yarn lint` and `yarn build` pass.

## Comments

- 2026-11-25: Implemented on `feature/v09-fx1-actor-effects`. The base effect type's data model is replaced (adds
  `system.sourceName`), so pre-v0.9 effects use it unchanged. The pure seam is `utils/effect-contributions.js`
  (`effectListEntry`), tested in `test/test-effect-contributions.js`. Until ticket 02 adds the first OpenQuest target,
  every stored change is listed as another stored change. The editor also keeps core's `transfer` toggle for item
  effects, which the editor otherwise hides with tint, show-icon and origin.

- 2026-11-25 in-world QA (Foundry 14.370, `oq-dev` world, GM client): passed. Character A (linked token): reminder-only
  effect created from the Effects tab, reloaded, disabled, reloaded, enabled, deleted, reloaded; AP/HP/MP/MR unchanged
  throughout. Unlinked Elf token: effect added from its NPC sheet; the other Elf token and the base actor stayed
  without effects across a reload. A macro-style effect with raw changes was opened and saved in the editor; its
  `system.changes` JSON was identical before and after, and core still applied them (AP 2 → 3). Duplicating and
  export/import kept effects, enabled state and source names. Player ownership was checked only through
  `canUserModify` (owner of A can create/update/delete; non-owner of Elf cannot create), not with a player login.
