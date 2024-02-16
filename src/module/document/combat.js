export class OQCombat extends Combat {
  async _onStartRound() {
    await this.resetInitiative();
    setTimeout(() => this.update({ turn: 0 }), 50); //FIXME: Ugh ugly, find a better way later.
  }

  async resetInitiative() {
    this.combatants.map((combatant) => {
      const newInitiative = combatant.actor?.system.attributes.initiative?.value;
      if (newInitiative !== combatant.initiative) {
        this.setInitiative(combatant.id, newInitiative);
      }
    });
  }
}
