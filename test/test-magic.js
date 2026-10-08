import assert from 'assert';
import { spellCastingCost } from '../src/module/utils/magic.js';
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
});
