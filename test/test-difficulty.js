import expect from 'expect.js';
import { difficultyContext, toDifficulty } from '../src/module/application/test-roll-dialog.js';
import { SrdRules } from '../src/module/consts/rules-config.js';

const globals = ['CONFIG', 'game'];

/** The requester's difficulty modifiers. */
const requesterDifficulty = { easy: 50, simple: 25, difficult: -25, hard: -50 };

describe('Difficulty levels', function () {
  let savedGlobals;

  before(function () {
    savedGlobals = Object.fromEntries(globals.map((key) => [key, globalThis[key]]));
    globalThis.game = { i18n: { localize: (key) => key.split('.').at(-1) } };
  });

  after(function () {
    for (const key of globals) {
      if (savedGlobals[key] === undefined) delete globalThis[key];
      else globalThis[key] = savedGlobals[key];
    }
  });

  function useDifficulty(difficulty) {
    globalThis.CONFIG = { OQ: { Rules: { ...SrdRules, difficulty } } };
  }

  describe('#toDifficulty()', function () {
    it('Should take the modifier from the difficulty Rule Options', function () {
      useDifficulty(requesterDifficulty);
      expect(toDifficulty('easy')).to.have.property('value', 50);
      expect(toDifficulty('simple')).to.have.property('value', 25);
      expect(toDifficulty('difficult')).to.have.property('value', -25);
      expect(toDifficulty('hard')).to.have.property('value', -50);
    });

    it('Should keep Normal at 0', function () {
      useDifficulty(requesterDifficulty);
      expect(toDifficulty('normal')).to.eql({ key: 'normal', value: 0, label: 'normal (0%)' });
    });

    it('Should label the difficulty like the dialog does, with its signed modifier', function () {
      useDifficulty(requesterDifficulty);
      expect(toDifficulty('easy')).to.eql({ key: 'easy', value: 50, label: 'easy (+50%)' });
      expect(toDifficulty('difficult')).to.eql({ key: 'difficult', value: -25, label: 'difficult (-25%)' });
      for (const key of ['easy', 'simple', 'normal', 'difficult', 'hard']) {
        expect(toDifficulty(key).label).to.be(difficultyContext().difficulties[key]);
      }
    });

    it('Should give no difficulty when none is selected', function () {
      useDifficulty(requesterDifficulty);
      expect(toDifficulty(undefined)).to.be(undefined);
    });
  });

  describe('#difficultyContext()', function () {
    it('Should offer the levels from Easy to Hard with their signed modifiers', function () {
      useDifficulty(requesterDifficulty);
      const { difficulties, defaultDifficulty } = difficultyContext();
      expect(Object.entries(difficulties)).to.eql([
        ['easy', 'easy (+50%)'],
        ['simple', 'simple (+25%)'],
        ['normal', 'normal (0%)'],
        ['difficult', 'difficult (-25%)'],
        ['hard', 'hard (-50%)'],
      ]);
      expect(defaultDifficulty).to.be('normal');
    });

    it('Should label a zero modifier without a sign', function () {
      useDifficulty({ easy: 0, simple: 0, difficult: 0, hard: 0 });
      expect(Object.values(difficultyContext().difficulties)).to.eql([
        'easy (0%)',
        'simple (0%)',
        'normal (0%)',
        'difficult (0%)',
        'hard (0%)',
      ]);
    });

    it('Should keep the order when the modifiers are not ordered', function () {
      useDifficulty({ hard: -10, difficult: -30, simple: 40, easy: 10 });
      expect(Object.keys(difficultyContext().difficulties)).to.eql(['easy', 'simple', 'normal', 'difficult', 'hard']);
    });
  });
});
