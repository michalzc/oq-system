# 01: Condition palette replaces the core status list

**What to build:** A Referee opens any token's HUD and finds the seventeen OpenQuest conditions (Dead, Unconscious,
Asleep, Prone, Surprised, Fatigued, Heavily fatigued, Blinded, Deafened, Paralysed, Held, Entangled, Stuck, Burning,
Poisoned, Diseased, Invisible) with themed icons, each with its rules summary as a tooltip. Stunned, Shocked and the
other core entries are gone. Clicking Prone adds a **standalone marker**: a marker-only effect named after the
condition, with its icon, its single status and the rules summary as rules text, changing no numbers. Clicking again
removes exactly that effect and no other. Marking a token Blinded or Invisible leaves its vision, detection and
visibility alone; marking Dead from the tracker still makes the combatant defeated and skipped. First slice of chunk
**Cnd1**; see [the spec](../spec.md), sections "Condition palette", "Markers and standalone markers" (standalone
markers only), "Special statuses" and "Display surfaces" (token HUD), and user stories 1–7 (6 and 7 partly), 14–18,
28–30, 44.

The palette is configuration data exported from a module free of Foundry calls at import time. It replaces the core
status list during `init`, before world documents are prepared. Each entry has an id, a localized label, a localized
**rules summary** (scope per the spec's table, with SRD section references), a themed icon and a **fixed standalone
effect id**, so core's toggle creates and removes only that effect. Ids reuse the core ids where the condition is the
same (`dead`, `unconscious`, `sleep`, `prone`, `blind`, `deaf`, `paralysis`, `burning`, `poison`, `disease`,
`invisible`); new ids are `surprised`, `fatigued`, `heavilyFatigued`, `held`, `entangled`, `stuck`. Core `restrain` is
not mapped. The Blind and Invisible special-status mappings point at no palette condition; Dead stays the defeated
status; burrow, hover and fly keep core's mapping and are not shown on the HUD. Before writing code, check in the v14
sources (read `docs/foundry-v14-notes.md` first) that a fixed effect id is honoured by the status toggle, the HUD and
`fromStatusEffect` on world and synthetic actors; that removing the Blind and Invisible mappings is tolerated by token
vision and detection code; and how the tracker's defeated toggle calls the status toggle.

This ticket has no blockers: standalone markers are core effects with core fields, so it needs nothing from the
actor-effects track. It does touch the `init` effect configuration that
[actor-effects 01](../../v09-actor-effects/issues/01-effects-list-reminder-only.md) also touches; whichever lands
second rebases.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The token HUD lists exactly the seventeen palette conditions in the spec's table order, each with a distinct
      Game-Icons.net glyph in the themed two-colour style, kept in a conditions subfolder of the themed icon set (no
      legacy black copies), and its label and rules summary as the tooltip.
- [ ] Adding a palette condition from the HUD creates its standalone marker with the fixed id; removing it deletes only
      that effect, even when another effect carries the same status. An actor has at most one standalone marker per
      condition.
- [ ] Blinded and Invisible, on new and on stored pre-v0.9 effects, change no token vision, detection or visibility.
      Explicitly saved token settings are untouched.
- [ ] Dead set from the HUD or the tracker marks the combatant defeated, the tracker shows the skull, and skip-defeated
      keeps working. Nothing sets or clears Dead from HP or any other value.
- [ ] No palette condition changes a characteristic, movement, test, damage or HP, blocks an action, changes token
      settings or removes itself.
- [ ] Stored v0.8 effects with core statuses are kept as they are; none are converted or deleted.
- [ ] A player who owns a character can add and remove standalone markers on their own token.
- [ ] Palette data test (new test file): every entry has a unique id and a unique fixed standalone id, points to an
      existing themed icon, and has its label and rules summary keys in the English localization source.
- [ ] A new Conditions documentation page lists every palette condition with its rules summary and SRD references, and
      states the vision and Dead boundaries (edit the HTML source and regenerate the journal sources).
- [ ] New strings live under `OQ.*`.
- [ ] Manual: the spec's Cnd1 rows "Any token: open the token HUD", "Token with explicit vision settings", "Combat with
      skip-defeated on", "Any actor: add Fatigued, Heavily fatigued, Burning, Poisoned, Diseased", "Two unlinked tokens
      of one actor" and "Owned character, player user" pass, plus the Prone row without the sheet chip (token icon,
      skill test at 60, still there after reload). The v0.8-world row's "Blind no longer changes vision" part passes.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
