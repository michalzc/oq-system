import assert from 'assert';
import { evaluateTestRoll, getResult, getResultFeatures } from '../src/module/utils/roll.js';
import { RollConfig } from '../src/module/consts/rolls-config.js';
import { SrdRules } from '../src/module/consts/rules-config.js';

describe('roll.js', function () {
  globalThis.CONFIG = {
    OQ: {
      RollConfig,
      Rules: SrdRules,
    },
  };

  describe('#getResult() for non-mastered skill', function () {
    const value50NonMasteredSkillRollData = {
      masterNeverThrows: true,
      mastered: false,
      totalValue: 50,
    };

    function makeRowData(rollValue, skillValue, skillTotalValue, expectedResult) {
      return {
        rollValue,
        skillValue,
        skillTotalValue,
        expectedResult,
      };
    }

    const rollsAndResults = [
      makeRowData(10, 50, 50, RollConfig.rollResults.success),
      makeRowData(60, 50, 50, RollConfig.rollResults.failure),
      makeRowData(22, 50, 50, RollConfig.rollResults.criticalSuccess),
      makeRowData(77, 50, 50, RollConfig.rollResults.fumble),
      makeRowData(85, 80, 100, RollConfig.rollResults.success),
      makeRowData(88, 80, 100, RollConfig.rollResults.criticalSuccess),
      makeRowData(100, 80, 100, RollConfig.rollResults.fumble),
    ];

    rollsAndResults.forEach((data) => {
      it(`should return ${data.expectedResult} for non-mastered roll ${data.rollValue} against skill of ${data.skillValue} and total ${data.skillTotalValue}`, function () {
        const updatedRollData = {
          ...value50NonMasteredSkillRollData,
          value: data.skillValue,
          totalValue: data.skillTotalValue,
        };
        const roll = { total: data.rollValue };
        const rollFeatures = getResultFeatures(roll);
        const result = getResult(rollFeatures, data.rollValue, updatedRollData);
        assert.equal(result, data.expectedResult);
      });
    });
  });

  describe('#getResult() for mastered skills of value 100', function () {
    const masteredSkillRollData = {
      mastered: true,
      value: 100,
      totalValue: 100,
    };

    function makeDataRow(rollValue, skillTotalValue, expectedResult) {
      return {
        rollValue,
        skillTotalValue,
        expectedResult,
      };
    }

    const rollsResultsAndData = [
      makeDataRow(51, 100, RollConfig.rollResults.criticalSuccess),
      makeDataRow(55, 100, RollConfig.rollResults.criticalSuccess),
      makeDataRow(99, 90, RollConfig.rollResults.fumble),
      makeDataRow(91, 90, RollConfig.rollResults.failure),
      makeDataRow(81, 90, RollConfig.rollResults.success),
      makeDataRow(100, 90, RollConfig.rollResults.fumble),
    ];

    rollsResultsAndData.forEach((data) => {
      it(`should return ${data.expectedResult} for roll of ${
        data.rollValue
      } against mastered skill of modified value of ${data.skillTotalValue} ${
        (data.masterNeverThrows && 'when masterNeverThrows') || ''
      }`, function () {
        const updatedRollData = {
          ...masteredSkillRollData,
          totalValue: data.skillTotalValue,
        };
        const roll = { total: data.rollValue };
        const rollFeatures = getResultFeatures(roll);
        const result = getResult(rollFeatures, roll.total, updatedRollData);
        assert.equal(result, data.expectedResult);
      });
    });
  });

  describe('#evaluateTestRoll() Modified skill', function () {
    let savedGlobals;

    beforeEach(function () {
      savedGlobals = { CONFIG: globalThis.CONFIG, Roll: globalThis.Roll };
      globalThis.Roll = class {
        async evaluate() {
          this.total = 50;
          return this;
        }
      };
    });

    afterEach(function () {
      globalThis.CONFIG = savedGlobals.CONFIG;
      globalThis.Roll = savedGlobals.Roll;
    });

    const withSkillCap = (skillCap) => {
      globalThis.CONFIG = { OQ: { RollConfig, Rules: { ...SrdRules, skillCap } } };
    };

    const difficult = { key: 'difficult', value: -20 };

    const rows = [
      [false, 120, difficult, 100],
      [false, 150, undefined, 150],
      [true, 150, undefined, 100],
    ];

    rows.forEach(([skillCap, value, difficulty, expected]) => {
      it(`should roll a ${value}% skill${
        difficulty ? ' at Difficult' : ''
      } against ${expected} when skillCap is ${skillCap}`, async function () {
        withSkillCap(skillCap);
        const { totalValue } = await evaluateTestRoll({ value, difficulty, messageMode: 'public' });
        assert.equal(totalValue, expected);
      });
    });
  });
});
