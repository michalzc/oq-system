# 04: Characteristic changes: effective vs learned values

**What to build:** A Referee adds Enhance STR +2 and sees STR rise, Close Combat rise with it, the Damage Modifier cross
its threshold and weapon damage update; removing it restores everything. CON and SIZ changes recalculate the HP normal
maximum. Halving rounds down and Diminish never goes below 1. A skill pushed to 100% or more only by an effect does not
make the character a Master, and the skill tooltip reveals the learned value. POW effects never change MP. This is
chunk **Fx3**; see [the spec](../spec.md), sections "Actor preparation order" (steps 1 and 2) and "Curated change
vocabulary", and user stories 22–31.

The actor keeps native characteristic values (base + modifier) as **unmodified** values and derives **effective**
values from the effect contributions. HP maximum, Damage Modifier and `getDataForItems` read effective values; MP
maximum reads unmodified POW. Skills compute an **effective value** from effective characteristics and a **learned
value** from unmodified ones; Master eligibility reads the learned value (both learned and Modified skill at 100% or
more, under the existing mastery Rule Option). Current HP does not move when the HP maximum changes (that is ticket 05).
Document this interim behaviour in the notes.

**Blocked by:** 02 (Protection: AP changes and contribution tooltips)

**Status:** ready-for-agent

- [ ] The editor offers a characteristic target (STR, CON, DEX, SIZ, INT, POW, CHA) with add, multiply and override and
      an optional minimum. Results round down after multiplication.
- [ ] Skills, Damage Modifier, weapon damage and HP normal maximum use effective characteristics; MP normal maximum
      uses unmodified POW.
- [ ] Skills expose effective and learned values; Master eligibility uses the learned value.
- [ ] Characteristics and skills changed by effects show a marker and tooltip; the skill tooltip shows the learned
      value.
- [ ] The characteristics dialog and native modifiers work as today.
- [ ] Effect-contributions module tests: INT 13 halved → 6, Diminish −20 min 1 → 1, combination order, POW
      contributions excluded from MP maximum, learned vs effective skill and Master eligibility.
- [ ] The Actors documentation page explains effective and learned values and gives an Enhance STR recipe, noting that
      current HP does not yet follow maximum changes.
- [ ] Manual: the spec's Fx3 rows (Enhance STR on STR 12/SIZ 13/DEX 14; Deception learned 98 with Enhance DEX +4;
      INT 13 halve and Diminish; MP 8/10 with Enhance POW +3) pass on a character and an NPC with reloads.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
