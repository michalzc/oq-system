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

**Status:** resolved

- [x] Chat spend MP reports the total spent; chat gain MP reports the ordinary points actually gained.
- [x] Sheet input, label ±1 and HUD input for MP behave like their HP counterparts.
- [x] HUD shows "+N" next to the MP input and the canvas MP bar shows the marker when temporary MP exists.
- [x] Unlinked tokens change only themselves; linked tokens change the world actor.
- [x] Manual: the spec's acceptance rows "Spend 30 (no cap on generic pools)", "Chat gain MP 5" and the manual Tap
      bookkeeping row pass on a character and an NPC, linked and unlinked, with reloads.
- [x] The Chat documentation page covers the MP buttons with temporary MP (edit the HTML source, regenerate the
      journal sources).
- [x] `yarn test`, `yarn lint` and `yarn build` pass.

## Comments

### 2026-11-26 implementation notes

- Module: `availablePoints(state)` (ordinary plus every pool), tested.
- Actor: `spendMp`, `gainMp`, `setOrdinaryMp` and `availableMp()`. The HP and MP methods share private
  `#spend`, `#restore` and `#setOrdinary`, so both resources write `value`/`pools` the same way and only what
  changed. `modifyTokenAttribute` handles the `attributes.hp` and `attributes.mp` bars through a static map;
  other attributes keep core behaviour. `availableMp()` has no caller yet; ticket 07 uses it for affordability.
- Chat: the MP buttons call `spendMp` / `gainMp` and post after the update with the points actually spent (pools
  plus ordinary) or the ordinary points gained. The direction comes from the button's sign, so a rolled 0 on the
  decrease button (`data-value="-0"`) still reports "spent 0" (found in self-review: `parseInt('-0')` is −0).
- Sheet: the HP and MP inputs share the class `ordinary-points` with `data-resource-id` and have no `name`; typing
  calls `setOrdinaryHp` / `setOrdinaryMp`. The MP label's +1/−1 call `gainMp(1)` / `spendMp(1)`; the generic
  `inRangeValue` branch is gone (only HP and MP have the label action).
- Token: `TEMPORARY_POINT_BAR_RESOURCES` is `['hp', 'mp']`, so the HUD "+N" and the canvas marker cover MP, and
  bars redraw when MP pools change.
- Docs: Chat page (MP buttons with temporary MP, two message examples); Actors page (MP spending paragraph, the
  typed-value clamp for both resources, token bars and HUD for both). "Casting a spell still spends ordinary Magic
  Points only" holds until ticket 07.

### 2026-11-26 manual QA

Foundry 14.370, `oq-dev`, GM. Actors `QA MPR PC` (character) and `QA MPR NPC` (NPC), POW 10 (MP max 10), each with a
linked and an unlinked token. `/mp N` cards posted through the chat command, buttons clicked with the token
selected; sheet and pool editor driven through their DOM; HUD through `input[name=bar2]`.

| Row | All four tokens |
| --- | --- |
| MP 10/10 + A=25, spend 30 | 5/10, A=0; "has spent 30 magic points." |
| MP 8/10 + A=4, chat gain MP 5 | 10/10, A=4; "has gained 2 magic points." |
| Tap: MP 8, type 10 on the sheet, grant "Tap" 4; spend 3; lower Tap by 1 in the editor | 10/10 Tap=4; 10/10 Tap=1 ("has spent 3 magic points."); 10/10 Tap=0 |
| Label from 10/10 + A=1: −1, −1, +1, +1 | 10/10 A=0; 9/10; 10/10; 10/10 |
| Type 15, then −2 | 10 (field re-shows 10), then 0; pools untouched |
| HUD from 10/10 + A=2: "-3", "+5", "4" | 9/10 A=0; 10/10 A=0; 4/10 A=0; HUD showed "+2" beside the MP input |
| Chat −0 / +0 / −3 / +4 from 8/10 + A=2 | "spent 0" and "gained 0" with no change; 7/10 A=0; 10/10 A=0 ("gained 3") |

- Unlinked tokens: spending through chat changed only their deltas (8/10, Own=0) while the base actors and the linked
  token stayed 6/10 + Base=3. Linked tokens change the world actor.
- After a reload, all four tokens' MP and pools matched the pre-reload baseline.
- Canvas: every token with temporary MP showed the green marker at the right end of its MP bar; the HUD showed
  "6 +3" in the MP field and nothing beside the HP field (no HP pools). Screenshot checked.
- HP regression after the shared refactor: typing 50 → 8/8, label −1 took the pool, HUD "-3" took the pool then
  ordinary HP, chat heal 2 restored ordinary HP only.
- Console: only WebGL driver performance warnings. Not checked: a player client.

QA fixtures left in `oq-dev`: `QA MPR PC`, `QA MPR NPC` and their four `QA MPR *` tokens.

### 2026-11-26 review

Run inline by the implementing agent (this was a forked worker, which could not start the two review sub-agents);
standards from `CODING_STANDARDS.md` and `CLAUDE.md`, spec from this ticket and the spec's "Update routes" and
"Token presentation". Found and fixed: the "-0" chat button direction above. Checked: every MP route except spell
payment goes through the actor's resource methods (spell payment is ticket 07); updates carry only changed fields;
the documentation describes only what the branch does. A fresh two-axis review of the Res2 branch before its PR is
still worthwhile.

