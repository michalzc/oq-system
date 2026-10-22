# Application workflow: current-code evidence

Supporting facts for [Specify Apply effect on spell and ability result cards](issues/04-chat-card-application.md).
These facts do not approve the application policies currently being discussed.

## Existing cast and use paths

- `src/module/document/item/spell.js:107`: non-rolled divine casting confirms magnitude, rechecks the available
  magnitude, spends it once and posts `spell-cast.hbs` with `rollable: false`. There is no Apply effect action.
- `src/public/templates/actor/parts/ability.hbs:5`: abilities have a test action only when their roll value is truthy.
  Otherwise the icon posts their description. The inherited generic test method is not a non-rolled activation path.
- `src/module/utils/roll.js:75`: messages persist rendered HTML, dice and a message-type flag. Displayed magnitude
  is historical HTML, not a structured effect/template, duration, parameter or application snapshot.

## Follow-up rolls

- `src/module/chat-handlers/updates-from-chat.js:80`: damage actions resolve the original item UUID and call its
  current damage-roll method. Deleting the item prevents that action; current actor ownership is required.
- `src/module/document/item/base-item.js:122`: that method reads current prepared damage values and actor roll data.
  Preserving historical contributions requires a captured-data path rather than that live lookup.
- `src/module/application/test-roll-dialog.js:15`: the current dialog returns difficulty, modifier and message mode.
  Conditional-effect selection is planned, not implemented.

## Recipients and authority

- `src/module/chat-handlers/updates-from-chat.js:5`: existing resource buttons operate on controlled tokens,
  deduplicate actors and update resources directly. They supply no effect-recipient dialog, target selection,
  explicit permission filtering, GM relay or repeat-application/conflict handling.
- `src/module/document/combat.js:71`: declaration requests demonstrate active-GM queries, authenticated requester
  validation, ownership rechecks, timeout handling and serialized mutations. This is a pattern, not an existing
  effect-application service.
- Installed core `foundryvtt-api/common/documents/active-effect.mjs:108`: creating an embedded ActiveEffect requires
  ownership of its parent. Actor ownership must therefore be checked for the actual recipient.
- Installed core `foundryvtt-api/common/documents/chat-message.mjs:94`: authors own their messages. A recipient owner
  may be allowed to update their actor without being allowed to update somebody else's cast-card receipt.
- Installed core `foundryvtt-api/client/documents/token.mjs:245`: an unlinked token has its own synthetic actor.
  Preserve scene/token identity; looking up the base world actor does not identify that recipient. Linked tokens
  sharing a world actor must not accidentally produce duplicate application to that actor.
- Installed core `foundryvtt-api/client/documents/chat-message.mjs:69`: message visibility and content visibility
  differ, including blind and whispered rolls. Visible button HTML is not sufficient authorization.

## Constraints already decided elsewhere

The resolved mechanics, resource and lifetime tickets require explicit human application/adjudication, no second
casting payment, no automatic next-use consumption, visible human duplicate/conflict decisions and source-specific
pool cleanup. The current application ticket owns the recipient, permission, snapshot and repeat-action experience;
it must reuse those policies rather than introduce another stacking or lifetime rule.
