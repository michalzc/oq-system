import assert from 'assert';
import {
  activeEffectChanges,
  attributeContribution,
  effectChangesToSave,
  effectListEntry,
  formatContribution,
} from '../src/module/utils/effect-contributions.js';

function effect(id, name, changes, { sourceName = '', ...extra } = {}) {
  return { _id: id, name, disabled: false, description: '', system: { sourceName, changes }, ...extra };
}

function ap(type, value) {
  return { key: '', target: 'ap', type, value, phase: 'initial', priority: null };
}

function mr(type, value, minimum) {
  return { key: '', target: 'mr', type, value, ...(minimum === undefined ? {} : { minimum }), phase: 'initial' };
}

describe('effect-contributions.js', function () {
  describe('#effectListEntry()', function () {
    it('lists changes stored by macros or modules before v0.9 as other stored changes, as stored', function () {
      const legacy = {
        name: 'Old macro bonus',
        disabled: false,
        system: {
          changes: [
            { key: 'system.attributes.ap.mod', type: 'add', value: 2, phase: 'initial', priority: null },
            { key: 'flags.some-module.aura', type: 'override', value: { radius: 3 }, phase: 'initial' },
          ],
        },
      };

      assert.deepStrictEqual(effectListEntry(legacy).otherChanges, [
        { key: 'system.attributes.ap.mod', type: 'add', value: '2' },
        { key: 'flags.some-module.aura', type: 'override', value: '{"radius":3}' },
      ]);
    });

    it('shows a reminder-only effect with its source name and rules text, and no changes', function () {
      const reminder = {
        name: 'River spirit',
        img: 'systems/oq/assets/icons/themed/magic-swirl.svg',
        disabled: false,
        description: '<p>Owes the river spirit a favour.</p>',
        system: { sourceName: 'Pact', changes: [] },
      };

      assert.deepStrictEqual(effectListEntry(reminder), {
        name: 'River spirit',
        img: 'systems/oq/assets/icons/themed/magic-swirl.svg',
        sourceName: 'Pact',
        rulesText: '<p>Owes the river spirit a favour.</p>',
        state: 'enabled',
        enabled: true,
        changes: [],
        otherChanges: [],
      });
    });

    it('keeps a disabled effect listed with a disabled state', function () {
      const entry = effectListEntry({ name: 'Protection', disabled: true, system: { changes: [] } });

      assert.strictEqual(entry.state, 'disabled');
      assert.strictEqual(entry.enabled, false);
      assert.strictEqual(entry.sourceName, '');
      assert.strictEqual(entry.rulesText, '');
    });
  });

  describe('#effectChangesToSave()', function () {
    const legacy = { key: 'system.attributes.ap.mod', type: 'add', value: 2, phase: 'initial', priority: null };
    // Saved by a later version with a target this one does not know.
    const future = { key: '', target: 'luck', type: 'add', value: 4, phase: 'initial', priority: null };
    const stored = [legacy, ap('add', 3), future, ap('multiply', 0.5)];

    it('effectListEntry lists OpenQuest changes apart from changes it does not manage', function () {
      const entry = effectListEntry(effect('mixed', 'Mixed', stored));

      assert.deepStrictEqual(entry.changes, [
        { target: 'ap', type: 'add', value: 3 },
        { target: 'ap', type: 'multiply', value: 0.5 },
      ]);
      assert.deepStrictEqual(entry.otherChanges, [
        { key: 'system.attributes.ap.mod', type: 'add', value: '2' },
        { key: 'luck', type: 'add', value: '4' },
      ]);
    });

    it('saves the edited OpenQuest changes and keeps every other stored change as stored', function () {
      const saved = effectChangesToSave(stored, [
        { target: 'ap', type: 'override', value: 6 },
        { target: 'ap', type: 'add', value: null },
      ]);

      assert.deepStrictEqual(saved, [
        legacy,
        future,
        { key: '', target: 'ap', type: 'override', value: 6, phase: 'initial' },
        { key: '', target: 'ap', type: 'add', value: 0, phase: 'initial' },
      ]);
    });
  });

  describe('minimums in the editor', function () {
    it('saves a movement minimum, and none when it is left blank', function () {
      const saved = effectChangesToSave(
        [],
        [
          { target: 'mr', type: 'add', value: -6, minimum: '1' },
          { target: 'mr', type: 'add', value: 4, minimum: '' },
          { target: 'mr', type: 'add', value: 2, minimum: null },
        ],
      );

      assert.deepStrictEqual(saved, [
        { key: '', target: 'mr', type: 'add', value: -6, minimum: 1, phase: 'initial' },
        { key: '', target: 'mr', type: 'add', value: 4, phase: 'initial' },
        { key: '', target: 'mr', type: 'add', value: 2, phase: 'initial' },
      ]);
    });

    it('drops a minimum on a target without minimums', function () {
      const [saved] = effectChangesToSave([], [{ target: 'ap', type: 'add', value: 3, minimum: 1 }]);

      assert.deepStrictEqual(saved, { key: '', target: 'ap', type: 'add', value: 3, phase: 'initial' });
    });

    it('lists the minimum a change sets', function () {
      const entry = effectListEntry(effect('slow', 'Slow 3', [mr('add', -6, 1), ap('add', 1)]));

      assert.deepStrictEqual(entry.changes, [
        { target: 'mr', type: 'add', value: -6, minimum: 1 },
        { target: 'ap', type: 'add', value: 1 },
      ]);
    });
  });

  describe('#activeEffectChanges()', function () {
    it("carries the identity, name, source name and rules text of each change's effect", function () {
      const protection = effect('prot', 'Protection 3', [ap('add', 3)], {
        sourceName: 'Protection',
        description: '<p>+1 AP per magnitude.</p>',
      });

      assert.deepStrictEqual(activeEffectChanges([protection]), [
        {
          effectId: 'prot',
          name: 'Protection 3',
          sourceName: 'Protection',
          rulesText: '<p>+1 AP per magnitude.</p>',
          target: 'ap',
          type: 'add',
          value: 3,
        },
      ]);
    });

    it('leaves out changes that change nothing: adding 0 or multiplying by 1', function () {
      const changes = activeEffectChanges([effect('new', 'New effect', [ap('add', 0), ap('multiply', 1)])]);

      assert.deepStrictEqual(changes, []);
    });
  });

  describe('#attributeContribution()', function () {
    it('adds Protection 3 on top of 2 AP', function () {
      const changes = activeEffectChanges([
        effect('prot', 'Protection 3', [ap('add', 3)], { sourceName: 'Protection' }),
      ]);

      assert.deepStrictEqual(attributeContribution('ap', 2, changes), {
        value: 5,
        unmodified: 2,
        needsReview: false,
        contributions: [{ effectId: 'prot', name: 'Protection 3', sourceName: 'Protection', type: 'add', value: 3 }],
      });
    });

    it('ignores disabled effects, suppressed effects and changes not managed by OpenQuest', function () {
      const changes = activeEffectChanges([
        effect('off', 'Protection 3', [ap('add', 3)], { disabled: true }),
        // An effect document reports suppression through `active`.
        effect('sup', 'Shield ring', [ap('add', 2)], { active: false }),
        effect('macro', 'Old macro bonus', [{ key: 'system.attributes.ap.mod', type: 'add', value: 2 }]),
      ]);

      const result = attributeContribution('ap', 2, changes);

      assert.strictEqual(result.value, 2);
      assert.deepStrictEqual(result.contributions, []);
    });

    it('multiplies AP and rounds down: 5 AP halved is 2', function () {
      const changes = activeEffectChanges([effect('half', 'Weakened armour', [ap('multiply', 0.5)])]);

      const result = attributeContribution('ap', 5, changes);

      assert.strictEqual(result.value, 2);
      assert.deepStrictEqual(result.contributions, [
        { effectId: 'half', name: 'Weakened armour', sourceName: '', type: 'multiply', value: 0.5 },
      ]);
    });

    it('multiplies the unmodified value before adding, and lists mixed contributions for review', function () {
      // Listed out of application order on purpose.
      const changes = activeEffectChanges([
        effect('prot', 'Protection 3', [ap('add', 3)]),
        effect('double', 'Hardened skin', [ap('multiply', 2)]),
      ]);

      const result = attributeContribution('ap', 4, changes);

      assert.strictEqual(result.value, 11);
      assert.strictEqual(result.needsReview, true);
      assert.deepStrictEqual(
        result.contributions.map(({ effectId, type, value }) => [effectId, type, value]),
        [
          ['double', 'multiply', 2],
          ['prot', 'add', 3],
        ],
      );
    });

    it('replaces the result with an override, still listing the overridden addition', function () {
      const changes = activeEffectChanges([
        effect('set', 'Stone form', [ap('override', 8)]),
        effect('prot', 'Protection 3', [ap('add', 3)]),
      ]);

      const result = attributeContribution('ap', 2, changes);

      assert.strictEqual(result.value, 8);
      assert.strictEqual(result.needsReview, false);
      assert.deepStrictEqual(
        result.contributions.map(({ effectId, type, value }) => [effectId, type, value]),
        [
          ['prot', 'add', 3],
          ['set', 'override', 8],
        ],
      );
    });

    it('uses the highest of several overrides, whatever their order, and lists them all for review', function () {
      const low = effect('low', 'Brittle hide', [ap('override', 1)]);
      const high = effect('high', 'Stone form', [ap('override', 8)]);

      for (const effects of [
        [low, high],
        [high, low],
      ]) {
        const result = attributeContribution('ap', 2, activeEffectChanges(effects));

        assert.strictEqual(result.value, 8);
        assert.strictEqual(result.needsReview, true);
        assert.deepStrictEqual(result.contributions.map(({ effectId }) => effectId).sort(), ['high', 'low']);
      }
    });

    it('sums several sources of the same operation, listing each', function () {
      const changes = activeEffectChanges([
        effect('prot', 'Protection 3', [ap('add', 3)], { sourceName: 'Protection' }),
        effect('bless', 'Blessing', [ap('add', 1), ap('add', 1)]),
      ]);

      const result = attributeContribution('ap', 2, changes);

      assert.strictEqual(result.value, 7);
      assert.strictEqual(result.needsReview, false);
      assert.deepStrictEqual(
        result.contributions.map(({ name, sourceName, value }) => [name, sourceName, value]),
        [
          ['Protection 3', 'Protection', 3],
          ['Blessing', '', 1],
          ['Blessing', '', 1],
        ],
      );
    });

    it('leaves the value unchanged without contributions', function () {
      assert.deepStrictEqual(attributeContribution('ap', 2, []), {
        value: 2,
        unmodified: 2,
        needsReview: false,
        contributions: [],
      });
    });

    it('reads amounts stored as text by a macro as numbers and skips ones that are not numbers', function () {
      const changes = activeEffectChanges([effect('macro', 'Macro protection', [ap('add', '3'), ap('add', 'lots')])]);

      const result = attributeContribution('ap', 2, changes);

      assert.strictEqual(result.value, 5);
      assert.deepStrictEqual(
        result.contributions.map(({ value }) => value),
        [3],
      );
    });
  });

  describe('#attributeContribution() for movement', function () {
    it('adds Mobility 2 (+4m) to a movement rate of 15', function () {
      const changes = activeEffectChanges([effect('mob', 'Mobility 2', [mr('add', 4)], { sourceName: 'Mobility' })]);

      assert.deepStrictEqual(attributeContribution('mr', 15, changes), {
        value: 19,
        unmodified: 15,
        needsReview: false,
        contributions: [{ effectId: 'mob', name: 'Mobility 2', sourceName: 'Mobility', type: 'add', value: 4 }],
      });
    });

    it('keeps fractional movement from a multiplier: 15m halved is 7.5m', function () {
      const changes = activeEffectChanges([effect('half', 'Hobbled', [mr('multiply', 0.5)])]);

      assert.strictEqual(attributeContribution('mr', 15, changes).value, 7.5);
    });

    it('multiplies without floating point noise: 9m × 1.2 is 10.8m', function () {
      const changes = activeEffectChanges([effect('fast', 'Fleet', [mr('multiply', 1.2)])]);

      assert.strictEqual(attributeContribution('mr', 9, changes).value, 10.8);
    });

    it('subtracts Slow 3 (−6m) from 15m: 9m', function () {
      const changes = activeEffectChanges([effect('slow', 'Slow 3', [mr('add', -6, 1)], { sourceName: 'Slow' })]);

      assert.strictEqual(attributeContribution('mr', 15, changes).value, 9);
    });

    it("never takes Slow 8 (−16m) below its 1m minimum, showing the minimum with Slow's contribution", function () {
      const changes = activeEffectChanges([effect('slow', 'Slow 8', [mr('add', -16, 1)], { sourceName: 'Slow' })]);

      assert.deepStrictEqual(attributeContribution('mr', 15, changes), {
        value: 1,
        unmodified: 15,
        needsReview: false,
        minimum: 1,
        contributions: [{ effectId: 'slow', name: 'Slow 8', sourceName: 'Slow', type: 'add', value: -16, minimum: 1 }],
      });
    });

    it('applies the minimum after an override', function () {
      const changes = activeEffectChanges([
        effect('root', 'Rooted', [mr('override', 0)]),
        effect('slow', 'Slow 1', [mr('add', -2, 1)]),
      ]);

      assert.strictEqual(attributeContribution('mr', 15, changes).value, 1);
    });

    it('uses the highest of several minimums', function () {
      const changes = activeEffectChanges([
        effect('slow', 'Slow 8', [mr('add', -16, 1)]),
        effect('mire', 'Mire', [mr('add', -2, 3)]),
      ]);

      const result = attributeContribution('mr', 15, changes);

      assert.strictEqual(result.value, 3);
      assert.strictEqual(result.minimum, 3);
    });

    it('lists Mobility 2 and Slow 3 together: 15m + 4m − 6m is 13m', function () {
      const changes = activeEffectChanges([
        effect('mob', 'Mobility 2', [mr('add', 4)], { sourceName: 'Mobility' }),
        effect('slow', 'Slow 3', [mr('add', -6, 1)], { sourceName: 'Slow' }),
      ]);

      const result = attributeContribution('mr', 15, changes);

      assert.strictEqual(result.value, 13);
      assert.deepStrictEqual(
        result.contributions.map(({ name, sourceName, value }) => [name, sourceName, value]),
        [
          ['Mobility 2', 'Mobility', 4],
          ['Slow 3', 'Slow', -6],
        ],
      );
    });

    it('never raises movement already below the minimum: Slow 1 on 0m leaves 0m', function () {
      const changes = activeEffectChanges([effect('slow', 'Slow 1', [mr('add', -2, 1)])]);

      assert.strictEqual(attributeContribution('mr', 0, changes).value, 0);
    });

    it('leaves out a change that only sets a minimum, since it cannot change anything', function () {
      const changes = activeEffectChanges([effect('floor', 'Sure-footed', [mr('add', 0, 5)])]);

      assert.deepStrictEqual(changes, []);
    });

    it('ignores a minimum stored on a target without minimums', function () {
      const changes = activeEffectChanges([effect('prot', 'Protection 3', [{ ...ap('add', 3), minimum: 9 }])]);

      const result = attributeContribution('ap', 2, changes);

      assert.strictEqual(result.value, 5);
      assert.strictEqual(result.minimum, undefined);
      assert.strictEqual(result.contributions[0].minimum, undefined);
    });

    it('sets movement with an override', function () {
      const changes = activeEffectChanges([effect('root', 'Rooted', [mr('override', 0)])]);

      assert.strictEqual(attributeContribution('mr', 15, changes).value, 0);
    });
  });

  describe('#formatContribution()', function () {
    it('shows each operation with its amount', function () {
      assert.deepStrictEqual(
        [
          ['add', 3],
          ['add', -2],
          ['multiply', 0.5],
          ['override', 8],
        ].map(([type, value]) => formatContribution({ type, value })),
        ['+3', '−2', '×0.5', '= 8'],
      );
    });
  });
});
