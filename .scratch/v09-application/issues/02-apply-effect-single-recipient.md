# 02: Apply effect from a successful spell card (one recipient)

**What to build:** A caster succeeds at Protection 3. The chat card shows **Apply effect**. The ally's owner (or the
GM) targets the ally's token, clicks it, and a review dialog opens prefilled with that target and an explicit **Self**
choice. It shows the recipient, the recorded magnitude, the resulting changes (+3 AP), rules text and the proposed start
and deadline. Confirming gives the ally one applied effect "Protection" from that caster, and AP goes from 2 to 5.
Applying never rolls or charges MP. Editing or deleting the caster's spell afterwards changes neither the card nor what
it applies. A caster who doesn't own the ally sees the ally listed as needing its owner or the GM. Second slice of
chunk **App1**; see [the spec](../spec.md), sections "Historical cast snapshot", "Pure applied-effects module",
"Application workflow" and "Representative content", and user stories 7–18, 23–25.

When a rolled spell test succeeds (success or critical) and the spell has templates, the card's author writes a
structured **cast snapshot** into the message's system flags at creation: format version, source name, item identity,
item type and spell type, speaker actor and token (for Self), magnitude, test outcome and, per template, key, name,
icon, rules text, resolved changes, resolved duration. Apply effect reads only the snapshot; rendered HTML is never
parsed. The review dialog is an ApplicationV2 dialog in the light parchment theme and a thin caller of the pure module.
The applied effect is an actor-owned effect carrying the resolved changes, rules text, icon, source name and identity,
template key, card message id, application id and recorded duration with its confirmed start. This slice records and
shows the duration but writes no core duration fields, so applied effects don't expire yet (Clk1). Before writing code,
check in the v14 sources how message content visibility works for whispered and blind cards (read the v14 notes doc
first).

**Blocked by:** 01 (Dormant effect templates on spells)

**Status:** ready-for-agent

- [ ] Successful rolled spell cards with templates store a cast snapshot in system flags and show Apply effect; failed
      and fumbled cards and spells without templates keep today's card.
- [ ] Apply effect is offered only to users who can read the card's content (whisper and blind respected).
- [ ] The dialog prefills the recipient from the user's targeted token and offers Self (the snapshot's speaker).
      Only a GM or the recipient actor's owner can confirm; other recipients are listed as needing their owner or a GM
      and can't be selected. Owning the caster or authoring the card grants nothing.
- [ ] The dialog shows recipient, recorded magnitude, resolved changes, rules text and proposed start and deadline;
      cancel changes nothing.
- [ ] Confirming creates one applied effect with the recorded values and source name; it survives edit, transfer and
      deletion of the originating spell. The card shows the recorded source name when the source is gone.
- [ ] Applying never rolls, never charges MP and never re-reads the live spell.
- [ ] Pre-v0.9 cards offer no Apply effect and are unchanged. A v0.9 card whose snapshot fails validation shows Apply
      effect disabled with an explanation and a pointer to the manual recipe.
- [ ] The SRD Protection spell ships with its template in the pack source (per-magnitude +1 AP, ten-minute world-time
      duration); the coverage inventory row for Protection is updated once the inventory exists.
- [ ] Applied-effects module tests: snapshot validation (unknown version, missing fields); recipient resolution of one
      targeted token and of Self from a speaker token; permission (GM, recipient owner, caster-only user); proposed start
      and deadline for world-time and round durations.
- [ ] The Magic documentation page explains Apply effect, the review dialog and permissions, with the manual recipe for
      cards without a snapshot.
- [ ] Manual: the spec's App1 rows "Edit or delete the caster's spell; ally owner applies", "Caster clicks Apply
      effect", "Protection cast failed", "Pre-v0.9 spell card" and "Blind cast card" pass, on a character and an NPC
      recipient, linked and unlinked token, with reloads.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
