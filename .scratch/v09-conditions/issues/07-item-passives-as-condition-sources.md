# 07: Item passives as condition sources

**What to build:** A creature's special ability has an "owner while active" passive carrying Paralysed. The token shows
the Paralysed icon, the tracker tooltip and the sheet chip name the ability, and the HUD shows Paralysed source-backed
with a badge of 1. From the condition sources view the Referee switches the passive off: the ability item stays, the
condition clears, and switching it back on restores it. A readied amulet's passive carrying Diseased disappears from the
HUD and token once the amulet is stored, and the view lists it as inactive (item not in an eligible state). Second and
last slice of chunk **Cnd2**; see [the spec](../spec.md), sections "Source-aware controls (Cnd2)" (passive switch-off)
and "Display surfaces", and user stories 27, 34, 36, 37.

Passive records reach the condition-sources module with owner kind "item", the item id and name, and their suppression
as inactive reason; the module already classifies them (ticket 02). Switching off writes the passive's switch on its
item, following the item's permissions; it never deletes the item and never creates an actor-owned mirror. "Open" on a
passive opens its definition on the item.

**Blocked by:** 06 (Source-aware HUD and condition sources view),
[actor-effects 16 (Creature ability passives)](../../v09-actor-effects/issues/16-creature-ability-passives.md),
which closes Itm2 (owner passives from items and abilities)

**Status:** ready-for-agent

- [ ] Active item passives carrying a condition count on the HUD and show on the token, in the tracker tooltip and in
      the sheet summary with their item name.
- [ ] The sources view shows passives with their item name; "switch off" sets the passive's switch off on the item,
      and a switched-off or ineligible passive appears among inactive records with its reason.
- [ ] Switch-off follows the item's permissions; users without them see it read-only.
- [ ] Passives on an unlinked token's items affect only that token's actor.
- [ ] Condition-sources module tests: item-passive sources with item name; a suppressed passive is inactive with its
      reason and not counted in the HUD state.
- [ ] The Conditions documentation page covers passives as sources, with a creature ability recipe.
- [ ] Manual: the spec's Cnd2 rows "Creature ability passive carrying Paralysed" and "Readied amulet passive carrying
      Diseased" pass, with reloads.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
