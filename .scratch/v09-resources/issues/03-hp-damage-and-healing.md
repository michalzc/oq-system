# 03: HP damage and healing take temporary HP first (chat and sheet)

**What to build:** Damage from a chat card takes temporary HP first, draining the oldest pool completely before the
next, then ordinary HP, floored at zero, and the chat message says how much temporary HP absorbed. Healing restores
ordinary HP only, up to the maximum, and never refills pools. On the sheet, typing an HP number sets ordinary HP
clamped to 0…maximum without touching pools, the HP label's +1 heals and its right-click −1 damages. Part of chunk
**Res1**; see [the spec](../spec.md), sections "Pure resource-points module", "Actor-level interface" and "Update
routes".

The resource-points module gains spend/damage, restore and set ordinary, each returning the new state and a breakdown
of points taken from pools and from ordinary HP. The base actor gains damage HP and heal HP, each one document update
of ordinary current and the pool list together. Every HP route on chat and sheet calls these methods instead of writing
the stored field directly.

**Blocked by:** 02 (HP pool editor: grant, correct, remove)

**Status:** resolved

- [x] Normal chat damage subtracts armour first; a fully soaked hit leaves pools untouched and reports "soaked".
      "Ignore armour" damage also goes to pools first.
- [x] The damage message reports total damage taken and the part absorbed by temporary HP.
- [x] Healing reports the ordinary points actually restored; healing at full ordinary HP reports nothing healed and
      leaves pools intact.
- [x] Spending skips exhausted pools; damage beyond all points floors ordinary HP at zero.
- [x] Typing ordinary HP above the maximum stores the maximum; no route stores ordinary HP above the normal maximum.
- [x] Chat targeting is unchanged: controlled tokens, deduplicated actors, synthetic actors for unlinked tokens, so
      unlinked tokens change only themselves and linked tokens change the world actor.
- [x] Resource-points module tests for every HP acceptance example as state-in/state-out, FIFO across several pools
      including exhausted ones, floor at zero, restore capped at maximum and never changing pools.
- [x] Manual: the spec's HP acceptance rows for chat damage, damage 7, heal 4, normal damage with AP 2, sheet
      right-click and "Converted HP 10/10 + recovered 5, damage 3 then heal" pass on a character and an NPC, linked
      and unlinked, with reloads.
- [x] The Chat documentation page explains damage absorption and healing (edit the HTML source, regenerate the journal
      sources).
- [x] `yarn test`, `yarn lint` and `yarn build` pass (`yarn build:code` + `yarn check:packs` while the dev world ran).

## Comments

### 2026-11-25 implementation notes

- Module: `spendPoints(state, amount)` → `{state, fromPools, fromOrdinary}`, `restorePoints(state, amount)` →
  `{state, restored}`, `setOrdinaryPoints(state, value)` → `{state}`, over `ResourceState {value, max, pools}`.
  Amounts must be nonnegative whole numbers; ordinary points are clamped to 0…max(0, maximum).
- Actor: `resourceState(resource)` (prepared ordinary current and maximum, stored pools), `damageHp`, `healHp`,
  `setOrdinaryHp`; each writes `hp.value` and `hp.pools` in one update.
- Chat: armour is subtracted first for normal damage; zero left → "soaked" with no update. Otherwise `damageHp`, and
  the message reports the HP actually taken, with the absorbed part when pools took any (new
  `OQ.Chat.damageAbsorbed`). Healing reports the ordinary HP actually restored ("has gained 0 hit points" at full).
  The message is now posted after the update, since it needs the breakdown. Targeting is unchanged.
- Sheet: the HP input has no `name` any more (like item advances): its change calls `setOrdinaryHp`, so typing
  never goes through the form's update of the stored field. Label +1 → `healHp(1)`, −1 → `damageHp(1)`. MP keeps
  its old routes until ticket 06.
- Docs: Chat page (absorption, healing, message examples and a worked example) and the Actors page (damage takes
  temporary points first, label clicks, typed values clamped).

### 2026-11-25 manual QA

Foundry 14.370, `oq-dev`, GM. Character and NPC with SIZ 10, CON 10 (HP max 10), each on a linked and an unlinked
token (`QA dmg *`); `/hp N` cards posted through the chat command and their buttons clicked with the token selected.

| Row (spec) | All four tokens |
| --- | --- |
| 6/10, A=4 then B=3; damage 5 ignoring armour | 6/10, A=0, B=2; "has taken 5 points of damage, 5 of them absorbed by temporary hit points." |
| 6/10 + A=4; damage 7 | 3/10, A=0; "7 points of damage, 4 of them absorbed" |
| 6/10, A=1, B=2; heal 4 | 10/10, A=1, B=2; "has gained 4 hit points." Heal 3 again: "has gained 0 hit points.", pools intact |
| 10/10 + A=2, AP 2; normal damage 3 | 10/10, A=1; "1 points of damage, 1 of them absorbed". Normal damage 1: "soaked all damage.", A=1 |
| 10/10 + A=2; sheet right-click HP label | 10/10, A=1; two more: 9/10, A=0; left-click: 10/10, A=0 |
| Converted 10/10 + Recovered excess 5; damage 3, then heal 5 | Recovered excess 2; "has gained 0 hit points." |
| Type 15 into the HP field (6/10 + A=2) | Stored 10, A=2 untouched |

- Linked tokens changed the world actors; unlinked tokens stored `value` and `pools` in their own deltas, leaving
  the base actors alone. After a reload every token's stored HP and pools were unchanged.
- No console errors or warnings.
- Right-click actions in ApplicationV2 fire on `auxclick` (`client/applications/api/application.mjs:1892`);
  a synthetic `contextmenu` does nothing, which matters for scripted QA.
