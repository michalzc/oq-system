# 04: Temporary HP on the token HUD and canvas bar

**What to build:** A Referee running combat from the canvas sees "+N" temporary HP next to the token HUD HP input and a
distinct marker on the canvas HP bar whenever temporary HP exists, even when the ordinary bar is full. Typing into the
HUD HP input agrees with chat and sheet: "-N" takes temporary HP first (FIFO), "+N" restores ordinary HP only up to
the maximum, an absolute number sets ordinary HP clamped to 0…maximum. Completes chunk **Res1**; see
[the spec](../spec.md), sections "Update routes" (token HUD row) and "Token presentation".

Implemented by overriding the actor's token-attribute modification for the HP bar, calling the actor's damage HP and
heal HP methods and the set-ordinary operation; other attributes keep core behavior.

**Blocked by:** 03 (HP damage and healing take temporary HP first)

**Status:** resolved

- [x] HUD shows "+N" next to the HP input only when temporary HP is above zero.
- [x] The canvas HP bar draws a small distinct marker when temporary HP exists, including at full ordinary HP; the bar
      still represents ordinary current / normal maximum, and default token bars stay HP and MP.
- [x] HUD relative decrease, relative increase and absolute value behave as above; non-HP attributes keep core
      behavior.
- [x] Unlinked tokens change only their own actor; linked tokens change the world actor.
- [x] Manual: the spec's acceptance row "Token HUD -3, then +5, then 4" passes on linked and unlinked tokens of a
      character and an NPC, with reloads.
- [x] The Actors documentation page explains the token display (edit the HTML source, regenerate the journal sources).
- [x] `yarn test`, `yarn lint` and `yarn build` pass (`yarn build:code` + `yarn check:packs` while the dev world ran).

## Comments

### 2026-11-26 implementation notes

- Module: `applyBarInput(state, value, isDelta)`: relative decrease → `spendPoints`, relative increase →
  `restorePoints`, absolute → `setOrdinaryPoints`; tested with the spec's HUD row as state-in/state-out.
- Actor: `OQBaseActor#modifyTokenAttribute` handles `attributes.hp` bars through `applyBarInput` and writes only the
  changed fields; other attributes go to core. The core `modifyTokenAttribute` hook is still called with the HP
  update and may veto it. `_onUpdate` sets `refreshBars` on the actor's rendered tokens when HP pools change, because
  core redraws bars only when their value changes (`TokenDocument#_onRelatedUpdate` animates `bar1`/`bar2`).
- Canvas: `OQToken` (`src/module/canvas/token.js`, `CONFIG.Token.objectClass`) draws a green dot at the right end of
  a bar whose attribute has temporary points (`attributes.hp` for now); the bar still shows ordinary / maximum.
  Default bars stay HP (bar1) and MP (bar2).
- HUD: a `renderTokenHUD` hook adds "+N" inside the right end of the bar's input (outside it, the HUD's side
  columns covered it); `pointer-events: none` keeps the input fully editable, so the marker has no tooltip.

### 2026-11-26 manual QA

Foundry 14.370, `oq-dev`, GM. Tokens `QA dmg PC linked/unlinked` and `QA dmg NPC linked/unlinked` (HP max 10), bars
set to always show for the test. The HUD was bound to each token and its bar1 input changed as a user would.

| Step | All four tokens |
| --- | --- |
| 10/10, no pools | no canvas marker, no HUD "+N" |
| Grant A=2 at 10/10 (pools change only) | canvas marker drawn on the full bar; HUD "+2" |
| HUD "-3" | 9/10, A=0; marker gone, no "+N" |
| HUD "+5" | 10/10, A=0 |
| HUD "4" | 4/10, A=0 |

- MP bar (bar2) "-2" from 5 → 3: core behaviour kept.
- The `modifyTokenAttribute` hook saw each HP change (e.g. `-3` → `value` and `pools`, `+5` → `value` only).
- Unlinked token set to 7 and granted 3 through its HUD/actor: the token showed 7/10 +3 while its base NPC stayed
  4/10 +0; linked tokens changed their world actors.
- After a reload every token kept its HP and pools, the marker showed on the two tokens with temporary HP, and the
  HUD read "7 +3" inside the input (screenshot). No console errors or warnings.
