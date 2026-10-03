import { SYSTEM_ID } from '../consts/consts.js';

const NEXT_ROUND_QUERY = `${SYSTEM_ID}.nextRound`;

export class OQCombat extends Combat {
  static registerQueries() {
    CONFIG.queries[NEXT_ROUND_QUERY] = async ({ combatId, round }) => {
      const combat = game.combats.get(combatId);
      // Skip stale requests, so a repeated "end turn" doesn't advance the round twice.
      if (combat?.round === round) await combat.nextRound();
    };
  }

  async startCombat() {
    await this.refreshInitiative();
    return super.startCombat();
  }

  async nextRound() {
    // Players can't update combatants they don't own, so the active GM refreshes initiative and advances the round.
    const gm = game.users.activeGM;
    if (!game.user.isGM && gm && game.user.hasPermission('QUERY_USER')) {
      await gm.query(NEXT_ROUND_QUERY, { combatId: this.id, round: this.round });
      return this;
    }

    // Refresh before advancing, so the new round starts with the first combatant in the new order.
    await this.refreshInitiative();
    return super.nextRound();
  }

  async refreshInitiative() {
    const updates = this.combatants.contents.flatMap((combatant) => {
      const initiative = combatant.actor?.system.attributes?.initiative?.value;
      const changed = combatant.isOwner && initiative != null && initiative !== combatant.initiative;
      return changed ? [{ _id: combatant.id, initiative }] : [];
    });

    if (updates.length) await this.updateEmbeddedDocuments('Combatant', updates);
  }
}
