# 04: Temporary HP on the token HUD and canvas bar

**What to build:** A Referee running combat from the canvas sees "+N" temporary HP next to the token HUD HP input and a
distinct marker on the canvas HP bar whenever temporary HP exists, even when the ordinary bar is full. Typing into the
HUD HP input agrees with chat and sheet: "-N" takes temporary HP first (FIFO), "+N" restores ordinary HP only up to
the maximum, an absolute number sets ordinary HP clamped to 0…maximum. Completes chunk **Res1**; see
[the spec](../spec.md), sections "Update routes" (token HUD row) and "Token presentation".

Implemented by overriding the actor's token-attribute modification for the HP bar, calling the actor's damage HP and
heal HP methods and the set-ordinary operation; other attributes keep core behavior.

**Blocked by:** 03 (HP damage and healing take temporary HP first)

**Status:** ready-for-agent

- [ ] HUD shows "+N" next to the HP input only when temporary HP is above zero.
- [ ] The canvas HP bar draws a small distinct marker when temporary HP exists, including at full ordinary HP; the bar
      still represents ordinary current / normal maximum, and default token bars stay HP and MP.
- [ ] HUD relative decrease, relative increase and absolute value behave as above; non-HP attributes keep core
      behavior.
- [ ] Unlinked tokens change only their own actor; linked tokens change the world actor.
- [ ] Manual: the spec's acceptance row "Token HUD -3, then +5, then 4" passes on linked and unlinked tokens of a
      character and an NPC, with reloads.
- [ ] The Actors documentation page explains the token display (edit the HTML source, regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
