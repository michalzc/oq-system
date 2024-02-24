import { parseMoneyString } from '../src/module/utils/money.js';
import { SettingsConfig } from '../src/module/consts/settings-config.js';
import expect from 'expect.js';

describe('money.js', function () {
  describe('#parseMoneyString()', function () {
    const simpleMoneyString = 'Gold (g) = 10, Silver (s) = 1, Copper (c) = 0.1';
    it(`Should parse simple money string: ${simpleMoneyString}`, function () {
      const moneyConfig = parseMoneyString(simpleMoneyString);

      expect(moneyConfig).to.eql({
        g: {
          label: 'Gold',
          multiplier: 10,
        },
        s: {
          label: 'Silver',
          multiplier: 1,
        },
        c: {
          label: 'Copper',
          multiplier: 0.1,
        },
      });
    });

    const defaultString = SettingsConfig.defaults.defaultCoinsConfiguration;
    it(`Should parse default money config: ${defaultString}`, function () {
      const expectedConfig = {
        GD: {
          label: 'Gold Ducat',
          multiplier: 20,
        },
        SP: {
          label: 'Silver Piece',
          multiplier: 1,
        },
        CP: {
          label: 'Copper Penny',
          multiplier: 0.1,
        },
        LB: {
          label: 'Lead Bit',
          multiplier: 0.02,
        },
      };
      const moneyConfig = parseMoneyString(defaultString);
      expect(JSON.stringify(moneyConfig)).to.equal(JSON.stringify(expectedConfig));
    });
  });
});
