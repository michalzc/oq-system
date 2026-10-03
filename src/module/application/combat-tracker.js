/**
 * Renders the core templates and adjusts them afterwards, so core changes come through without copying templates.
 * OQ initiative is derived from the actor and kept up to date by OQCombat: it can't be rolled or edited, and each
 * combatant shows the name of the item it comes from.
 */
export class OQCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  async _prepareTurnContext(combat, combatant, index) {
    const turn = await super._prepareTurnContext(combat, combatant, index);
    turn.initiativeName = combatant.actor?.system.attributes?.initiative?.name;
    return turn;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    if (options.parts.includes('header')) this.removeBulkRolls();
    if (options.parts.includes('tracker')) this.adjustTurns(context.turns ?? []);
  }

  removeBulkRolls() {
    // Spacers keep the encounter title centred, the same way core lays the header out for players.
    for (const button of this.element.querySelectorAll('[data-action="rollAll"], [data-action="rollNPC"]')) {
      const spacer = document.createElement('div');
      spacer.className = 'spacer';
      button.replaceWith(spacer);
    }
  }

  adjustTurns(turns) {
    const initiativeNames = new Map(turns.map((turn) => [turn.id, turn.initiativeName]));
    for (const combatant of this.element.querySelectorAll('.combat-tracker .combatant')) {
      combatant.querySelector('[data-action="rollInitiative"]')?.remove();
      this.makeInitiativeReadOnly(combatant);
      this.addInitiativeName(combatant, initiativeNames.get(combatant.dataset.combatantId));
    }
  }

  makeInitiativeReadOnly(combatant) {
    const input = combatant.querySelector('.initiative-input');
    if (!input) return;
    const span = document.createElement('span');
    span.className = 'initiative';
    span.textContent = input.value;
    input.replaceWith(span);
  }

  addInitiativeName(combatant, initiativeName) {
    const name = combatant.querySelector('.token-name .name');
    if (!name) return;
    const container = document.createElement('div');
    container.className = 'oq-token-name-container';
    name.replaceWith(container);
    name.classList.add('oq-token-name');
    container.append(name);
    if (initiativeName) {
      const label = document.createElement('div');
      label.className = 'initiative-name';
      label.textContent = initiativeName;
      container.append(label);
    }
  }
}
