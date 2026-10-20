import { invalidRuleOptions, isSrdRules, rulesFromFormData, rulesPresetOf } from '../src/module/consts/rules-config.js';
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

  describe('#rulesPresetOf()', function () {
    it('Should name the OpenQuest SRD preset for the SRD rules', function () {
      expect(rulesPresetOf(srdRules())).to.be('srd');
    });

    it("Should name the Custom preset for the requester's combination", function () {
      const rules = {
        skillCap: false,
        criticalRule: 'tenth',
        fumbleRule: 'hundred',
        mastery: false,
        difficulty: { easy: 50, simple: 25, difficult: -25, hard: -50 },
      };
      expect(rulesPresetOf(rules)).to.be('custom');
    });

    it('Should name the Custom preset when one modifier differs', function () {
      const rules = srdRules();
      rules.difficulty.hard = -49;
      expect(rulesPresetOf(rules)).to.be('custom');
    });
  });

  describe('#rulesFromFormData()', function () {
    it('Should read the Rule Options from the flat form data of the rules form', function () {
      const formData = {
        'oq.rules.skillCap': false,
        'oq.rules.criticalRule': 'tenth',
        'oq.rules.fumbleRule': 'hundred',
        'oq.rules.mastery': false,
        'oq.rules.difficulty.easy': 50,
        'oq.rules.difficulty.simple': 25,
        'oq.rules.difficulty.difficult': -25,
        'oq.rules.difficulty.hard': -50,
      };
      expect(rulesFromFormData(formData, 'oq.rules')).to.eql({
        skillCap: false,
        criticalRule: 'tenth',
        fumbleRule: 'hundred',
        mastery: false,
        difficulty: { easy: 50, simple: 25, difficult: -25, hard: -50 },
      });
    });

    it('Should ignore form fields that are not Rule Options', function () {
      const formData = {
        preset: 'custom',
        'oq.rules.skillCap': true,
        'oq.rules.criticalRule': 'doubles',
        'oq.rules.fumbleRule': 'doubles',
        'oq.rules.mastery': true,
        'oq.rules.difficulty.easy': 50,
        'oq.rules.difficulty.simple': 20,
        'oq.rules.difficulty.difficult': -20,
        'oq.rules.difficulty.hard': -50,
        'oq.rules.difficulty.normal': 0,
      };
      expect(rulesFromFormData(formData, 'oq.rules')).to.eql(srdRules());
    });

    it('Should read an empty or non-numeric modifier as not a number', function () {
      const formData = {
        'oq.rules.skillCap': true,
        'oq.rules.criticalRule': 'doubles',
        'oq.rules.fumbleRule': 'doubles',
        'oq.rules.mastery': true,
        'oq.rules.difficulty.easy': null,
        'oq.rules.difficulty.simple': '',
        'oq.rules.difficulty.difficult': 'abc',
        'oq.rules.difficulty.hard': '-30',
      };
      const { difficulty } = rulesFromFormData(formData, 'oq.rules');
      expect(difficulty.easy).to.be.NaN;
      expect(difficulty.simple).to.be.NaN;
      expect(difficulty.difficult).to.be.NaN;
      expect(difficulty.hard).to.be(-30);
    });
  });

  describe('#invalidRuleOptions()', function () {
    it('Should accept the SRD rules', function () {
      expect(invalidRuleOptions(srdRules())).to.eql([]);
    });

    it("Should accept the requester's combination", function () {
      const rules = {
        skillCap: false,
        criticalRule: 'tenth',
        fumbleRule: 'hundred',
        mastery: false,
        difficulty: { easy: 50, simple: 25, difficult: -25, hard: -50 },
      };
      expect(invalidRuleOptions(rules)).to.eql([]);
    });

    it('Should accept modifiers at the ends of their ranges', function () {
      const rules = srdRules();
      rules.difficulty = { easy: 100, simple: 0, difficult: 0, hard: -100 };
      expect(invalidRuleOptions(rules)).to.eql([]);
    });

    const invalidModifiers = {
      'an Easy modifier above 100': ['easy', 101, 0, 100],
      'a negative Simple modifier': ['simple', -5, 0, 100],
      'a positive Difficult modifier': ['difficult', 5, -100, 0],
      'a Hard modifier below -100': ['hard', -150, -100, 0],
      'a fractional Easy modifier': ['easy', 12.5, 0, 100],
      'a missing Hard modifier': ['hard', NaN, -100, 0],
    };

    for (const [change, [key, value, min, max]] of Object.entries(invalidModifiers)) {
      it(`Should reject ${change} with its range`, function () {
        const rules = srdRules();
        rules.difficulty[key] = value;
        expect(invalidRuleOptions(rules)).to.eql([{ path: `difficulty.${key}`, min, max }]);
      });
    }

    it('Should reject every invalid modifier', function () {
      const rules = srdRules();
      rules.difficulty.easy = 150;
      rules.difficulty.hard = 10;
      expect(invalidRuleOptions(rules).map(({ path }) => path)).to.eql(['difficulty.easy', 'difficulty.hard']);
    });

    it('Should reject unknown critical and fumble rules', function () {
      const rules = srdRules();
      rules.criticalRule = 'triples';
      rules.fumbleRule = '';
      expect(invalidRuleOptions(rules)).to.eql([{ path: 'criticalRule' }, { path: 'fumbleRule' }]);
    });
  });
});
