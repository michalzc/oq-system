import assert from 'node:assert/strict';
import { getDeclaration, getInitiativeOptions } from '../src/module/utils/initiative.js';

// A document harness for the real OQCombat methods. Foundry integration is checked separately in 14.368.
class Collection extends Map {
  get contents() {
    return [...this.values()];
  }
  map(fn) {
    return this.contents.map(fn);
  }
  filter(fn) {
    return this.contents.filter(fn);
  }
  some(fn) {
    return this.contents.some(fn);
  }
  [Symbol.iterator]() {
    return this.values();
  }
}
function apply(object, update) {
  for (const [path, value] of Object.entries(update)) {
    if (path === '_id') continue;
    const parts = path.split('.');
    const key = parts.pop();
    const target = parts.reduce((obj, part) => (obj[part] ??= {}), object);
    target[key] = value;
  }
}
class CombatHarness {
  constructor(combatants = [], round = 0) {
    this.id = 'combat';
    this.round = round;
    this.turn = round ? 0 : null;
    this.flags = {};
    this.settings = { skipDefeated: true };
    this.combatants = new Collection(combatants.map((c) => [c.id, c]));
    this.turns = [];
    this.events = [];
    this.updates = [];
    this.setupTurns();
  }
  get started() {
    return this.round > 0;
  }
  get combatant() {
    return this.turn == null ? null : this.turns[this.turn];
  }
  _getCurrentState() {
    return { round: this.round, turn: this.turn, combatantId: this.combatant?.id ?? null, tokenId: null };
  }
  _sortCombatants(a, b) {
    return (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity) || (a.id > b.id ? 1 : -1);
  }
  updateSource(update) {
    apply(this, update);
  }
  async _preCreate() {}
  async update(update, options = {}) {
    this.updates.push({ update, options });
    const prior = { ...this.current };
    for (const c of update.combatants ?? []) apply(this.combatants.get(c._id), c);
    const rest = { ...update };
    delete rest.combatants;
    apply(this, rest);
    this._onUpdate(update, options, 'gm');
    if (!options.oqRoundStart) this.previous = prior;
    worldTime += options.worldTime?.delta ?? 0;
    return this;
  }
  _onUpdate(changed) {
    // Core rebuilds the turn list only for combatant updates, not phase-only flag updates.
    if ('combatants' in changed) this.setupTurns();
    else this.current = this._getCurrentState();
  }
  _onDeleteDescendantDocuments() {
    this.setupTurns();
  }
  async nextTurn() {
    const turn = this.turns.findIndex((c, i) => i > this.turn && this.isEligible(c));
    if (turn < 0) return this.nextRound();
    return this.update({ turn });
  }
  async previousTurn() {
    return this.update({ turn: this.turn - 1 });
  }
  _playCombatSound() {}
  async _onEndTurn(c, context) {
    this.events.push(['endTurn', c.id, context]);
  }
  async _onStartTurn(c, context) {
    this.events.push(['startTurn', c.id, context]);
  }
  async _onEndRound(context) {
    this.events.push(['endRound', context]);
  }
  async _onStartRound(context) {
    this.events.push(['startRound', context]);
  }
  async _clearMovementHistoryOnStartTurn() {}
  async _manageTurnEvents() {
    this.events.push(['coreEvents']);
  }
}

let OQCombat;
let OQCombatant;
let worldTime;
const gm = { id: 'gm', isGM: true, isActiveGM: true, hasPermission: () => true };
const player = { id: 'player', isGM: false, hasPermission: () => true };
const globals = ['Combat', 'game', 'CONFIG', 'CONST', 'Hooks', 'foundry', 'ui'];
let savedGlobals;

function actor(reference = 'action', mod = 0, value = 50, owner = 'player') {
  const action = {
    id: 'action',
    name: 'Attack',
    type: 'skill',
    system: { formula: '50' },
    getRollValues: () => ({ value, mod: 200 }),
  };
  const actor = {
    items: [action],
    system: { attributes: { initiative: { reference, mod } } },
    testUserPermission: (user) => user.isGM || user.id === owner,
    async update(data) {
      await Promise.resolve();
      apply(this, data);
    },
  };
  return actor;
}
// Foundry removes the documents from the collection before calling the parent's handler.
function remove(combat, ...ids) {
  const documents = ids.map((id) => combat.combatants.get(id));
  for (const id of ids) combat.combatants.delete(id);
  combat._onDeleteDescendantDocuments(combat, 'combatants', documents, ids, {}, 'gm');
}
function participant(id, a = actor(), defeated = false) {
  return { id, actor: a, flags: {}, initiative: null, roundJoined: null, isDefeated: defeated };
}

describe('Combat declarations', function () {
  it('preserves existing round 1 encounters and waits only for explicitly marked legacy arrivals', async function () {
    const a = participant('a');
    a.roundJoined = 1; // Core's default, including participants created before starting an encounter.
    const combat = new OQCombat([a], 1);
    assert.equal(combat.combatant.id, 'a');
    assert.equal(combat.isAwaiting(a), false);
    const late = participant('late');
    late.flags.oq = { awaitingRound: 2 };
    combat.combatants.set(late.id, late);
    combat.setupTurns();
    assert.equal(combat.turns.length, 1);
    await combat.nextRound();
    await combat.startRound();
    assert.equal(combat.turns.length, 2);
  });
  before(async function () {
    savedGlobals = Object.fromEntries(globals.map((key) => [key, globalThis[key]]));
    globalThis.Combat = CombatHarness;
    globalThis.foundry = {
      documents: {
        Combatant: class {
          async _preCreate() {}
          async _preUpdate() {}
          updateSource(data) {
            apply(this, data);
          }
        },
      },
    };
    ({ OQCombat } = await import('../src/module/document/combat.js'));
    ({ OQCombatant } = await import('../src/module/document/combatant.js'));
  });
  after(function () {
    for (const key of globals) {
      if (savedGlobals[key] === undefined) delete globalThis[key];
      else globalThis[key] = savedGlobals[key];
    }
  });

  beforeEach(function () {
    worldTime = 0;
    globalThis.game = { user: gm, users: { activeGM: gm }, combats: new Map(), i18n: { localize: (key) => key } };
    globalThis.CONFIG = {
      queries: {},
      time: { roundTime: 6, turnTime: 2 },
      debug: {},
      OQ: { ItemConfig: { itemTypes: { skill: 'skill', specialAbility: 'specialAbility' } } },
    };
    globalThis.Hooks = { callAll: () => {} };
    globalThis.foundry = { documents: { ActiveEffect: { registry: { refresh: async () => {} } } } };
    globalThis.CONST = { REGION_EVENTS: {} };
    globalThis.ui = { notifications: { error: () => {} } };
  });

  it('marks late arrivals only when added to an existing executing encounter', async function () {
    const combat = new OQCombat([participant('a')], 1);
    game.combats.set(combat.id, combat);
    const late = new OQCombatant();
    late.parent = combat;
    await late._preCreate({}, {}, gm);
    assert.equal(late.flags.oq.awaitingRound, 2);
    await combat.nextRound();
    const duringDeclaration = new OQCombatant();
    duringDeclaration.parent = combat;
    await duringDeclaration._preCreate({}, {}, gm);
    assert.equal(duringDeclaration.flags, undefined);
  });

  it('protects frozen core initiative from direct combatant configuration edits', async function () {
    const c = new OQCombatant();
    c.parent = { isDeclaration: false, round: 1 };
    c.flags = { oq: { declaration: { round: 1, total: 50 } } };
    assert.equal(await c._preUpdate({ initiative: 100 }, {}, gm), false);
    assert.notEqual(await c._preUpdate({ initiative: 50 }, {}, gm), false);
    c.parent.isDeclaration = true;
    assert.notEqual(await c._preUpdate({ initiative: 100 }, {}, gm), false);
  });

  it('enters declaration without advancing the round, world time, or lifecycle', async function () {
    const combat = new OQCombat([participant('a')], 2);
    await combat.nextRound();
    assert.equal(combat.round, 2);
    assert.equal(combat.declarationRound, 3);
    assert.equal(combat.turn, null);
    assert.equal(worldTime, 0);
    assert.deepEqual(combat.events, []);
    assert.equal(combat.flags.oq.previousExecution.combatantId, 'a');
    const updateCount = combat.updates.length;
    await combat.nextRound();
    assert.equal(combat.updates.length, updateCount);
  });

  it('defaults new and unstarted legacy encounters to round 1 declaration', async function () {
    const combat = new OQCombat([participant('a')]);
    assert.equal(combat.isDeclaration, true);
    assert.equal(combat.declarationRound, 1);
    assert.equal(combat.turn, null);
    await combat._preCreate({}, {}, gm);
    assert.equal(combat.flags.oq.phase, 'declaration');
  });

  it('captures identity, name, modifier and total, sorting descending with core ID ties', async function () {
    const combat = new OQCombat([participant('z', actor('action', 5)), participant('b'), participant('a')]);
    await combat.startRound();
    assert.deepEqual(
      combat.turns.map((c) => c.id),
      ['z', 'a', 'b'],
    );
    assert.equal(combat.combatant.id, 'z');
    assert.deepEqual(combat.combatant.flags.oq.declaration, {
      reference: 'action',
      name: 'Attack',
      mod: 5,
      total: 55,
      round: 1,
    });
    assert.equal(worldTime, 0);
  });

  it('uses modifier-only totals for blank, deleted and ineligible actions; actorless totals are zero', async function () {
    assert.equal(getDeclaration(actor('', -4)).total, -4);
    assert.equal(getDeclaration(actor('deleted', 9)).total, 9);
    const a = actor('action', 3);
    a.items[0].type = 'weapon';
    assert.equal(getDeclaration(a).total, 3);
    const combat = new OQCombat([participant('blank', actor('', -4)), participant('none', null)]);
    await combat.startRound();
    assert.equal(combat.combatants.get('none').initiative, 0);
    assert.equal(combat.combatants.get('blank').flags.oq.declaration.name, '');
  });

  it('shares rollable options including zero-valued actions and special abilities', function () {
    const a = actor('action', 0, 0);
    a.items.push({
      id: 'special',
      name: 'Dodge',
      type: 'specialAbility',
      system: { formula: '@dex' },
      getRollValues: () => ({ value: 25 }),
    });
    a.items.push({ id: 'noFormula', type: 'skill', system: {} });
    assert.deepEqual(getInitiativeOptions(a), { action: 'Attack (0)', special: 'Dodge (25)' });
  });

  it('keeps snapshots and order frozen after actor changes, then uses defaults next round', async function () {
    const a = actor();
    const combat = new OQCombat([participant('a', a), participant('b', actor('action', 10))]);
    await combat.startRound();
    await a.update({ 'system.attributes.initiative.mod': 500 });
    a.items[0].name = 'Renamed';
    combat.setupTurns();
    assert.deepEqual(
      combat.turns.map((c) => c.id),
      ['b', 'a'],
    );
    assert.equal(combat.combatants.get('a').flags.oq.declaration.total, 50);
    assert.equal(combat.combatants.get('a').flags.oq.declaration.name, 'Attack');
    await combat.nextRound();
    await combat.startRound();
    assert.equal(combat.combatant.id, 'a');
    assert.equal(combat.combatant.flags.oq.declaration.total, 550);
  });

  it('admits late arrivals in declaration and excludes execution arrivals until the next round', async function () {
    const combat = new OQCombat([participant('a')]);
    combat.combatants.set('b', participant('b', actor('', 100)));
    combat.setupTurns();
    await combat.startRound();
    assert.equal(combat.combatant.id, 'b');
    combat.combatants.set('late', participant('late', actor('', 200)));
    combat.setupTurns();
    assert.equal(combat.isAwaiting(combat.combatants.get('late')), true);
    assert.equal(combat.turns.length, 2);
    await combat.nextRound();
    assert.equal(combat.turns.includes(combat.combatants.get('late')), true);
    assert.equal(combat.turn, null);
    assert.equal(combat.isAwaiting(combat.combatants.get('late')), false);
    assert.equal(combat.flags.oq.previousExecution.order.includes('late'), false);
    await combat.startRound();
    assert.equal(combat.combatant.id, 'late');
  });

  it('includes waiting combatants as soon as the final turn opens declaration', async function () {
    const combat = new OQCombat([participant('a')]);
    await combat.startRound();
    const late = participant('late', actor('', 200));
    combat.combatants.set(late.id, late);
    combat.setupTurns();
    assert.equal(combat.turns.includes(late), false);
    await late.actor.update({ 'system.attributes.initiative.mod': 250 });
    const time = worldTime;
    await combat.nextTurn();
    assert.equal(combat.isDeclaration, true);
    assert.equal(combat.turns.includes(late), true);
    assert.equal(combat.isAwaiting(late), false);
    assert.equal(combat.turn, null);
    assert.equal(worldTime, time);
    assert.equal(getDeclaration(late.actor).total, 250);
    assert.deepEqual(combat.flags.oq.previousExecution.order, ['a']);
  });

  it('skips defeated participants, refuses an empty round and automatically declares at the boundary', async function () {
    const combat = new OQCombat([participant('dead', actor('', 100), true), participant('alive')]);
    await combat.startRound();
    assert.equal(combat.turn, 1);
    await combat.previousTurn();
    assert.equal(combat.turn, 1);
    await combat.nextTurn();
    assert.equal(combat.isDeclaration, true);
    assert.equal(combat.round, 1);
    assert.equal(combat.turn, null);
    combat.combatants.get('alive').isDefeated = true;
    await assert.rejects(combat.startRound(), /Errors.NoEligible/);
  });

  it('guards duplicate starts and rejects stale edits and stale turn requests', async function () {
    const combat = new OQCombat([participant('a')]);
    const stale = combat._requestState();
    const results = await Promise.allSettled([combat.startRound(), combat.startRound()]);
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
    assert.equal(combat.round, 1);
    await assert.rejects(combat.updateDeclaration('a', { mod: 2 }, stale), /Errors.Advanced/);
    const state = combat._requestState();
    await combat.nextRound();
    await assert.rejects(combat._request('nextTurn', {}, state), /Errors.Advanced/);
  });

  it('validates authenticated ownership, action identity and integer modifiers', async function () {
    const combat = new OQCombat([participant('owned'), participant('other', actor('action', 0, 50, 'other'))]);
    const request = { ...combat._requestState(), operation: 'edit', combatantId: 'owned', mod: -2 };
    await combat._enqueueRequest(request, player);
    assert.equal(combat.combatants.get('owned').actor.system.attributes.initiative.mod, -2);
    await assert.rejects(combat._enqueueRequest({ ...request, combatantId: 'other' }, player), /Errors.NotOwner/);
    await assert.rejects(combat._enqueueRequest({ ...request, mod: 1.5 }, player), /IntegerModifier/);
    await assert.rejects(
      combat._enqueueRequest({ ...request, reference: 'missing' }, player),
      /Errors.ActionUnavailable/,
    );
    await assert.rejects(combat._enqueueRequest({ ...request, operation: 'start' }, player), /Errors.NotYourTurn/);
    await assert.rejects(combat._enqueueRequest({ ...request, phase: 'execution' }, player), /Errors.Advanced/);
  });

  it('serializes independent fields without overwriting simultaneous choices', async function () {
    const combat = new OQCombat([participant('a')]);
    await Promise.all([combat.updateDeclaration('a', { reference: '' }), combat.updateDeclaration('a', { mod: 15 })]);
    assert.deepEqual(combat.combatants.get('a').actor.system.attributes.initiative, { reference: '', mod: 15 });
  });

  it('reports missing GMs and uses the authenticated query context', async function () {
    const combat = new OQCombat([participant('a')]);
    game.users.activeGM = null;
    await assert.rejects(combat.updateDeclaration('a', { mod: 2 }), /Errors.NoGM/);
    game.users.activeGM = gm;
    game.combats.set(combat.id, combat);
    OQCombat.registerQueries();
    await assert.rejects(
      CONFIG.queries['oq.combatDeclaration'](
        { ...combat._requestState(), combatId: combat.id, operation: 'edit', combatantId: 'a', mod: 2, userId: 'gm' },
        { user: { id: 'stranger', isGM: false } },
      ),
      /Errors.NotOwner/,
    );
  });

  it('uses the saved previous order for skipped tail turns and charges time once at Start round', async function () {
    const combat = new OQCombat([participant('a', actor('', 30)), participant('z', actor('', 20), true)]);
    await combat.startRound();
    await combat._declarationQueue;
    combat.events = [];
    await combat.nextTurn();
    assert.deepEqual(combat.events, []);
    assert.equal(worldTime, 0);
    await combat.updateDeclaration('z', { mod: 100 });
    await combat.startRound();
    await combat._declarationQueue;
    assert.equal(worldTime, 12); // 6-second round, two remaining old turns, one leading skipped turn.
    assert.deepEqual(
      combat.events.map((event) => event.slice(0, 2)),
      [
        ['endTurn', 'a'],
        ['startTurn', 'z'],
        ['endTurn', 'z'],
        ['endRound', { round: 1, skipped: false }],
        ['startRound', { round: 2, skipped: false }],
        ['startTurn', 'z'],
        ['endTurn', 'z'],
        ['startTurn', 'a'],
      ],
    );
  });

  it('restores declaration and execution flags and snapshots across reloads', async function () {
    const combat = new OQCombat([participant('a')]);
    await combat.startRound();
    const restored = new OQCombat([...combat.combatants], combat.round);
    restored.flags = structuredClone(combat.flags);
    restored.setupTurns();
    assert.equal(restored.isDeclaration, false);
    assert.equal(restored.combatant.flags.oq.declaration.total, 50);
    await combat.nextRound();
    restored.flags = structuredClone(combat.flags);
    restored.turn = null;
    restored.setupTurns();
    assert.equal(restored.isDeclaration, true);
    assert.equal(restored.declarationRound, 2);
    assert.equal(restored.turn, null);
  });

  it('removing the last eligible participant does not accidentally advance another round', async function () {
    const combat = new OQCombat([participant('a')]);
    await combat.startRound();
    remove(combat, 'a');
    await combat._declarationQueue;
    assert.equal(combat.round, 1);
    assert.equal(combat.declarationRound, 2);
    assert.equal(combat.turn, null);
  });

  it('opens declaration when the current final turn is removed, keeping the order from before the removal', async function () {
    const combat = new OQCombat(['a', 'b', 'c'].map((id, i) => participant(id, actor('', 30 - i * 10))));
    await combat.startRound();
    await combat.nextTurn();
    await combat.nextTurn();
    remove(combat, 'c');
    await combat._declarationQueue;
    assert.equal(combat.isDeclaration, true);
    assert.equal(combat.round, 1);
    assert.deepEqual(combat.flags.oq.previousExecution, {
      round: 1,
      turn: 2,
      combatantId: 'c',
      tokenId: null,
      order: ['a', 'b', 'c'],
    });
    await combat.startRound();
    assert.equal(worldTime, 8); // 6-second round and the removed participant's remaining turn.
  });

  it('hands the turn to the next eligible participant when the current one is removed', async function () {
    const combat = new OQCombat(['a', 'b', 'c'].map((id, i) => participant(id, actor('', 30 - i * 10))));
    await combat.startRound();
    await combat.nextTurn();
    remove(combat, 'b');
    await combat._declarationQueue;
    assert.equal(combat.isDeclaration, false);
    assert.equal(combat.combatant.id, 'c');
  });

  it('keeps a defeated current participant current until its turn ends', async function () {
    const combat = new OQCombat([participant('a', actor('', 30)), participant('b', actor('', 20))]);
    await combat.startRound();
    await combat.nextTurn();
    for (const c of combat.combatants) c.isDefeated = true;
    combat.setupTurns();
    assert.equal(combat.combatant.id, 'b');
    combat.combatants.get('b').isDefeated = false;
    combat.setupTurns();
    assert.equal(combat.combatant.id, 'b');
    combat.combatants.get('b').isDefeated = true;
    combat.setupTurns();
    await combat.nextTurn();
    assert.equal(combat.isDeclaration, true);
    assert.equal(combat.flags.oq.previousExecution.turn, 1);
  });

  it('answers before lifecycle events finish and holds later requests until they do', async function () {
    let release;
    const gate = new Promise((resolve) => (release = resolve));
    const combat = new OQCombat([participant('a', actor('', 30)), participant('b', actor('', 20))]);
    combat._onStartTurn = () => gate;
    await combat.startRound();
    const next = combat.nextTurn();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(combat.turn, 0);
    release();
    await next;
    assert.equal(combat.turn, 1);
  });

  it('marks reported request failures and propagates other tracker errors', async function () {
    const combat = new OQCombat([participant('a')]);
    const reported = await combat.nextTurn().catch((error) => error);
    assert.match(reported.message, /Errors.AskGMStart/);
    assert.equal(reported.oqReported, true);
    let failure;
    globalThis.foundry.applications = {
      sidebar: {
        tabs: {
          CombatTracker: class {
            async _onClickAction() {
              throw failure;
            }
          },
        },
      },
    };
    const { OQCombatTracker } = await import('../src/module/application/combat-tracker.js');
    const tracker = new OQCombatTracker();
    failure = reported;
    await tracker._onClickAction();
    failure = new Error('core');
    await assert.rejects(tracker._onClickAction(), /core/);
  });
});
