# HP/MP rules and current behavior

Evidence supporting [Define excess HP/MP and temporary magical resource behavior](issues/02-resource-semantics.md).
This records source/code facts and examples, not answers to the open resource choices.

## Current code

| Route | Current behavior | Source |
| --- | --- | --- |
| Data schema | HP/MP current and maximum are integers at least zero. Current has no schema upper bound. | [Actor data model](../../src/module/dataModel/data-models-actor.js), lines 46–51 |
| Preparation | Calculates derived maxima, then caps prepared current at maximum without necessarily changing stored current. | [Base actor](../../src/module/document/actor/base-actor.js), lines 122–140 |
| Direct sheet edit | Number inputs display prepared current/max; no HTML upper/lower limits. Schema cleaning still applies. | [Attributes template](../../src/public/templates/actor/parts/attributes.hbs), lines 7–20 |
| Sheet increment/decrement | Both clamp current to 0…maximum. | [Base actor sheet](../../src/module/sheet/actor/actor-base-sheet.js), lines 264–273 |
| Chat damage | Subtracts armour when applicable and floors current HP at zero. | [Chat updates](../../src/module/chat-handlers/updates-from-chat.js), lines 20–40 |
| Chat healing | Caps resulting HP at maximum; existing excess could be lost. | [Chat updates](../../src/module/chat-handlers/updates-from-chat.js), lines 43–58 |
| Chat MP changes | Both positive and negative changes clamp current to 0…maximum. | [Chat updates](../../src/module/chat-handlers/updates-from-chat.js), lines 61–77 |
| Spell payment | Reads prepared MP, checks affordability again after the dialog, spends current MP and floors at zero. | [Spell document](../../src/module/document/item/spell.js), lines 78–104 |
| Token HUD | Installed core's attribute update clamps bar changes to 0…maximum; no system override currently exists. | `foundryvtt-api/client/documents/actor.mjs`, lines 409–422 |
| Token bar | Installed core caps rendered fill at 100%; its numeric accessor can still expose actual current/max. | `foundryvtt-api/client/canvas/placeables/token.mjs`, lines 1753–1755; `client/documents/token.mjs`, lines 554–582 |

For example, stored HP 15/10 prepares as 10/10. Applying 2 damage through chat then stores 8, losing the hidden excess.
Removing only the preparation cap would not fix all paths: existing healing can reduce an above-max value, and a sheet
decrement, MP spend or token HUD edit can also collapse it to maximum. A reviewable overflow chunk must cover these
routes together. No current mechanism adjusts current points when an effect changes maximum.

## SRD evidence

- [Vigour](../../docs/OpenQuest3-SRD/OQ3-SRD-Personal-Magic.adoc), lines 966–974: +2 magical HP per magnitude,
  no more than twice the original score; damage comes from magical HP first and damage to that portion disappears
  with the spell. The text does not unambiguously define the cap for an already-wounded target or a healing priority.
- Vigour example: ordinary HP 6/10 plus 4 magical HP takes 3 damage. Ordinary HP stays 6 and magical HP becomes 1;
  ending the spell leaves 6/10. With 7 damage instead, ordinary HP becomes 3, magical HP zero, and ending leaves 3/10.
  One combined value minus the original grant on expiration cannot reproduce both examples.
- [Tap](../../docs/OpenQuest3-SRD/OQ3-SRD-Sorcery.adoc), lines 1056–1064: each characteristic point tapped gives
  one MP; current MP is capped at twice the normal limit. Excess decays one MP per minute after the spell finishes.
  The spell does not increase normal MP maximum. Example: MP 8/10 plus 6 becomes 14/10; without spending, four minutes
  of excess decay returns 10/10. Separate-pool spending priority is not explicitly specified.
- [Ordinary MP recovery](../../docs/OpenQuest3-SRD/OQ3-SRD-Personal-Magic.adoc), lines 3–32: normal capacity is
  POW, zero MP causes unconsciousness, and resting cannot raise MP beyond its ordinary total.
- [Absorption](../../docs/OpenQuest3-SRD/OQ3-SRD-Divine-Magic.adoc), lines 614–640: converted MP above POW
  vanishes. Its interaction with pre-existing Tap excess is not specified. Permissive manual overflow does not mean
  every resource-gain rule should generate excess.
- [Enhance/Diminish POW](../../docs/OpenQuest3-SRD/OQ3-SRD-Sorcery.adoc), lines 545 and 587: specifically do not
  change MP. Their agreed treatment is recorded in the resolved mechanics decision.
- [Zero/negative HP](../../docs/OpenQuest3-SRD/OQ3-SRD-Combat.adoc), lines 1223–1234: the SRD discusses zero or
  fewer HP and intervention exceptions. The current implementation floors at zero; retaining that floor is a product
  choice, not a claim that the SRD forbids negative HP.

## Review boundaries exposed by these facts

Keep permissive excess values, maximum-effect transitions, and any dedicated magical-HP pool as separate candidate
chunks. The first changes preservation and update semantics; the second must apply the agreed maximum/current delta
once across effect lifecycle transitions; the third changes damage allocation and ending/healing behavior. Tap's
permanent drain, explicit gains and decay can use manual bookkeeping unless the user chooses more automation.
