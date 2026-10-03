import { renameLegacyField } from '../src/module/utils/utils.js';
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
});
