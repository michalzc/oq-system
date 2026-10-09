import assert from 'assert';
import { customSpellGroups, isInSpellGroup, spellCastingCost } from '../src/module/utils/magic.js';
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
});
