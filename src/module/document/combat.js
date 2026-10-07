import { getDeclaration, getInitiativeItems } from '../utils/initiative.js';

const DECLARATION_QUERY = 'oq.combatDeclaration';

export class OQCombat extends Combat {
  // One queue on the active GM serializes edits, starts, and turn boundaries for each encounter.
  _declarationQueue = Promise.resolve();

  static registerQueries() {
    CONFIG.queries[DECLARATION_QUERY] = async (request, { user }) => {
      if (!game.user.isActiveGM) throw new Error('The active GM changed. Please retry.');
      const combat = game.combats.get(request.combatId);
      if (!combat) throw new Error('This encounter no longer exists.');
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
    if (this.isDeclaration) this.turn = null;
    else if (this.turn !== null) {
      if (!turns.some((c) => this.isEligible(c))) {
        this._emptyExecution ??= {
          ...(this.current ?? this._getCurrentState()),
          order: this.turns?.map((c) => c.id) ?? [],
        };
        this.turn = null;
      } else this.turn = Math.min(Math.max(this.turn, 0), turns.length - 1);
    }
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
      if (!gm) throw new Error('No GM is connected. Ask a GM to connect, then retry.');
      const request = { combatId: this.id, operation, ...state, ...data };
      if (game.user.isActiveGM) await this._enqueueRequest(request, game.user);
      else {
        if (!game.user.hasPermission('QUERY_USER')) {
          throw new Error('Ask the GM to enable Query Users permission, then retry.');
        }
        await gm.query(DECLARATION_QUERY, request, { timeout: 10000 });
      }
      return this;
    } catch (error) {
      ui.notifications.error(`Declaration: ${error.message}`);
      throw error;
    }
  }

  _enqueueRequest(request, user) {
    const result = this._declarationQueue.then(() => this._applyRequest(request, user));
    this._declarationQueue = result.catch(() => {});
    return result;
  }

  async _applyRequest(request, user) {
    if (!game.user.isActiveGM) throw new Error('The active GM changed. Please retry.');
    const state = this._requestState();
    if (request.phase !== state.phase || request.round !== state.round || request.turn !== state.turn) {
      throw new Error('The encounter advanced. Review the tracker and retry.');
    }
    if (request.operation === 'edit') {
      if (!this.isDeclaration) throw new Error('Declarations are frozen for this round.');
      const actor = this.combatants.get(request.combatantId)?.actor;
      if (!actor || (!user.isGM && !actor.testUserPermission(user, 'OWNER'))) {
        throw new Error('You must own this actor to declare its action.');
      }
      const update = {};
      if ('reference' in request) {
        if (
          typeof request.reference !== 'string' ||
          (request.reference && !getInitiativeItems(actor).some((item) => item.id === request.reference))
        ) {
          throw new Error('That action is no longer available. Select an action again.');
        }
        update['system.attributes.initiative.reference'] = request.reference;
      }
      if ('mod' in request) {
        if (!Number.isSafeInteger(request.mod)) throw new Error('Enter a whole number for the initiative modifier.');
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
      throw new Error('Only the GM or the current actor owner can advance this encounter.');
    }
    switch (request.operation) {
      case 'start':
        if (!user.isGM) throw new Error('Only a GM can start a round.');
        return this._startDeclaredRound();
      case 'declare':
        if (!user.isGM && this.turns.slice((this.turn ?? -1) + 1).some((c) => this.isEligible(c))) {
          throw new Error('Finish the remaining turns before declaring the next round.');
        }
        return this._enterDeclaration();
      case 'nextTurn':
        if (this.isDeclaration) throw new Error('Ask the GM to start the round.');
        if (!this.turns.slice((this.turn ?? -1) + 1).some((c) => this.isEligible(c))) {
          return this._enterDeclaration();
        }
        await super.nextTurn();
        await this._turnEvents;
        return this;
      case 'previousTurn':
        if (this.isDeclaration || this.turn <= this.firstEligibleTurn) return;
        await super.previousTurn();
        await this._turnEvents;
        return this;
      default:
        throw new Error('Unknown combat declaration request.');
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

  async _enterDeclaration() {
    if (this.isDeclaration) return this;
    const previous = this._emptyExecution ?? { ...this.current, order: this.turns.map((c) => c.id) };
    this._emptyExecution = undefined;
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
    if (!this.isDeclaration) throw new Error('This round has already started.');
    if (!this.combatants.some((c) => this.isEligible(c))) throw new Error('No eligible participants remain.');
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
    await this._roundStartEvents;
    if (previous.round === 0) await foundry.documents.ActiveEffect.registry.refresh('combatStart', { combat: this });
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

  /** Preserve protected callbacks, effect expiry, movement clearing, and Region events used by core 14.368. */
  async _dispatchLifecycle(event, state) {
    const { combatant, ...context } = state;
    const isTurn = event.endsWith('Turn');
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
    const combatants = isTurn ? [combatant] : this.combatants;
    const promises = [];
    for (const c of combatants) {
      for (const region of c.token?.regions ?? []) {
        promises.push(
          region._triggerEvent(CONST.REGION_EVENTS[regionEvent], {
            ...context,
            token: c.token,
            combatant: c,
            combat: this,
          }),
        );
      }
    }
    await Promise.allSettled(promises);
  }

  _onDeleteDescendantDocuments(...args) {
    super._onDeleteDescendantDocuments(...args);
    if (game.user.isActiveGM && !this.isDeclaration && !this.turns.some((c) => this.isEligible(c))) {
      this.nextRound().catch(() => {});
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
