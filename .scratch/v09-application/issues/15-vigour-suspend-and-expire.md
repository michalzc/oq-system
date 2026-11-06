# 15: Disabled or expired Vigour suspends or discards its pool

**What to build:** With HP 6/10, Vigour pool A=4 first and pool B=3 second, disabling Vigour suspends A: taking 5
damage empties B and drops HP to 4/10 while A keeps its 4 unavailable. Re-enabling restores exactly 4 in A's original
first place. A suspended Vigour whose deadline passes is expired and its pool discarded; re-enabling or reloading
recreates nothing. Second and last slice of chunk **Clk2**; see [the spec](../spec.md), section "Vigour (Clk2)", and
user stories 79, 80.

Preparation derives each linked pool's availability from its effect (unavailable while disabled, suppressed or
expired); nothing about availability is stored. The resource-points module's spend operation skips unavailable pools
without changing their position. Expiry removes linked pools in the active GM's expiry write, catch-up removes them too,
and catch-up removes linked pools whose effect no longer exists.

**Blocked by:** 14 (Vigour grants a temporary-HP pool linked to its effect), 13 (Expiry moves HP/MP once, and the GM
catches up after a reload)

**Status:** ready-for-agent

- [ ] Linked pool availability is derived in preparation from the effect's state; the sheet total counts only available
      points.
- [ ] Spending skips unavailable pools and keeps their position; restoring availability returns exactly the remainder.
- [ ] Expiry and catch-up discard the linked pool once; orphaned linked pools are removed by catch-up.
- [ ] The pool editor shows the suspended state.
- [ ] Resource-points module tests: spending skips unavailable linked pools and keeps their position; restoring
      availability returns exactly the remainder.
- [ ] Applied-effects module tests: catch-up selection of orphaned linked pools.
- [ ] The Magic documentation page covers suspended and expired Vigour.
- [ ] Manual: the spec's Clk2 rows "Disable Vigour; take 5; enable" and "Vigour suspended, deadline passes" pass, with
      reloads, on a linked and an unlinked token.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
