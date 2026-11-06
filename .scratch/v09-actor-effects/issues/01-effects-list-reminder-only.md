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

**Status:** ready-for-agent

- [ ] Actor effects use the system document class and data model. Name, icon, enabled/disabled and description (the
      rules text) are core fields. The source name is stored as readable text.
- [ ] The character sheet has an Effects tab and the NPC sheet an Effects section, using the shared actor sheet part.
      Each row shows icon, name, source name, state (enabled or disabled), an enable toggle, edit, delete and
      expandable rules text. A create control adds an actor effect and opens the editor.
- [ ] Disabled effects stay listed with a visible "disabled" state.
- [ ] The system editor is the registered default for Active Effects and edits name, icon, enabled, rules text and
      source name. It hides statuses and duration.
- [ ] Pre-v0.9 effects (macro or module changes) stay listed and are not converted, classified or repaired. Opening and
      saving one in the editor preserves its stored changes byte-for-byte. The editor shows them as "other stored
      changes not managed by OpenQuest".
- [ ] An owner with edit permission on the actor can manage its effects without the Referee.
- [ ] Effects created on an unlinked token's sheet change only that token's actor; on a linked token they belong to the
      world actor. Duplicating, exporting and importing an actor keeps its effects and their enabled state.
- [ ] New strings live under `OQ.*`; icons come only from the themed set.
- [ ] Manual: the spec's Fx1 row "Any actor: add a reminder-only effect, reload" passes on a character and an NPC, plus
      enable/disable/delete with reloads, on linked and unlinked tokens.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
