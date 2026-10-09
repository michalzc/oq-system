import { renameLegacyField, themedIconPath } from '../src/module/utils/utils.js';
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

  describe('#themedIconPath()', function () {
    it('Should move a legacy system icon to the themed directory', function () {
      expect(themedIconPath('systems/oq/assets/icons/skills.svg')).to.be('systems/oq/assets/icons/themed/skills.svg');
    });

    it('Should keep a leading slash', function () {
      expect(themedIconPath('/systems/oq/assets/icons/skills.svg')).to.be('/systems/oq/assets/icons/themed/skills.svg');
    });

    it('Should leave the NPC portrait in place', function () {
      expect(themedIconPath('systems/oq/assets/icons/cultist.svg')).to.be('systems/oq/assets/icons/cultist.svg');
    });

    it('Should leave an already themed icon untouched', function () {
      expect(themedIconPath('systems/oq/assets/icons/themed/skills.svg')).to.be(
        'systems/oq/assets/icons/themed/skills.svg',
      );
    });

    it('Should move every legacy system icon in HTML content', function () {
      const html =
        '<img src="systems/oq/assets/icons/skills.svg"><img src="systems/oq/assets/icons/cultist.svg">' +
        '<img src="systems/oq/assets/icons/ink-swirl.svg">';
      expect(themedIconPath(html)).to.be(
        '<img src="systems/oq/assets/icons/themed/skills.svg"><img src="systems/oq/assets/icons/cultist.svg">' +
          '<img src="systems/oq/assets/icons/themed/ink-swirl.svg">',
      );
    });

    it('Should leave other images untouched', function () {
      expect(themedIconPath('icons/svg/mystery-man.svg')).to.be('icons/svg/mystery-man.svg');
      expect(themedIconPath('worlds/test/assets/icons/skills.svg')).to.be('worlds/test/assets/icons/skills.svg');
    });
  });
});
