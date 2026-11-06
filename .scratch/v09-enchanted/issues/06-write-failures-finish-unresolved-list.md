# 06: Write failures, idempotent Finish and the Unresolved casts list

**What to build:** A character with MP 8 plus 4 temporary MP casts a cost-5 spell and the payment write fails. The card
shows the cast as **unresolved** with what was and wasn't done. After the problem is fixed, **Finish** leaves temporary
0 and MP 7, once, however often it is clicked or the world reloaded. If the card is deleted (or never posted), the
caster's actor sheet lists the cast under **Unresolved casts** with Pay now / Finish, adjudicate and void. An actor
duplicated with an unpaid cast shows it on the copy as inert history with no actions, and the original still settles.
Completes chunk **Ench2**; see [the spec](../spec.md), section "Cast operation (Ench2)" (Idempotent steps, Unpaid,
Settlement actions, Serialization), "Copy, import and compatibility", and user stories 37, 49–50, 107–108.

Each step marks the operation id on the document it writes, in the same update: the paying actor records the ids it
has been debited for, and the card carries the id in its flags. A retry consults those markers, never the record alone,
to plan the remaining steps, so a crash between a debit and the record update can't debit twice. Debit markers for
incomplete operations are kept; retention of others is the implementer's choice. A failed write leaves the record
pending with the steps done so far. Copied records carry the original caster identity; on the copy they are inert.

**Blocked by:** 05 (Settle unpaid casts from the card)

**Status:** ready-for-agent

- [ ] A failed payment or card write leaves a pending record; the card (or, without a card, the actor sheet) shows the
      cast as unresolved with the completed and missing steps.
- [ ] Finish runs only the missing steps (pay, post card, settle), never rerolls, and never debits again when the
      source already carries the operation's marker.
- [ ] The actor sheet's Unresolved casts list shows every unpaid or pending operation of the actor with the same
      actions and permissions as the card.
- [ ] Operation records from another actor (copied with a duplicate or import) are listed as inert history with no
      actions; nothing settles or charges against the original from the copy.
- [ ] Magic-store module tests: remaining-step planning from markers (paid but card missing, debited but record not
      updated, unpaid, voided, adjudicated) and inert records from another caster.
- [ ] Spell-casting harness: a rejected payment update becomes an unresolved card instead of no card; a retry after
      "debited but record not updated" doesn't debit again.
- [ ] Manual: the spec's Ench2 rows "MP 8 + temporary 4: cast cost 5, actor update fails" and "Unpaid card deleted",
      and the "All" row "Actor with an unpaid cast: duplicate actor", pass, with reloads.
- [ ] The Magic documentation page covers unresolved casts, Finish and the actor-sheet list (edit the HTML source,
      regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
