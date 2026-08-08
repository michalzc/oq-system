export class OQCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  static PARTS = {
    header: {
      template: 'systems/oq/templates/applications/combat-tracker/header.hbs',
    },
    tracker: {
      template: 'systems/oq/templates/applications/combat-tracker/tracker.hbs',
      scrollable: [''],
    },
    footer: {
      template: 'templates/sidebar/tabs/combat/footer.hbs',
    },
  };

  async _prepareTurnContext(combat, combatant, index) {
    const turn = await super._prepareTurnContext(combat, combatant, index);
    turn.initiativeName = combatant.actor?.system.attributes?.initiative?.name;
    return turn;
  }
}
