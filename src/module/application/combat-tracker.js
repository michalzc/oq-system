import { getDeclaration, getInitiativeOptions } from '../utils/initiative.js';

export class OQCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  static DEFAULT_OPTIONS = { classes: ['oq-combat-tracker'] };
  static PARTS = {
    header: { template: 'systems/oq/templates/applications/combat-tracker/header.hbs' },
    tracker: { template: 'systems/oq/templates/applications/combat-tracker/tracker.hbs', scrollable: [''] },
    footer: { template: 'systems/oq/templates/applications/combat-tracker/footer.hbs' },
  };

  async _prepareCombatContext(context, options) {
    await super._prepareCombatContext(context, options);
    const combat = this.viewed;
    Object.assign(context, {
      declaration: combat?.isDeclaration,
      displayRound: combat?.declarationRound,
      canStartRound: combat?.combatants.some((c) => combat.isEligible(c)),
      canPreviousTurn: !combat?.isDeclaration && combat?.turn > combat?.firstEligibleTurn,
      // Ownership is checked on the GM when advancing, including the last turn of a round.
      control: !combat?.isDeclaration && combat?.combatant?.actor?.isOwner,
    });
  }

  async _prepareTrackerContext(context, options) {
    await super._prepareTrackerContext(context, options);
    const combat = this.viewed;
    if (!combat) return;
    // Late arrivals remain visible and retain all token controls, but are outside combat.turns.
    for (const combatant of combat.combatants) {
      if (combat.isAwaiting(combatant) && combatant.visible) {
        context.turns.push(await this._prepareTurnContext(combat, combatant, -1));
      }
    }
  }

  async _prepareTurnContext(combat, combatant, index) {
    const turn = await super._prepareTurnContext(combat, combatant, index);
    const declaration = combat.isDeclaration ? getDeclaration(combatant.actor) : combatant.flags.oq?.declaration;
    Object.assign(turn, {
      declaration: combat.isDeclaration,
      declarationEditable: !!combatant.actor && (game.user.isGM || combatant.actor.isOwner),
      actorless: !combatant.actor,
      awaiting: combat.isAwaiting(combatant),
      initiativeOptions: getInitiativeOptions(combatant.actor),
      reference: declaration?.reference ?? '',
      mod: declaration?.mod ?? 0,
      signedMod: (declaration?.mod ?? 0) >= 0 ? `+${declaration?.mod ?? 0}` : `${declaration.mod}`,
      actionName:
        (declaration ? declaration.name : combatant.actor?.system.attributes?.initiative?.name) ||
        game.i18n.localize('OQ.Combat.NoAction'),
      initiative: declaration?.total ?? turn.initiative,
      declarationRound: combat.declarationRound,
      encounterId: combat.id,
    });
    return turn;
  }

  _getEntryContextOptions() {
    return super
      ._getEntryContextOptions()
      .filter((entry) => !['COMBATANT.ACTIONS.Clear', 'COMBATANT.ACTIONS.Reroll'].includes(entry.label));
  }

  _getCombatContextOptions() {
    return super._getCombatContextOptions().filter((entry) => entry.label !== 'COMBAT.InitiativeReset');
  }

  _attachFrameListeners() {
    super._attachFrameListeners();
    // Declaration fields live within core's clickable combatant row.
    for (const type of ['click', 'dblclick']) {
      this.element.addEventListener(
        type,
        (event) => {
          if (event.target.matches('[data-declaration-field]')) event.stopPropagation();
        },
        { capture: true },
      );
    }
    this.element.addEventListener('input', (event) => {
      if (event.target.matches('[data-declaration-field="mod"]')) event.target.dataset.dirty = 'true';
    });
  }

  async _onChangeInput(event) {
    const input = event.target;
    if (!input.matches('[data-declaration-field]')) return super._onChangeInput(event);
    const combat = this.viewed;
    const row = input.closest('[data-combatant-id]');
    if (!combat?.isDeclaration || !row) return;
    const field = input.dataset.declarationField;
    let value = input.value;
    if (field === 'mod') {
      if (!/^[+-]?\d+$/.test(value.trim()) || !Number.isSafeInteger(Number(value))) {
        ui.notifications.error(game.i18n.localize('OQ.Combat.IntegerModifier'));
        return;
      }
      value = Number(value);
    }
    delete input.dataset.dirty;
    try {
      await combat.updateDeclaration(
        row.dataset.combatantId,
        { [field]: value },
        {
          phase: 'declaration',
          round: Number(row.dataset.declarationRound),
          turn: null,
        },
      );
    } catch {
      // OQCombat reports the actionable error; restore the authoritative value on failure.
      this.render();
    }
  }

  async _onClickAction(event, target) {
    try {
      await super._onClickAction(event, target);
    } catch {
      /* OQCombat has already displayed the request failure. */
    }
  }

  _preSyncPartState(partId, newElement, priorElement, state) {
    super._preSyncPartState(partId, newElement, priorElement, state);
    if (partId !== 'tracker') return;
    for (const oldInput of priorElement.querySelectorAll('[data-declaration-field]')) {
      const row = oldInput.closest('[data-combatant-id]');
      const newRow = [...newElement.querySelectorAll('[data-combatant-id]')].find(
        (candidate) =>
          candidate.dataset.combatantId === row.dataset.combatantId &&
          candidate.dataset.encounterId === row.dataset.encounterId &&
          candidate.dataset.declarationRound === row.dataset.declarationRound,
      );
      const next = newRow?.querySelector(`[data-declaration-field="${oldInput.dataset.declarationField}"]`);
      if (!next || next.disabled) continue;
      if (oldInput.dataset.dirty) {
        next.value = oldInput.value;
        next.dataset.dirty = 'true';
      }
      if (oldInput === document.activeElement) {
        state.declarationFocus = next;
        state.declarationSelection = [oldInput.selectionStart, oldInput.selectionEnd];
      }
    }
  }

  _syncPartState(partId, newElement, priorElement, state) {
    super._syncPartState(partId, newElement, priorElement, state);
    state.declarationFocus?.focus({ preventScroll: true });
    if (state.declarationFocus?.matches('input')) {
      state.declarationFocus.setSelectionRange(...state.declarationSelection);
    }
  }
}
