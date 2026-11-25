import assert from 'assert';
import { effectListEntry } from '../src/module/utils/effect-contributions.js';

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
});
