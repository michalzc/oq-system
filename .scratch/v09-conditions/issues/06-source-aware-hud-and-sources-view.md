# 06: Source-aware HUD and condition sources view

**What to build:** An actor has two hand-made Paralysed effects. On the token HUD, Paralysed looks source-backed, with
a badge of 2. Clicking it deletes nothing and opens the **condition sources** view: both sources, each with icon, name,
source name, kind and expandable rules text. The Referee ends one and the badge drops to 1 while the icon stays; ending
the other clears it. Inactive records carrying the condition are listed below with their reason. The same view opens
from the sheet's condition chips and from unmarking defeated while other effects still supply Dead. A player without
ownership sees it read-only. First slice of chunk **Cnd2**; see [the spec](../spec.md), section "Source-aware controls
(Cnd2)" (except passive switch-off), and user stories 31–35, 37–42 (passive parts excluded), 43.

The system's token HUD subclass computes each palette entry's state from the condition-sources module (off, standalone
only, or source-backed with the active source count) instead of core's single-status check, so multi-status effects
count and inactive effects don't. The module's toggle plan gains "open the sources view". Clicks: off adds the
standalone marker; standalone only removes it; source-backed opens the view. Right-click keeps core's overlay toggle for
the standalone marker only, and on a source-backed entry also opens the view. The view is an ApplicationV2 dialog in the
light parchment theme for one actor and one condition, a thin caller of the module, re-rendering on effect and item
changes. Ending an actor or applied effect goes through the same path as the Effects list (after confirmation), so
receipts and transitions follow. Before writing code, check in the v14 sources when the token HUD re-renders on effect
and item changes (read the v14 notes doc first).

**Blocked by:** 03 (Conditions field in the effect editor), 04 (Icon visibility for marked effects and reminders;
tracker tooltips)

**Status:** ready-for-agent

- [ ] HUD entries show three distinct states: off, standalone only (core's active look), source-backed (distinct style
      and a count badge). Disabled, suppressed and expired effects do not count.
- [ ] Clicks follow the plan above; nothing is deleted by clicking a source-backed entry.
- [ ] The sources view lists active sources (icon, name, source name, kind, expandable rules text) and inactive
      records with their reason. Per-row actions: open (the effect sheet), end (delete after confirmation through the
      Effects list path), remove (the standalone marker). It offers adding the standalone marker when absent.
- [ ] The sheet's condition chips open the view. Unmarking defeated from the tracker removes the standalone Dead marker
      and, when other sources still supply Dead, opens the view instead of only notifying.
- [ ] Actions follow the actor's permissions; others see the view read-only with the rules text.
- [ ] Ending a source on an unlinked token changes only that token's synthetic actor.
- [ ] Condition-sources module tests: HUD state (off, standalone only, source-backed with count, inactive sources not
      counted); toggle plans for off, standalone only, source-backed, and defeated removal with remaining sources.
- [ ] The Combat documentation page explains the sources view and the defeated toggle; the Conditions page explains
      HUD states and badges.
- [ ] Manual: the spec's Cnd2 rows "Two hand-made Paralysed sources", "Disabled effect carrying Prone", "Paralysed from
      a source only", "Dead from a hand-made effect plus standalone Dead", "Player observer on another's sheet" and "Two
      unlinked tokens; Paralysed source on one" pass, with reloads.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
