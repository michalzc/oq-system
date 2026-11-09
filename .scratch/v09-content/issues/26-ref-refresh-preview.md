# 26: Ref: SRD spell refresh preview

**What to build:** A GM runs `game.oq.refreshSrdSpells()` and sees a preview grouped by actor, world items and unlinked
tokens, with nothing written. A renamed copy linked to the SRD pack is listed for refresh; a same-named custom spell is
only listed as information. Up-to-date copies are skipped, copies with hand-made effects are unchecked, and differences
in spell type, variability or MP cost are flagged. A player running it is refused. First slice of chunk **Ref**, which may
slip to 0.9.x as a unit; see [the spec](../spec.md), section "SRD spell refresh (Ref)",
[decision 10](../../effects-release/issues/10-srd-spell-refresh.md), and user stories 107–109, 113–116, 118.

A new pure refresh-plan module, free of Foundry calls at import time, turns the pack spell definitions and collected
candidates into grouped rows. Each row has a status (refreshable, up to date, has custom effects, rules shape differs,
duplicate, source no longer in SRD) and a default selection, and there is an informational unlinked-same-name list. The
callers are thin: the GM gate, collection and the preview dialog.

**Blocked by:** 04 (Sp1: per-N-magnitude step and movement and combat order spells)

**Status:** ready-for-agent

- [ ] `game.oq.refreshSrdSpells()` is manually invoked only, and runs for a GM only. A player is refused and nothing is
      collected.
- [ ] Collection covers world actors, the world Items directory and unlinked token actors on all scenes, and never
      compendia.
- [ ] Spells are matched only by their link to the SRD spells pack, never by name.
- [ ] The preview is an ApplicationV2 dialog in the light parchment theme, grouped by actor, world items and unlinked
      tokens, with each row's status and default selection.
- [ ] Copies with custom effects are unchecked, up-to-date copies are skipped, rules-shape differences are flagged,
      duplicates are listed independently, missing sources aren't selectable, and unlinked same-named spells are
      information only.
- [ ] Confirming in this slice writes nothing.
- [ ] Refresh-plan module tests (new test file): link-only matching, each status, default selections, duplicates, missing
      source, up-to-date detection.
- [ ] Manual: decision 10's preview steps pass on a world with a linked, a renamed, a custom-effect and an unlinked copy.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
