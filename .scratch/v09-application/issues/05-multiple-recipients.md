# 05: Multiple recipients, per-recipient outcomes and Retry failed

**What to build:** A player targets the whole party and applies a blessing to everyone in one action. Two tokens linked
to one actor count as one recipient; two unlinked goblins from one base actor are two recipients, each changing only its
synthetic actor while the base actor stays unchanged. Recipients the player can't update are listed as needing their
owner or the GM while the others are applied. After confirming, the dialog shows per-recipient results (applied, kept
existing, needs review, failed and why). One failure doesn't undo the others, and **Retry failed** retries only the
failures under the same confirmation. A short summary message with the originating card's visibility tells the table
who received it. This is chunk **App3**; see [the spec](../spec.md), sections "Pure applied-effects module" (recipient
resolution, outcomes) and "Application workflow" (Dialog, Outcomes), and user stories 34–41, 83.

Recipient resolution merges linked tokens of one actor and keeps each unlinked token's synthetic actor separate. Retry
reuses the application id, so the deterministic effect ids protect recipients already written. The single-result
notification from App1 is replaced by the results view.

**Blocked by:** 03 (Application receipts, repeat clicks and the double-submit guard)

**Status:** ready-for-agent

- [ ] The dialog is a multi-select prefilled from all targeted tokens plus Self; recipients the user can't update are
      shown as needing their owner or a GM and can't be selected.
- [ ] Linked tokens of one actor resolve to one recipient; unlinked tokens resolve to their own synthetic actors; the
      base actor is never changed.
- [ ] Each recipient is written independently; the dialog switches to per-recipient results after writing.
- [ ] Retry failed retries only failed recipients with the same application id; succeeded recipients get no second
      effect.
- [ ] A summary chat message lists outcomes with the originating card's visibility (whisper and blind respected).
- [ ] Applied-effects module tests: two linked tokens → one recipient; two unlinked tokens → two; outcomes and retry sets
      including partial failure and already-written recipients.
- [ ] The Magic documentation page explains multiple recipients and Retry failed.
- [ ] Manual: every App3 row of the spec's acceptance table passes, with a character and an NPC among the recipients.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
