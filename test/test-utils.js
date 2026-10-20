import { minMaxValue, renameLegacyField } from '../src/module/utils/utils.js';
import { SrdRules } from '../src/module/consts/rules-config.js';
import expect from 'expect.js';

describe('utils.js', function () {
  describe('#renameLegacyField()', function () {
    it('Should move the legacy value to the new key', function () {
      const source = { weaponType: 'ranged' };
      renameLegacyField(source, 'weaponType', 'type');
      expect(source).to.eql({ type: 'ranged' });
    });

    it('Should keep the new value when both keys are present', function () {
      const source = { weaponType: 'ranged', type: 'shield' };
      renameLegacyField(source, 'weaponType', 'type');
      expect(source).to.eql({ type: 'shield' });
    });

    it('Should convert the legacy value', function () {
      const source = { consumable: false };
      renameLegacyField(source, 'consumable', 'type', (consumable) => (consumable ? 'consumable' : 'single'));
      expect(source).to.eql({ type: 'single' });
    });

    it('Should drop a null legacy value without setting the new key', function () {
      const source = { group: null, formula: '' };
      renameLegacyField(source, 'group', 'type');
      expect(source).to.eql({ formula: '' });
    });

    it('Should leave source without the legacy key untouched', function () {
      const source = { type: 'melee' };
      renameLegacyField(source, 'weaponType', 'type');
      expect(source).to.eql({ type: 'melee' });
    });
  });

  describe('#minMaxValue()', function () {
    let savedConfig;

    beforeEach(function () {
      savedConfig = globalThis.CONFIG;
    });

    afterEach(function () {
      globalThis.CONFIG = savedConfig;
    });

    const withSkillCap = (skillCap) => {
      globalThis.CONFIG = { OQ: { Rules: { ...SrdRules, skillCap } } };
    };

    it('Should cap the value at 100 when skills are capped', function () {
      withSkillCap(true);
      expect(minMaxValue(120)).to.be(100);
      expect(minMaxValue(75)).to.be(75);
    });

    it('Should keep the value above 100 when skills are uncapped', function () {
      withSkillCap(false);
      expect(minMaxValue(150)).to.be(150);
    });

    [true, false].forEach((skillCap) => {
      it(`Should keep 0 as the floor when skillCap is ${skillCap}`, function () {
        withSkillCap(skillCap);
        expect(minMaxValue(-15)).to.be(0);
      });
    });
  });
});
