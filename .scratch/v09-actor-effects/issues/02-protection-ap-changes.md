# 02: Protection: AP changes and contribution tooltips

**What to build:** A Referee adds a "Protection 3" effect with a +3 AP change to an actor wearing 2 AP armour, and the
sheet shows 5 AP with a marker. Hovering over it lists the contributing effects and amounts. Disabling, re-enabling,
deleting and reloading restore exactly the calculated value; no stored field changes. Second and last slice of chunk
**Fx1**; see [the spec](../spec.md), sections "Effect records", "Curated change vocabulary", "Pure
effect-contributions module", "Actor preparation order" and Fx1 user stories 4, 5, 7, 8, 11, 87, 88.

This slice introduces the main seam: a pure effect-contributions module, free of Foundry calls at import time, that
takes the active changes (with effect identity, name, source name and rules text) and returns the effective value and
source breakdown per target. It supports only the AP target for now, and later tickets extend it. The effect data
model gains the OpenQuest change fields (target, operation, value; minimum, selector and conditional come with the
targets that need them). Core key-path application skips OpenQuest changes. The `applyActiveEffects('initial')` call
stays for non-OpenQuest changes only. Confirm in the v14 sources that this override keeps core status and token change
handling.

**Blocked by:** 01 (Effects list with reminder-only effects)

**Status:** ready-for-agent

- [ ] The editor replaces free key/type/value rows with curated change rows offering only targets that exist (AP) and
      the operations each target allows (add, multiply, override). Unmanaged stored changes stay listed separately and
      are preserved on save.
- [ ] Per-target combination is deterministic: multipliers apply to the unmodified value, then additions, then an
      override replaces the result, then any minimum. With mixed multiplicative and additive contributions, or more
      than one override, the breakdown lists them all.
- [ ] Effect AP adds on top of native AP (base + modifier) and the best worn or natural armour, in derived data.
      Preparation never writes back to source.
- [ ] AP changed by effects shows a marker and a tooltip listing each contributing effect and amount.
- [ ] Effect-contributions module tests (new test file): AP add/multiply/override, combination order, multi-source and
      multi-override breakdowns, disabled effects contribute nothing.
- [ ] The Actors documentation page explains the Effects list, editor, reminder-only effects and contribution
      tooltips, with a Protection recipe (edit the HTML source and regenerate the journal sources).
- [ ] Manual: the spec's Fx1 rows "Worn armour 2 AP: add Protection 3; disable; enable; delete; reload after each"
      (5; 2; 5; 2 AP; no stored field changes) and "Two unlinked tokens of one actor" pass, on a character and an NPC.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
