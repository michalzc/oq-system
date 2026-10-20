import assert from 'assert';
import { evaluateTestRoll, getResult, getResultFeatures } from '../src/module/utils/roll.js';
import { RollConfig } from '../src/module/consts/rolls-config.js';
import { CriticalRules, FumbleRules, SrdRules } from '../src/module/consts/rules-config.js';

const { criticalSuccess, success, failure, fumble } = RollConfig.rollResults;

function stubRules(rules = {}) {
  globalThis.CONFIG = { OQ: { RollConfig, Rules: { ...SrdRules, ...rules } } };
}

/**
 * @param {number} rollValue the D100 roll
 * @param {number} value the unmodified skill
 * @param {number} [totalValue] the Modified skill
 */
function resultOf(rollValue, value, totalValue = value) {
  return getResult(getResultFeatures({ total: rollValue }), rollValue, { value, totalValue });
}

describe('roll.js', function () {
  beforeEach(function () {
    stubRules();
  });

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

  describe('#getResult() with the tenth critical rule', function () {
    beforeEach(function () {
      stubRules({ criticalRule: CriticalRules.tenth });
    });

    it('criticals on 01-03 for 47% at Difficult -20 (27%)', function () {
      assert.deepEqual(
        [1, 2, 3].map((roll) => resultOf(roll, 47, 27)),
        [criticalSuccess, criticalSuccess, criticalSuccess],
      );
    });

    it('succeeds on 04-27 for 47% at Difficult -20 (27%)', function () {
      assert.deepEqual(
        [4, 11, 22, 27].map((roll) => resultOf(roll, 47, 27)),
        [success, success, success, success],
      );
    });

    it('criticals on 01 for 5%', function () {
      assert.deepEqual([resultOf(1, 5), resultOf(2, 5)], [criticalSuccess, success]);
    });

    it('never criticals with a Modified skill of 0', function () {
      assert.equal(resultOf(1, 30, 0), failure);
    });

    it('treats a successful 22 against 50% as a plain success', function () {
      assert.equal(resultOf(22, 50), success);
    });

    it('still fumbles on a failed double with the doubles fumble rule', function () {
      assert.equal(resultOf(77, 50), fumble);
    });
  });

  describe('#getResult() with the hundred fumble rule', function () {
    beforeEach(function () {
      stubRules({ fumbleRule: FumbleRules.hundred });
    });

    it('treats a failed 66 as a failure', function () {
      assert.equal(resultOf(66, 50), failure);
    });

    it('fumbles on 100', function () {
      assert.equal(resultOf(100, 50), fumble);
    });

    it('keeps doubles criticals with the doubles critical rule', function () {
      assert.equal(resultOf(22, 50), criticalSuccess);
    });
  });

  describe('#getResult() with Mastery off', function () {
    it('fumbles when a 100% skill rolls 100', function () {
      stubRules({ mastery: false });
      assert.equal(resultOf(100, 100), fumble);
    });

    it('criticals when a 100% skill rolls 05 with the tenth critical rule', function () {
      stubRules({ mastery: false, criticalRule: CriticalRules.tenth });
      assert.equal(resultOf(5, 100), criticalSuccess);
    });

    it('succeeds when a 100% skill rolls 50', function () {
      stubRules({ mastery: false });
      assert.equal(resultOf(50, 100), success);
    });

    it('fumbles on 100 against an uncapped Modified skill of 1000 with the tenth critical rule', function () {
      stubRules({ mastery: false, criticalRule: CriticalRules.tenth, fumbleRule: FumbleRules.hundred });
      assert.equal(resultOf(100, 1000), fumble);
    });
  });

  describe('#getResult() with Mastery on', function () {
    it('makes a Master roll an automatic critical, even 100', function () {
      assert.deepEqual([resultOf(50, 100), resultOf(100, 120, 100)], [criticalSuccess, criticalSuccess]);
    });

    it('fumbles on 100 for a skill modified up to 100%', function () {
      stubRules({ criticalRule: CriticalRules.tenth });
      assert.equal(resultOf(100, 50, 1000), fumble);
    });
  });

  describe('#evaluateTestRoll() Mastery flag', function () {
    let savedRoll;

    before(function () {
      savedRoll = globalThis.Roll;
      globalThis.Roll = class {
        async evaluate() {
          this.total = 50;
          return this;
        }
      };
    });

    after(function () {
      if (savedRoll === undefined) delete globalThis.Roll;
      else globalThis.Roll = savedRoll;
    });

    const masterRollData = { value: 100, mastered: true, messageMode: 'public' };

    it('marks a Master with Mastery on', async function () {
      const { mastered, rollResult } = await evaluateTestRoll(masterRollData);
      assert.deepEqual({ mastered, rollResult }, { mastered: true, rollResult: criticalSuccess });
    });

    it('marks nobody a Master with Mastery off', async function () {
      stubRules({ mastery: false });
      const { mastered, rollResult } = await evaluateTestRoll(masterRollData);
      assert.deepEqual({ mastered, rollResult }, { mastered: false, rollResult: success });
    });
  });
});
