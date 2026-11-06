# 06: MP spend and gain routes take temporary MP first

**What to build:** Spending MP from the chat "spend MP" button, the MP label's right-click −1 or "-N" in the token HUD
MP input takes temporary MP first, oldest pool first, then ordinary MP, floored at zero. The chat "gain MP" button, +1
and "+N" restore ordinary MP only, up to the maximum, and never create or refill pools. Typing an MP number on the sheet
or an absolute value in the HUD sets ordinary MP clamped to 0…maximum. The token HUD and canvas MP bar show temporary
MP the same way as HP. Part of chunk **Res2**; see [the spec](../spec.md), sections "Actor-level interface", "Update
routes" and "Token presentation".

The base actor gains spend MP, gain MP and read available MP (ordinary plus temporary), wrapping the existing
resource-points operations; the token-attribute override is extended to the MP bar.

**Blocked by:** 04 (Temporary HP on the token HUD and canvas bar), 05 (Temporary MP pools)

**Status:** ready-for-agent

- [ ] Chat spend MP reports the total spent; chat gain MP reports the ordinary points actually gained.
- [ ] Sheet input, label ±1 and HUD input for MP behave like their HP counterparts.
- [ ] HUD shows "+N" next to the MP input and the canvas MP bar shows the marker when temporary MP exists.
- [ ] Unlinked tokens change only themselves; linked tokens change the world actor.
- [ ] Manual: the spec's acceptance rows "Spend 30 (no cap on generic pools)", "Chat gain MP 5" and the manual Tap
      bookkeeping row pass on a character and an NPC, linked and unlinked, with reloads.
- [ ] The Chat documentation page covers the MP buttons with temporary MP (edit the HTML source, regenerate the
      journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
