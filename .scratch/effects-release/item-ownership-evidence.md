# Item ownership and effect-targeting evidence

Supporting facts for [Separate item-local effects, passive transfer, and applied templates](issues/05-item-ownership-and-transfer.md).
These are local source-inspection findings, not approved design choices or live Foundry validation.

## States and activation

- `src/module/consts/items-config.js` defines weapon readied/carried/stored/natural, armour
  worn/carried/stored/natural, and equipment readied/carried/stored. Equipment has no worn state.
- `src/module/dataModel/data-models-item.js` gives neither spells nor special abilities an activation toggle/state.
- `src/module/sheet/actor/actor-base-sheet.js:172` changes `system.state`. Armour contributes AP only while worn or
  natural (`src/module/document/actor/base-actor.js:169`). There is no state-dependent effect suppression policy.

## Core targeting and missing system integration

- Installed `foundryvtt-api/client/documents/active-effect.mjs:199` targets the parent Actor for actor effects;
  item effects target their owner when transfer is true and the Item otherwise.
- `foundryvtt-api/client/documents/actor.mjs:305` gathers actor effects and transferred item effects without copying
  transferred effects onto the actor. Deleting the source item removes its transferred contributions.
- `foundryvtt-api/client/documents/active-effect.mjs:191` checks system suppression or expiration; active status also
  checks disabled. Item-state gating needs system integration and must preserve expiration behavior.
- Core exposes Item targets but has no automatic Item effect-application loop. OQ's
  `src/module/document/item/base-item.js:39` currently computes roll/damage values only. Item-local calculations need
  explicit preparation work; selecting the correct target is insufficient.
- Actor-owned applied effects are separate documents. An origin pointing to a deleted item does not itself cause
  core to delete them. This fits the already-agreed independent historical application contract.

## References, copies and imports

- `src/module/document/item/skill.js:9` derives a skill slug from its name; actor preparation indexes skills by slug
  (`src/module/document/actor/base-actor.js:118`). Current weapon/spell skillReference fields use this map. Renames
  can break those existing references and duplicate slugs collide. New effect bindings have no stable mechanism yet.
- Core actor-sheet item drops (`foundryvtt-api/client/applications/sheets/actor-sheet.mjs:341`) copy rather than move.
  They keep an item ID only if it is free at the destination; the original remains. A repeated drop can create a
  further copy rather than update an existing item. OQ does not override that handler.
- Core clone (`foundryvtt-api/common/abstract/document.mjs:472`) normally drops the root ID and does not rewrite
  arbitrary internal references. JSON import (`foundryvtt-api/client/documents/abstract/client-document.mjs:1052`)
  preserves the destination root ID but embedded identities depend on imported data. Delete/reimport cannot be assumed
  to preserve a selected target's identity.

## Synthetic NPC recipients

- NPCs share the base actor implementation (`src/module/document/actor/npc-actor.js`).
- `foundryvtt-api/client/documents/token.mjs:249` resolves an unlinked token to its synthetic actor, parented by that
  token (`foundryvtt-api/common/documents/actor-delta.mjs:111`). Parent-qualified UUIDs distinguish token-local
  documents (`foundryvtt-api/common/utils/helpers.mjs:1542`). Resolve item bindings against the actual recipient
  actor's collection; a base world-actor ID cannot distinguish two unlinked NPC tokens.

## Planning boundary

The ticket records human choices and their status. This evidence file supplies current-code facts only; exact
representation and compatibility work must preserve the resolved application, lifetime and resource contracts.
