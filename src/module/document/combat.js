import { getDeclaration, getInitiativeItems } from '../utils/initiative.js';

const DECLARATION_QUERY = 'oq.combatDeclaration';

export class OQCombat extends Combat {
  // One queue on the active GM serializes edits, starts, and turn boundaries for each encounter.
  _declarationQueue = Promise.resolve();

  static registerQueries() {
    CONFIG.queries[DECLARATION_QUERY] = async (request, { user }) => {
      if (!game.user.isActiveGM) throw new Error('OQ.Combat.Errors.GmChanged');
      const combat = game.combats.get(request.combatId);
      if (!combat) throw new Error('OQ.Combat.Errors.NoEncounter');
      return combat._enqueueRequest(request, user);
    };
  }

  get isDeclaration() {
    return this.flags.oq?.phase === 'declaration' || !this.started;
  }

  get declarationRound() {
    return this.isDeclaration ? this.flags.oq?.targetRound ?? this.round + 1 : this.round;
  }

  get nextCombatant() {
    return this.isDeclaration ? null : super.nextCombatant;
  }

  isAwaiting(combatant) {
    if (this.isDeclaration) return false;
    const ids = this.flags.oq?.executionIds;
    return ids ? !ids.includes(combatant.id) : combatant.flags.oq?.awaitingRound > this.round;
  }

  isEligible(combatant) {
    return !this.isAwaiting(combatant) && (!this.settings.skipDefeated || !combatant.isDefeated);
  }

  get firstEligibleTurn() {
    return this.turns.findIndex((combatant) => this.isEligible(combatant));
  }

  /** Core's composition handlers use this too. Never let removing a row increment the round. */
  setupTurns() {
    const ids = this.flags.oq?.executionIds;
    const turns = this.combatants.contents.filter((c) => !this.isAwaiting(c));
    if (!this.isDeclaration && ids) turns.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    else turns.sort(this._sortCombatants);
    // A defeated current combatant stays current, as in core; ending its turn opens the declaration phase.
    if (this.isDeclaration || !turns.length) this.turn = null;
    else if (this.turn !== null) this.turn = Math.min(Math.max(this.turn, 0), turns.length - 1);
    turns.forEach((c, i) => (c.turnNumber = i));
    this.turns = turns;
    this.current = this._getCurrentState();
    this.previous ??= { ...this.current };
    return turns;
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    if (!data.round) {
      this.updateSource({ turn: null, 'flags.oq.phase': 'declaration', 'flags.oq.targetRound': 1 });
    }
  }

  _requestState() {
    return { phase: this.isDeclaration ? 'declaration' : 'execution', round: this.declarationRound, turn: this.turn };
  }

  async _request(operation, data = {}, state = this._requestState()) {
    try {
      const gm = game.users.activeGM;
      if (!gm) throw new Error('OQ.Combat.Errors.NoGM');
      const request = { combatId: this.id, operation, ...state, ...data };
      if (game.user.isActiveGM) await this._enqueueRequest(request, game.user);
      else {
        if (!game.user.hasPermission('QUERY_USER')) throw new Error('OQ.Combat.Errors.QueryPermission');
        await gm.query(DECLARATION_QUERY, request, { timeout: 10000 });
      }
      return this;
    } catch (error) {
      // Errors carry localization keys, so the GM never answers in its own language. Other messages pass through.
      error.message = game.i18n.localize(error.message);
      ui.notifications.error(`${game.i18n.localize('OQ.Combat.Declaration')}: ${error.message}`);
      error.oqReported = true;
      throw error;
    }
  }

  _enqueueRequest(request, user) {
    const result = this._declarationQueue.then(() => this._applyRequest(request, user));
    // Answer once the update is saved, but hold later requests until its lifecycle events have finished.
    this._declarationQueue = result
      .then(() => Promise.allSettled([this._turnEvents, this._roundStartEvents]))
      .catch(() => {});
    return result;
  }

  async _applyRequest(request, user) {
    if (!game.user.isActiveGM) throw new Error('OQ.Combat.Errors.GmChanged');
    const state = this._requestState();
    if (request.phase !== state.phase || request.round !== state.round || request.turn !== state.turn) {
      throw new Error('OQ.Combat.Errors.Advanced');
    }
    if (request.operation === 'edit') {
      if (!this.isDeclaration) throw new Error('OQ.Combat.Errors.Frozen');
      const actor = this.combatants.get(request.combatantId)?.actor;
      if (!actor || (!user.isGM && !actor.testUserPermission(user, 'OWNER'))) {
        throw new Error('OQ.Combat.Errors.NotOwner');
      }
      const update = {};
      if ('reference' in request) {
        if (
          typeof request.reference !== 'string' ||
          (request.reference && !getInitiativeItems(actor).some((item) => item.id === request.reference))
        ) {
          throw new Error('OQ.Combat.Errors.ActionUnavailable');
        }
        update['system.attributes.initiative.reference'] = request.reference;
      }
      if ('mod' in request) {
        if (!Number.isSafeInteger(request.mod)) throw new Error('OQ.Combat.IntegerModifier');
        update['system.attributes.initiative.mod'] = request.mod;
      }
      await actor.update(update);
      return;
    }
    if (
      !user.isGM &&
      (!this.combatant?.actor?.testUserPermission(user, 'OWNER') ||
        !['nextTurn', 'previousTurn', 'declare'].includes(request.operation))
    ) {
      throw new Error('OQ.Combat.Errors.NotYourTurn');
    }
    switch (request.operation) {
      case 'start':
        if (!user.isGM) throw new Error('OQ.Combat.Errors.GMOnlyStart');
        return this._startDeclaredRound();
      case 'declare':
        if (!user.isGM && this.turns.slice((this.turn ?? -1) + 1).some((c) => this.isEligible(c))) {
          throw new Error('OQ.Combat.Errors.FinishTurns');
        }
        // Only the GM's own removal handler supplies the order from before the removal.
        return this._enterDeclaration(user.isGM ? request.previous : undefined);
      case 'nextTurn':
        if (this.isDeclaration) throw new Error('OQ.Combat.Errors.AskGMStart');
        if (!this.turns.slice((this.turn ?? -1) + 1).some((c) => this.isEligible(c))) {
          return this._enterDeclaration();
        }
        return super.nextTurn();
      case 'previousTurn':
        if (this.isDeclaration || this.turn <= this.firstEligibleTurn) return;
        return super.previousTurn();
      default:
        throw new Error('OQ.Combat.Errors.Unknown');
    }
  }

  updateDeclaration(combatantId, fields, state) {
    return this._request('edit', { combatantId, ...fields }, state);
  }

  startCombat() {
    return this.startRound();
  }
  startRound() {
    return this._request('start');
  }

  nextRound() {
    return this._request('declare');
  }

  nextTurn() {
    return this._request('nextTurn');
  }
  previousTurn() {
    return this._request('previousTurn');
  }
  async previousRound() {
    return this;
  }

  async _enterDeclaration(previous = { ...this.current, order: this.turns.map((c) => c.id) }) {
    if (this.isDeclaration) return this;
    return this.update(
      {
        turn: null,
        'flags.oq.phase': 'declaration',
        'flags.oq.targetRound': this.round + 1,
        'flags.oq.previousExecution': previous,
      },
      { turnEvents: false },
    );
  }

  async _startDeclaredRound() {
    if (!this.isDeclaration) throw new Error('OQ.Combat.Errors.AlreadyStarted');
    if (!this.combatants.some((c) => this.isEligible(c))) throw new Error('OQ.Combat.Errors.NoEligible');
    const round = this.declarationRound;
    const previous = this.flags.oq?.previousExecution ?? {
      round: this.round,
      turn: null,
      combatantId: null,
      order: [],
    };
    // Capture everything before the first await, then write snapshots and execution state in one update.
    const combatants = this.combatants.map((c) => {
      const declaration = { ...getDeclaration(c.actor), round };
      return { _id: c.id, initiative: declaration.total, 'flags.oq.declaration': declaration };
    });
    const totals = new Map(combatants.map((c) => [c._id, c.initiative]));
    const ordered = [...this.combatants].sort((a, b) =>
      this._sortCombatants({ id: a.id, initiative: totals.get(a.id) }, { id: b.id, initiative: totals.get(b.id) }),
    );
    const turn = ordered.findIndex((c) => !this.settings.skipDefeated || !c.isDefeated);
    const update = {
      combatants,
      round,
      turn,
      'flags.oq.phase': 'execution',
      'flags.oq.targetRound': round,
      'flags.oq.executionIds': ordered.map((c) => c.id),
      'flags.oq.previousExecution': null,
    };
    const options = { turnEvents: false, direction: 1, oqRoundStart: previous };
    if (!this.started) {
      this._playCombatSound('startEncounter');
      Hooks.callAll('combatStart', this, update);
    } else {
      // The previous order's remaining turns, then the new order's leading skipped turns.
      const remaining = previous.turn == null ? 0 : Math.max(0, previous.order.length - previous.turn);
      options.worldTime = { delta: CONFIG.time.roundTime + (remaining + turn) * CONFIG.time.turnTime };
      Hooks.callAll('combatRound', this, update, options);
    }
    await this.update(update, options);
    if (previous.round === 0) {
      this._roundStartEvents = this._roundStartEvents.then(() =>
        foundry.documents.ActiveEffect.registry.refresh('combatStart', { combat: this }),
      );
    }
    return this;
  }

  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    // Phase-only updates do not rebuild core's cached turns. Declaration must include waiting arrivals.
    if (this.isDeclaration && !('combatants' in changed)) this.setupTurns();
    if (options.oqRoundStart) {
      this.previous = { ...options.oqRoundStart };
      this._roundStartEvents = this._dispatchDeclaredRoundEvents(options.oqRoundStart);
    }
  }

  _manageTurnEvents() {
    if (this.isDeclaration || !this.turns.some((c) => this.isEligible(c))) return;
    return (this._turnEvents = super._manageTurnEvents());
  }

  /** v14 core's private round dispatcher assumes one order for both rounds. Use each round's own order here. */
  async _dispatchDeclaredRoundEvents(previous) {
    if (game.user.isActiveGM) {
      let prior = {
        combatant: this.combatants.get(previous.combatantId),
        round: previous.round,
        turn: previous.turn,
        skipped: false,
      };
      const dispatchTurn = async (next) => {
        if (prior.combatant) await this._dispatchLifecycle('EndTurn', prior);
        if (prior.round !== next.round) {
          await this._dispatchLifecycle('EndRound', { round: prior.round, skipped: false });
          await this._dispatchLifecycle('StartRound', { round: next.round, skipped: false });
        }
        if (next.combatant) await this._dispatchLifecycle('StartTurn', next);
        prior = next;
      };
      if (previous.round > 0 && previous.turn != null) {
        for (let i = previous.turn + 1; i < previous.order.length; i++) {
          await dispatchTurn({
            combatant: this.combatants.get(previous.order[i]),
            round: previous.round,
            turn: i,
            skipped: true,
          });
        }
      }
      for (let i = 0; i <= this.turn; i++) {
        await dispatchTurn({ combatant: this.turns[i], round: this.round, turn: i, skipped: i !== this.turn });
      }
    }
    Hooks.callAll('combatTurnChange', this, previous, this.current);
  }

  /**
   * Mirrors core 14.368's private #onEndTurn, #onEndRound, #onStartRound, #onStartTurn and #triggerRegionEvents:
   * protected callbacks, movement clearing, effect expiry and Region events. Compare them on every core upgrade.
   */
  async _dispatchLifecycle(event, state) {
    const { combatant, ...context } = state;
    const isTurn = event.endsWith('Turn');
    if (CONFIG.debug.combat) {
      const label = event.replace(/(Turn|Round)$/, ' $1');
      console.debug(` | Combat ${label}: ${isTurn ? combatant.name : context.round}`);
    }
    if (isTurn) await this[`_on${event}`](combatant, context);
    else await this[`_on${event}`](context);
    if (event === 'StartTurn') await this._clearMovementHistoryOnStartTurn(combatant, context);
    const effectEvent = { EndTurn: 'turnEnd', StartTurn: 'turnStart', EndRound: 'roundEnd', StartRound: 'roundStart' }[
      event
    ];
    await foundry.documents.ActiveEffect.registry.refresh(effectEvent, { ...context, combat: this });
    const regionEvent = {
      EndTurn: 'TOKEN_TURN_END',
      StartTurn: 'TOKEN_TURN_START',
      EndRound: 'TOKEN_ROUND_END',
      StartRound: 'TOKEN_ROUND_START',
    }[event];
    // Core does not wait for Region events either.
    for (const c of isTurn ? [combatant] : this.combatants) {
      for (const region of c.token?.regions ?? []) {
        region._triggerEvent(CONST.REGION_EVENTS[regionEvent], {
          ...context,
          token: c.token,
          combatant: c,
          combat: this,
        });
      }
    }
  }

  _onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId) {
    // Before core rebuilds the turns, which would hand a removed final turn back to a combatant who already acted.
    const check = collection === 'combatants' && game.user.isActiveGM && !this.isDeclaration;
    const previous = check && { ...this.current, order: this.turns.map((c) => c.id) };
    const roundOver =
      check &&
      ids.includes(this.combatant?.id) &&
      !this.turns.some((c, i) => i > this.turn && !ids.includes(c.id) && this.isEligible(c));
    super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
    if (check && (roundOver || !this.turns.some((c) => this.isEligible(c)))) {
      this._request('declare', { previous }).catch(() => {});
    }
  }

  // Initiative management is superseded by declarations, including macros calling these core APIs.
  async rollInitiative() {
    return this;
  }
  async setInitiative() {
    return this;
  }
  async resetAll() {
    return this;
  }
}
