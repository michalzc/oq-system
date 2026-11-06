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

**Status:** ready-for-agent

- [ ] Normal chat damage subtracts armour first; a fully soaked hit leaves pools untouched and reports "soaked".
      "Ignore armour" damage also goes to pools first.
- [ ] The damage message reports total damage taken and the part absorbed by temporary HP.
- [ ] Healing reports the ordinary points actually restored; healing at full ordinary HP reports nothing healed and
      leaves pools intact.
- [ ] Spending skips exhausted pools; damage beyond all points floors ordinary HP at zero.
- [ ] Typing ordinary HP above the maximum stores the maximum; no route stores ordinary HP above the normal maximum.
- [ ] Chat targeting is unchanged: controlled tokens, deduplicated actors, synthetic actors for unlinked tokens, so
      unlinked tokens change only themselves and linked tokens change the world actor.
- [ ] Resource-points module tests for every HP acceptance example as state-in/state-out, FIFO across several pools
      including exhausted ones, floor at zero, restore capped at maximum and never changing pools.
- [ ] Manual: the spec's HP acceptance rows for chat damage, damage 7, heal 4, normal damage with AP 2, sheet
      right-click and "Converted HP 10/10 + recovered 5, damage 3 then heal" pass on a character and an NPC, linked
      and unlinked, with reloads.
- [ ] The Chat documentation page explains damage absorption and healing (edit the HTML source, regenerate the journal
      sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
