# 11: Round clocks: five-second rounds, expiry at execution start

**What to build:** In combat, each round adds five seconds of world time, once, when execution starts; declaration adds
nothing. A one-round effect applied during round R's execution survives the next declaration and expires when
execution of R+1 starts. One applied while R+1 is being declared lasts through R+1 and expires when R+2 starts.
Expired effects stay visible and inactive until removed, and the Effects list shows remaining rounds and the expired
state. A round effect applied outside combat warns, in the dialog and on the sheet, that it won't expire automatically;
one whose combat ended or was deleted shows "combat ended" and stays until ended or edited. Effects with no clock never
expire. First slice of chunk **Clk1**; see [the spec](../spec.md), section "Clocks (Clk1)", and user stories 63–65,
69–73.

The system sets round time to five seconds and turn time to zero. Applied effects get core duration fields from their
recorded round duration and confirmed start; the declaration workflow's round-start dispatch at execution expires them.
The pure module computes start and deadline including the declaration rule, remaining rounds, and which round effects
lost their combat. Before writing code, check in the v14 sources how core computes round-based expiry from the start
round and which lifecycle event expires it under the system's declaration dispatch. Expiry here only marks the effect
expired; HP/MP adjustment and reload catch-up are ticket 13.

**Blocked by:** 03 (Application receipts, repeat clicks and the double-submit guard)

**Status:** ready-for-agent

- [ ] Round time is five seconds and turn time zero; starting execution advances world time by five seconds once,
      declaration advances nothing.
- [ ] Applied round effects carry core duration fields; they expire at the start of execution of the round after the
      last covered round, never at declaration.
- [ ] An application confirmed during declaration starts in the round being declared.
- [ ] Expired effects are inactive, visible and removable; the Effects list shows remaining rounds and the expired state.
- [ ] Round effects confirmed outside combat warn in the dialog and on the sheet; round effects whose combat ended or
      was deleted show "combat ended" and stay.
- [ ] Applied-effects module tests: round start and deadline including the declaration rule; remaining rounds; round
      effects whose combat is gone.
- [ ] Combat test file: entering declaration neither advances world time nor dispatches round-start expiry; starting
      execution of R+1 advances world time by 5 seconds once and dispatches the event that expires a one-round effect
      from round R.
- [ ] The Combat documentation page explains five-second rounds and expiry at execution start.
- [ ] Manual: the spec's Clk1 rows "Combat in round R execution", "Combat in declaration for R+1", "Indefinite
      reminder" and "Round effect, combat deleted" pass, with reloads.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
