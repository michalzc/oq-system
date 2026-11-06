# 12: World-time clocks, hand-made durations and GM elapsed correction

**What to build:** A ten-minute effect applied at world time T expires when 600 seconds pass, in or out of combat,
without waiting for any combatant's turn. The Effects list shows remaining time. The applied duration starts at
confirmation; a GM can enter time already elapsed in the review dialog (rounds or world time), moving the start back,
so an application confirmed three rounds late has a deadline three rounds earlier. A Referee can also give effects they
create by hand a duration (clock, amount, start) in the effect editor and edit it later. Second slice of chunk
**Clk1**; see [the spec](../spec.md), section "Clocks (Clk1)", and user stories 66–69.

World-time clocks use core duration fields with no expiry event, so they expire on elapsed time alone. One clock per
effect; no conversion between clocks. Before writing code, check in the v14 sources which core duration fields give a
world-time clock with no expiry event.

**Blocked by:** 11 (Round clocks)

**Status:** ready-for-agent

- [ ] Applied world-time effects carry core duration fields from the recorded duration and confirmed start and expire
      on elapsed world time alone.
- [ ] The Effects list shows remaining world time.
- [ ] The review dialog shows a GM-only "already elapsed" field for the effect's clock that moves the start back.
- [ ] The effect editor offers duration controls (clock, amount, start) for actor effects; hand-made effects expire like
      applied ones.
- [ ] Applied-effects module tests: world-time start and deadline, remaining time, GM elapsed correction for both
      clocks.
- [ ] The Combat documentation page covers world-time durations and editing durations by hand.
- [ ] Manual: the spec's Clk1 rows "Ten-minute effect applied at world time T" and "Application confirmed 3 rounds
      late" pass, plus a hand-made effect with a duration.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
