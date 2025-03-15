export class OQCombat extends Combat {
  async startCombat() {
    await Promise.all(this.combatants.map((combatant) => combatant.rollInitiative()));
    return super.startCombat();
  }

  async nextRound() {
    const updates = this.combatants
      .filter((combatant) => combatant.actor && combatant.actor.system.attributes?.initiative?.value != null)
      .map((combatant) => {
        const initiative = combatant.actor.system.attributes.initiative?.value;
        return combatant.update({ initiative });
      });

    await Promise.all(updates);
    return super.nextRound();
  }
}
