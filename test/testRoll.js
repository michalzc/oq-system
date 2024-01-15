import assert from 'assert';
import { getResult, getResultFeatures } from '../src/module/roll.js';
import { RollResults } from '../src/module/consts/rollResults.js';

describe('testRoll.js', function () {
  globalThis.CONFIG = {
    OQ: {
      RollResults,
    },
  };

  describe('#getResult()', function () {
    const value50NonMasteredSkillRollData = {
      masterNeverThrows: true,
      mastered: false,
      totalValue: 50,
    };

    const rollsAndResults = [
      [10, RollResults.success],
      [60, RollResults.failure],
      [22, RollResults.criticalSuccess],
      [77, RollResults.fumble],
      [100, RollResults.fumble],
    ];

    rollsAndResults.forEach(([rollValue, expectedResult]) => {
      it(`should return ${expectedResult} for non-mastered roll ${rollValue} against skill of ${value50NonMasteredSkillRollData.totalValue}`, function () {
        const roll = { total: rollValue };
        const rollFeatures = getResultFeatures(roll);
        const result = getResult(rollFeatures, rollValue, value50NonMasteredSkillRollData);
        assert(result, expectedResult);
      });
    });
  });
});
