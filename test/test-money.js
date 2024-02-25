import { OQMoneyService, parseMoneyString } from '../src/module/utils/money.js';
import { SettingsConfig } from '../src/module/consts/settings-config.js';
import expect from 'expect.js';
import _ from 'lodash-es';

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
          label: 'Gold Ducats',
          multiplier: 20,
        },
        SP: {
          label: 'Silver Pieces',
          multiplier: 1,
        },
        CP: {
          label: 'Copper Pennies',
          multiplier: 0.1,
        },
        LB: {
          label: 'Lead Bits',
          multiplier: 0.02,
        },
      };
      const moneyConfig = parseMoneyString(defaultString);
      expect(moneyConfig).to.eql(expectedConfig);
    });
  });

  describe('OQMoneyService', function () {
    const moneyService = new OQMoneyService(SettingsConfig.defaults.defaultCoinsConfiguration);

    it('Should return proper fields for default money', () => {
      expect(moneyService.fields).to.eql([
        {
          name: 'GD',
          label: 'Gold Ducats',
          multiplier: 20,
        },
        {
          name: 'SP',
          label: 'Silver Pieces',
          multiplier: 1,
        },
        {
          name: 'CP',
          label: 'Copper Pennies',
          multiplier: 0.1,
        },
        {
          name: 'LB',
          label: 'Lead Bits',
          multiplier: 0.02,
        },
      ]);
    });

    it('Should calculate proper internal multiplier for default config', () => {
      expect(moneyService.multiplier).to.eql(100);
    });

    function makeExpected(gold, silver, copper, lead) {
      return [
        {
          name: 'GD',
          amount: gold,
          label: 'Gold Ducats',
          multiplier: 20,
        },
        {
          name: 'SP',
          amount: silver,
          label: 'Silver Pieces',
          multiplier: 1,
        },
        {
          name: 'CP',
          amount: copper,
          label: 'Copper Pennies',
          multiplier: 0.1,
        },
        {
          name: 'LB',
          amount: lead,
          label: 'Lead Bits',
          multiplier: 0.02,
        },
      ];
    }

    const flatMoneyToConvert = [
      [100, makeExpected(5, 0, 0, 0)],
      [1, makeExpected(0, 1, 0, 0)],
      [0.02, makeExpected(0, 0, 0, 1)],
      [123, makeExpected(6, 3, 0, 0)],
    ];

    _.forEach(flatMoneyToConvert, ([flat, expected]) => {
      it(`Should properly convert ${flat}`, () => {
        const result = moneyService.consolidateFlat(flat);
        expect(expected).to.eql(result);
      });
    });

    const makeInput = (gold, silver, copper, lead) => ({
      GD: gold,
      SP: silver,
      CP: copper,
      LB: lead,
    });

    const moneyToConvert = [
      [makeInput(0, 100, 0, 0), makeExpected(5, 0, 0, 0)],
      [makeInput(0, 0, 12, 50), makeExpected(0, 2, 2, 0)],
      [makeInput(0, 0, 11, 137), makeExpected(0, 3, 8, 2)],
    ];
    _.forEach(moneyToConvert, ([toConvert, expected]) => {
      it(`Should properly convert Gold: ${toConvert.GD}, Silver: ${toConvert.SP}, Copper: ${toConvert.CP}, Lead: ${toConvert.LB}`, () => {
        const result = moneyService.consolidate(toConvert);
        expect(expected).to.eql(result);
      });
    });
  });
});
