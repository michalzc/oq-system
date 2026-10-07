/**
 * Mark arrivals in legacy running encounters, which do not have an execution snapshot yet. Core's roundJoined cannot
 * replace the flag: it is also set for participants who joined before the declaration upgrade and already have turns.
 */
export class OQCombatant extends foundry.documents.Combatant {
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    const combat = this.parent;
    if (game.combats.has(combat?.id) && combat.started && !combat.isDeclaration) {
      this.updateSource({ 'flags.oq.awaitingRound': combat.round + 1 });
    }
  }

  async _preUpdate(changed, options, user) {
    const declaration = this.flags.oq?.declaration;
    if (
      !this.parent.isDeclaration &&
      declaration?.round === this.parent.round &&
      'initiative' in changed &&
      changed.initiative !== declaration.total
    ) {
      ui.notifications.error('OQ.Combat.Errors.InitiativeFrozen', { localize: true });
      return false;
    }
    return super._preUpdate(changed, options, user);
  }
}
