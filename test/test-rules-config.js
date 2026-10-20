import { isSrdRules } from '../src/module/consts/rules-config.js';
import expect from 'expect.js';

/** The OpenQuest SRD Rule Options, written out from the spec. */
function srdRules() {
  return {
    skillCap: true,
    criticalRule: 'doubles',
    fumbleRule: 'doubles',
    mastery: true,
    difficulty: { easy: 50, simple: 20, difficult: -20, hard: -50 },
  };
}

describe('rules-config.js', function () {
  describe('#isSrdRules()', function () {
    it('Should recognize the OpenQuest SRD rules', function () {
      expect(isSrdRules(srdRules())).to.be(true);
    });

    const singleChanges = {
      'uncapped skills': (rules) => (rules.skillCap = false),
      'criticals at a tenth of the Modified skill': (rules) => (rules.criticalRule = 'tenth'),
      'fumbles on 100 only': (rules) => (rules.fumbleRule = 'hundred'),
      'Mastery off': (rules) => (rules.mastery = false),
      'a different Easy modifier': (rules) => (rules.difficulty.easy = 40),
      'a different Simple modifier': (rules) => (rules.difficulty.simple = 25),
      'a different Difficult modifier': (rules) => (rules.difficulty.difficult = -25),
      'a different Hard modifier': (rules) => (rules.difficulty.hard = -40),
    };

    for (const [change, apply] of Object.entries(singleChanges)) {
      it(`Should not recognize the SRD rules with ${change}`, function () {
        const rules = srdRules();
        apply(rules);
        expect(isSrdRules(rules)).to.be(false);
      });
    }
  });
});
