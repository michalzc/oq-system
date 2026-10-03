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

    it('Should not lose coins to floating point rounding', () => {
      expect(moneyService.consolidate(makeInput(0, 0, 5, 4))).to.eql(makeExpected(0, 0, 5, 4));
      expect(moneyService.consolidateFlat(0.58)).to.eql(makeExpected(0, 0, 5, 4));
    });

    it('Should preserve the total value of any small copper and lead combination', () => {
      const valueOf = (coins) => _.sumBy(coins, (coin) => coin.amount * Math.round(coin.multiplier * 100));
      _.range(0, 40).forEach((copper) =>
        _.range(0, 25).forEach((lead) => {
          const result = moneyService.consolidate(makeInput(0, 0, copper, lead));
          expect(valueOf(result)).to.eql(copper * 10 + lead * 2);
        }),
      );
    });

    it('Should consolidate empty money to zero coins', () => {
      expect(moneyService.consolidate({})).to.eql(makeExpected(0, 0, 0, 0));
    });

    it('Should ignore coins missing from the configuration', () => {
      expect(moneyService.consolidate({ SP: 3, XX: 7 })).to.eql(makeExpected(0, 3, 0, 0));
    });
  });

  describe('OQMoneyService with an ascending configuration', function () {
    const moneyService = new OQMoneyService(
      'Lead Bits (LB) = 0.02, Copper Pennies (CP) = 0.1, Silver Pieces (SP) = 1, Gold Ducats (GD) = 20',
    );

    it('Should order fields from the largest coin to the smallest', () => {
      expect(moneyService.fields.map((field) => field.name)).to.eql(['GD', 'SP', 'CP', 'LB']);
    });

    it('Should calculate the internal multiplier from the smallest coin', () => {
      expect(moneyService.multiplier).to.eql(100);
    });

    it('Should consolidate silver into gold and silver', () => {
      const amounts = _.fromPairs(moneyService.consolidate({ SP: 25 }).map((coin) => [coin.name, coin.amount]));
      expect(amounts).to.eql({ GD: 1, SP: 5, CP: 0, LB: 0 });
    });
  });
});
