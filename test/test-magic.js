import assert from 'assert';
import {
  customSpellGroups,
  isInSpellGroup,
  maxAffordableMagnitude,
  newSpellChanges,
  sorceryMaxMagnitude,
  spellCastingCost,
  spellMagicPointCost,
  spellUpdateChanges,
} from '../src/module/utils/magic.js';
import { RollConfig } from '../src/module/consts/rolls-config.js';

describe('magic.js', function () {
  globalThis.CONFIG = {
    OQ: {
      RollConfig,
    },
  };

  describe('#spellCastingCost()', function () {
    const { criticalSuccess, success, failure, fumble } = RollConfig.rollResults;

    const rows = [
      [success, 3, 3],
      [fumble, 3, 3],
      [failure, 3, 1],
      [criticalSuccess, 3, 1],
      [success, 1, 1],
      [failure, 0, 0],
      [criticalSuccess, 0, 0],
      ['unknown', 3, 0],
    ];

    rows.forEach(([rollResult, magnitude, expected]) => {
      it(`should cost ${expected} MP for ${rollResult} at magnitude ${magnitude}`, function () {
        assert.equal(spellCastingCost(rollResult, magnitude), expected);
      });
    });
  });

  describe('custom type spells', function () {
    const spell = (type, customTypeName, spent = false) => ({ system: { type, customTypeName }, spent });

    beforeEach(function () {
      globalThis.CONFIG = {
        OQ: { RollConfig, ItemConfig: { spellsTypes: { personal: 'personal', divine: 'divine', custom: 'custom' } } },
      };
    });

    describe('#customSpellGroups()', function () {
      it('Should group spells by custom type name, sorted by name', function () {
        const runeA = spell('custom', 'Rune Magic');
        const witch = spell('custom', 'Witchcraft');
        const runeB = spell('custom', 'Rune Magic');
        const groups = customSpellGroups([witch, runeA, runeB]);
        assert.deepEqual(
          groups.map(({ label, customTypeName, type }) => ({ label, customTypeName, type })),
          [
            { label: 'Rune Magic', customTypeName: 'Rune Magic', type: 'custom' },
            { label: 'Witchcraft', customTypeName: 'Witchcraft', type: 'custom' },
          ],
        );
        assert.deepEqual(groups[0].spells, [runeA, runeB]);
      });

      it('Should label spells with no custom type name with the custom type label', function () {
        const groups = customSpellGroups([spell('custom', ''), spell('custom', undefined)]);
        assert.equal(groups.length, 1);
        assert.equal(groups[0].label, 'OQ.Labels.SpellTypes.custom');
        assert.equal(groups[0].customTypeName, '');
      });

      it('Should mark groups with spent spells', function () {
        const groups = customSpellGroups([spell('custom', 'A', true), spell('custom', 'A'), spell('custom', 'B')]);
        assert.deepEqual(
          groups.map((group) => group.spent),
          [true, false],
        );
      });

      it('Should return no groups without spells', function () {
        assert.deepEqual(customSpellGroups([]), []);
      });
    });

    describe('#isInSpellGroup()', function () {
      it('Should match every spell without a spell type', function () {
        assert.equal(isInSpellGroup(spell('divine'), undefined), true);
        assert.equal(isInSpellGroup(spell('custom', 'Rune Magic'), ''), true);
      });

      it('Should match the spells of the spell type', function () {
        assert.equal(isInSpellGroup(spell('divine'), 'divine'), true);
        assert.equal(isInSpellGroup(spell('personal'), 'divine'), false);
      });

      it('Should match custom type spells by custom type name', function () {
        assert.equal(isInSpellGroup(spell('custom', 'Rune Magic'), 'custom', 'Rune Magic'), true);
        assert.equal(isInSpellGroup(spell('custom', 'Witchcraft'), 'custom', 'Rune Magic'), false);
        assert.equal(isInSpellGroup(spell('custom', undefined), 'custom', ''), true);
        assert.equal(isInSpellGroup(spell('divine'), 'custom', ''), false);
      });
    });
  });

  describe('sorcery manipulation', function () {
    beforeEach(function () {
      globalThis.CONFIG = {
        OQ: { RollConfig, ItemConfig: { spellsTypes: { personal: 'personal', sorcery: 'sorcery' } } },
      };
    });

    describe('#sorceryMaxMagnitude()', function () {
      [
        [0, 1],
        [1, 2],
        [10, 2],
        [11, 3],
        [50, 6],
        [90, 10],
        [91, 15],
        [99, 15],
        [100, 20],
        [120, 20],
        [undefined, 1],
      ].forEach(([skillValue, magnitude]) => {
        it(`Should allow magnitude ${magnitude} at casting skill ${skillValue}`, function () {
          assert.equal(sorceryMaxMagnitude(skillValue), magnitude);
        });
      });
    });

    describe('#spellMagicPointCost()', function () {
      [
        ['personal', 15, 15],
        ['sorcery', 1, 1],
        ['sorcery', 10, 10],
        ['sorcery', 11, 11],
        ['sorcery', 15, 11],
        ['sorcery', 20, 11],
        ['sorcery', 25, 11],
      ].forEach(([type, magnitude, cost]) => {
        it(`Should cost ${cost} MP to cast ${type} magnitude ${magnitude}`, function () {
          assert.equal(spellMagicPointCost(type, magnitude), cost);
        });
      });
    });

    describe('#maxAffordableMagnitude()', function () {
      it('Should keep a magnitude the magic points pay for', function () {
        assert.equal(maxAffordableMagnitude('sorcery', 15, 11), 15);
        assert.equal(maxAffordableMagnitude('personal', 5, 5), 5);
      });

      it('Should lower the magnitude to the magic points otherwise', function () {
        assert.equal(maxAffordableMagnitude('sorcery', 15, 10), 10);
        assert.equal(maxAffordableMagnitude('personal', 5, 3), 3);
      });
    });
  });

  describe('spell defaults', function () {
    const system = (values = {}) => ({
      type: 'personal',
      magnitude: 3,
      remainingMagnitude: 0,
      noMagicPoints: false,
      ...values,
    });

    beforeEach(function () {
      globalThis.CONFIG = {
        OQ: { RollConfig, ItemConfig: { spellsTypes: { personal: 'personal', divine: 'divine' } } },
      };
    });

    describe('#newSpellChanges()', function () {
      it('Should make a new divine spell need no magic points, with its full magnitude remaining', function () {
        assert.deepEqual(newSpellChanges({ type: 'divine' }, system({ type: 'divine' })), {
          noMagicPoints: true,
          remainingMagnitude: 3,
        });
      });

      it('Should keep the values of the creation data', function () {
        const source = { type: 'divine', noMagicPoints: false };
        assert.deepEqual(newSpellChanges(source, system({ type: 'divine' })), {});
        const expended = { type: 'divine', noMagicPoints: true, remainingMagnitude: 0 };
        assert.deepEqual(newSpellChanges(expended, system({ type: 'divine', noMagicPoints: true })), {});
      });

      it('Should give any spell with no magic point cost its full magnitude', function () {
        const source = { noMagicPoints: true };
        assert.deepEqual(newSpellChanges(source, system({ noMagicPoints: true })), { remainingMagnitude: 3 });
      });

      it('Should not change other spells', function () {
        assert.deepEqual(newSpellChanges({}, system()), {});
      });
    });

    describe('#spellUpdateChanges()', function () {
      it('Should make a spell changed to divine need no magic points, with its full magnitude remaining', function () {
        const changes = { type: 'divine', noMagicPoints: false, magnitude: 3 };
        assert.deepEqual(spellUpdateChanges(system(), changes), { noMagicPoints: true, remainingMagnitude: 3 });
      });

      it('Should keep No Magic Points unchecked on a divine spell', function () {
        const divine = system({ type: 'divine' });
        assert.deepEqual(spellUpdateChanges(divine, { type: 'divine', noMagicPoints: false, magnitude: 3 }), {});
      });

      it('Should give a spell switched to No Magic Points its full magnitude', function () {
        assert.deepEqual(spellUpdateChanges(system(), { noMagicPoints: true, magnitude: 4 }), {
          remainingMagnitude: 4,
        });
      });

      it('Should keep an unspent spell unspent when its magnitude changes', function () {
        const unspent = system({ noMagicPoints: true, remainingMagnitude: 3 });
        const changes = { noMagicPoints: true, magnitude: 5, remainingMagnitude: 3 };
        assert.deepEqual(spellUpdateChanges(unspent, changes), { remainingMagnitude: 5 });
      });

      it('Should keep no more than the new magnitude of a spent spell', function () {
        const spent = system({ noMagicPoints: true, magnitude: 5, remainingMagnitude: 4 });
        assert.deepEqual(spellUpdateChanges(spent, { magnitude: 2 }), { remainingMagnitude: 2 });
        assert.deepEqual(spellUpdateChanges(spent, { magnitude: 6 }), { remainingMagnitude: 4 });
      });

      it('Should keep a remaining magnitude edited without a magnitude change', function () {
        const spell = system({ noMagicPoints: true, remainingMagnitude: 3 });
        assert.deepEqual(spellUpdateChanges(spell, { magnitude: 3, remainingMagnitude: 1 }), {});
        assert.deepEqual(spellUpdateChanges(spell, undefined), {});
      });

      it('Should not change spells that cost magic points', function () {
        assert.deepEqual(spellUpdateChanges(system(), { type: 'personal', magnitude: 5 }), {});
      });
    });
  });
});
