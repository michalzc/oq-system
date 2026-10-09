import assert from 'node:assert/strict';
import { RollConfig } from '../src/module/consts/rolls-config.js';

const globals = ['Item', 'Roll', 'ChatMessage', 'CONFIG', 'game', 'ui', 'foundry', 'document'];
let savedGlobals;
let OQSpell;
let dialogs, rolls, rollSteps, messages, warnings;
let nextItemId;

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const tick = () => new Promise((resolve) => setImmediate(resolve));

function apply(target, changes) {
  for (const [path, value] of Object.entries(changes)) {
    const keys = path.split('.');
    const key = keys.pop();
    keys.reduce((object, key) => object[key], target)[key] = value;
  }
}

function actor(uuid = 'Actor.caster', mp = 10) {
  return {
    uuid,
    id: uuid,
    type: 'character',
    system: {
      attributes: { mp: { value: mp } },
      skillsBySlug: { magic: { name: 'Magic', getRollValues: () => ({ value: 50, mod: 0 }) } },
    },
    updates: [],
    async update(changes) {
      this.updates.push(changes);
      await this.beforeUpdate?.(changes);
      if (this.cancelUpdate) return;
      apply(this, changes);
      return this;
    },
  };
}

function spell(parent = actor(), system = {}) {
  const item = new OQSpell();
  const id = `spell${++nextItemId}`;
  Object.assign(item, {
    id,
    parent,
    name: 'Heal',
    uuid: `${parent.uuid}.Item.${id}`,
    system: {
      type: 'personal',
      skillReference: 'magic',
      magnitude: 3,
      remainingMagnitude: 3,
      nonVariant: false,
      noMagicPoints: false,
      ...system,
      get hasSplitDivineCasting() {
        return this.noMagicPoints && !this.nonVariant;
      },
      get expended() {
        return this.noMagicPoints && this.remainingMagnitude === 0;
      },
    },
    updates: [],
    async update(changes) {
      this.updates.push(changes);
      await this.beforeUpdate?.(changes);
      if (this.cancelUpdate) return;
      apply(this, changes);
      return this;
    },
  });
  return item;
}

async function openCast(item) {
  const pending = item.rollItemTest(false);
  await tick();
  const dialog = dialogs.at(-1);
  return {
    pending,
    confirm(magnitude = 3) {
      dialog.resolve({ magnitude, difficulty: 'normal', mod: 0, messageMode: 'private' });
    },
    cancel() {
      dialog.resolve('cancel');
    },
  };
}

describe('Spell casting', function () {
  before(async function () {
    savedGlobals = Object.fromEntries(globals.map((key) => [key, globalThis[key]]));
    globalThis.Item = class {
      get actor() {
        return this.parent;
      }
    };
    ({ OQSpell } = await import('../src/module/document/item/spell.js'));
  });

  after(function () {
    for (const key of globals) {
      if (savedGlobals[key] === undefined) delete globalThis[key];
      else globalThis[key] = savedGlobals[key];
    }
  });

  beforeEach(function () {
    nextItemId = 0;
    dialogs = [];
    rolls = [];
    rollSteps = [];
    messages = [];
    warnings = [];
    globalThis.CONFIG = {
      OQ: {
        RollConfig,
        ItemConfig: { spellsTypes: { custom: 'custom' } },
        ChatConfig: { MessageFlags: {} },
      },
      ChatMessage: { modes: { public: { label: 'Public' }, private: { label: 'Private' } } },
    };
    globalThis.game = {
      settings: { get: () => 'public' },
      i18n: { localize: (key) => key, format: (key, data) => `${key} ${JSON.stringify(data)}` },
    };
    globalThis.ui = { notifications: { warn: (message) => warnings.push(message) } };
    globalThis.document = { createElement: () => ({ innerHTML: '' }) };
    globalThis.foundry = {
      utils: { randomID: () => 'dialog' },
      applications: {
        handlebars: { renderTemplate: async (_template, context) => JSON.stringify(context) },
        api: {
          DialogV2: {
            wait(config) {
              const dialog = { ...deferred(), context: JSON.parse(config.content.innerHTML) };
              dialogs.push(dialog);
              return dialog.promise;
            },
          },
        },
      },
    };
    globalThis.ChatMessage = {
      getSpeaker: ({ actor }) => ({ actor: actor.id }),
      create: async (data, options) => messages.push({ ...data, context: JSON.parse(data.content), options }),
    };
    globalThis.Roll = class {
      constructor(formula) {
        this.formula = formula;
      }
      async evaluate(options) {
        const step = rollSteps.shift() ?? {};
        this.total = step.total ?? 20;
        rolls.push({ roll: this, options });
        await step.wait;
        return this;
      }
    };
  });

  for (const differentSpells of [false, true]) {
    it(`deducts both confirmed casts ${
      differentSpells ? 'of different spells' : 'of the same spell'
    }`, async function () {
      const caster = actor();
      const item = spell(caster);
      const first = await openCast(item);
      const second = await openCast(differentSpells ? spell(caster) : item);
      first.confirm();
      second.confirm();
      await Promise.all([first.pending, second.pending]);
      assert.equal(caster.system.attributes.mp.value, 4);
      assert.equal(messages.length, 2);
      assert.equal(warnings.length, 0);
    });
  }

  it('holds later casts until the resource update is saved', async function () {
    const gate = deferred();
    const caster = actor();
    caster.beforeUpdate = () => gate.promise;
    const first = spell(caster).rollItemTest(true);
    await tick();
    const second = spell(caster).rollItemTest(true);
    await tick();
    assert.equal(rolls.length, 1);
    assert.equal(messages.length, 0);
    gate.resolve();
    await Promise.all([first, second]);
    assert.equal(caster.system.attributes.mp.value, 4);
  });

  it('shares the actor queue between divine and MP casts', async function () {
    const gate = deferred();
    const caster = actor();
    const divine = spell(caster, { noMagicPoints: true });
    divine.beforeUpdate = () => gate.promise;
    const first = divine.rollItemTest(true);
    await tick();
    const second = spell(caster).rollItemTest(true);
    await tick();
    assert.equal(rolls.length, 0);
    gate.resolve();
    await Promise.all([first, second]);
    assert.equal(divine.system.remainingMagnitude, 0);
    assert.equal(caster.system.attributes.mp.value, 7);
  });

  it('uses MP and skill values edited while a dialog is open', async function () {
    const caster = actor();
    const cast = await openCast(spell(caster));
    caster.system.attributes.mp.value = 6;
    caster.system.skillsBySlug.magic.getRollValues = () => ({ value: 75, mod: 5 });
    cast.confirm();
    await cast.pending;
    assert.equal(caster.system.attributes.mp.value, 3);
    assert.equal(messages[0].context.value, 75);
    assert.equal(messages[0].options.messageMode, 'private');
  });

  it('cancels an unaffordable dialog selection without lowering its magnitude', async function () {
    const caster = actor();
    const cast = await openCast(spell(caster));
    caster.system.attributes.mp.value = 2;
    cast.confirm();
    await cast.pending;
    assert.equal(caster.system.attributes.mp.value, 2);
    assert.equal(rolls.length, 0);
    assert.equal(messages.length, 0);
    assert.deepEqual(warnings, ['OQ.Warnings.NotEnoughMagicPoints']);
  });

  for (const mp of [6, 2]) {
    it(`rechecks MP after interactive dice fulfillment changes it to ${mp}`, async function () {
      const gate = deferred();
      rollSteps.push({ wait: gate.promise });
      const caster = actor();
      const cast = spell(caster).rollItemTest(true);
      await tick();
      caster.system.attributes.mp.value = mp;
      gate.resolve();
      await cast;
      assert.equal(caster.system.attributes.mp.value, mp === 6 ? 3 : 2);
      assert.equal(messages.length, mp === 6 ? 1 : 0);
      assert.equal(warnings.length, mp === 6 ? 0 : 1);
    });
  }

  for (const [total, cost] of [
    [20, 3],
    [70, 1],
    [22, 1],
    [77, 3],
  ]) {
    it(`preserves the casting cost of ${cost} MP for roll ${total}`, async function () {
      rollSteps.push({ total });
      const caster = actor();
      await spell(caster).rollItemTest(true);
      assert.equal(caster.system.attributes.mp.value, 10 - cost);
      assert.equal(messages[0].context.mpSpent, cost);
    });
  }

  it('caps shift-click at available MP, including after another queued cast', async function () {
    const caster = actor('Actor.caster', 7);
    const item = spell(caster, { magnitude: 5 });
    await Promise.all([item.rollItemTest(true), item.rollItemTest(true)]);
    assert.deepEqual(
      messages.map((message) => message.context.magnitude),
      [5, 2],
    );
    assert.equal(caster.system.attributes.mp.value, 0);
    assert.equal(dialogs.length, 0);
  });

  it('rejects zero MP and unaffordable non-variable shift-click casts', async function () {
    await spell(actor('Actor.empty', 0), { magnitude: 5 }).rollItemTest(true);
    await spell(actor('Actor.fixed', 2), { magnitude: 5, nonVariant: true }).rollItemTest(true);
    assert.equal(rolls.length, 0);
    assert.equal(messages.length, 0);
    assert.deepEqual(warnings, ['OQ.Warnings.NotEnoughMagicPoints', 'OQ.Warnings.NotEnoughMagicPoints']);
  });

  it('deducts split divine casts from the current remainder', async function () {
    const item = spell(actor(), { noMagicPoints: true });
    const first = await openCast(item);
    const second = await openCast(item);
    first.confirm(1);
    second.confirm(2);
    await Promise.all([first.pending, second.pending]);
    assert.equal(item.system.remainingMagnitude, 0);
    assert.deepEqual(
      messages.map((message) => message.context.remainingMagnitude),
      [2, 0],
    );
    assert.equal(rolls.length, 0);
  });

  it('rejects a divine selection exceeding the remaining magnitude', async function () {
    const item = spell(actor(), { noMagicPoints: true });
    const first = await openCast(item);
    const second = await openCast(item);
    first.confirm(2);
    second.confirm(2);
    await Promise.all([first.pending, second.pending]);
    assert.equal(item.system.remainingMagnitude, 1);
    assert.equal(messages.length, 1);
    assert.match(warnings[0], /InvalidMagnitude/);
  });

  it('honors divine magnitude edits and regaining while a dialog is open', async function () {
    const item = spell(actor(), { noMagicPoints: true, magnitude: 5, remainingMagnitude: 2 });
    const cast = await openCast(item);
    await item.regainDivineSpell();
    cast.confirm(2);
    await cast.pending;
    assert.equal(item.system.remainingMagnitude, 3);
    assert.equal(messages[0].context.remainingMagnitude, 3);
  });

  it('only casts a non-variable divine spell once until regained', async function () {
    const item = spell(actor(), { noMagicPoints: true, nonVariant: true });
    const first = await openCast(item);
    const second = await openCast(item);
    first.confirm();
    second.confirm();
    await Promise.all([first.pending, second.pending]);
    assert.equal(item.system.remainingMagnitude, 0);
    assert.equal(messages.length, 1);
    assert.deepEqual(warnings, ['OQ.Warnings.SpellExpended']);
    await item.regainDivineSpell();
    await item.rollItemTest(true);
    assert.equal(messages.length, 2);
  });

  it('uses the current divine remainder for a queued shift-click', async function () {
    const item = spell(actor(), { noMagicPoints: true });
    const first = await openCast(item);
    first.confirm(1);
    await tick();
    await Promise.all([first.pending, item.rollItemTest(true)]);
    assert.deepEqual(
      messages.map((message) => message.context.magnitude),
      [1, 2],
    );
    assert.equal(item.system.remainingMagnitude, 0);
  });

  it('revalidates the spell limit and casting skill after dialog confirmation', async function () {
    const item = spell();
    const cast = await openCast(item);
    item.system.magnitude = 2;
    cast.confirm(3);
    await cast.pending;
    const missingSkill = await openCast(item);
    delete item.parent.system.skillsBySlug.magic;
    missingSkill.confirm(2);
    await missingSkill.pending;
    assert.equal(rolls.length, 0);
    assert.equal(messages.length, 0);
    assert.match(warnings[0], /InvalidMagnitude/);
    assert.equal(warnings[1], 'OQ.Warnings.NoCastingSkill');
  });

  it('does not block casts behind an open or cancelled dialog', async function () {
    const item = spell();
    const cast = await openCast(item);
    await item.rollItemTest(true);
    cast.cancel();
    await cast.pending;
    await item.rollItemTest(true);
    assert.equal(item.parent.system.attributes.mp.value, 4);
    assert.equal(messages.length, 2);
  });

  for (const failure of ['roll', 'update']) {
    it(`releases the queue and propagates a rejected ${failure}`, async function () {
      const gate = deferred();
      const caster = actor();
      if (failure === 'roll') rollSteps.push({ wait: gate.promise });
      else caster.beforeUpdate = () => gate.promise;
      const item = spell(caster);
      const first = item.rollItemTest(true);
      const rejected = assert.rejects(first, /failed/);
      await tick();
      const second = item.rollItemTest(true);
      caster.beforeUpdate = undefined;
      gate.reject(new Error('failed'));
      await rejected;
      await second;
      assert.equal(caster.system.attributes.mp.value, 7);
      assert.equal(messages.length, 1);
    });
  }

  for (const divine of [false, true]) {
    it(`does not post a card for a cancelled ${divine ? 'divine' : 'MP'} update`, async function () {
      const item = spell(actor(), { noMagicPoints: divine });
      const target = divine ? item : item.parent;
      target.cancelUpdate = true;
      await item.rollItemTest(true);
      assert.equal(messages.length, 0);
      assert.equal(item.system.remainingMagnitude, 3);
      assert.equal(item.parent.system.attributes.mp.value, 10);
      target.cancelUpdate = false;
      await item.rollItemTest(true);
      assert.equal(messages.length, 1);
    });
  }

  it('lets independent synthetic token actors cast while another actor waits', async function () {
    const gate = deferred();
    rollSteps.push({ wait: gate.promise });
    const firstActor = actor('Scene.scene.Token.first.Actor.base');
    const secondActor = actor('Scene.scene.Token.second.Actor.base');
    const first = spell(firstActor).rollItemTest(true);
    await tick();
    await spell(secondActor).rollItemTest(true);
    assert.equal(secondActor.system.attributes.mp.value, 7);
    assert.equal(firstActor.system.attributes.mp.value, 10);
    gate.resolve();
    await first;
    assert.equal(firstActor.system.attributes.mp.value, 7);
  });
});
