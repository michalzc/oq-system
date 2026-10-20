import _ from 'lodash-es';

/** Values of the critical rule Rule Option. */
export const CriticalRules = Object.freeze({
  /** SRD: a successful roll of doubles is a critical success. */
  doubles: 'doubles',
  /** A successful roll of at most ceil(Modified skill / 10) is a critical success. */
  tenth: 'tenth',
});

/** Values of the fumble rule Rule Option. */
export const FumbleRules = Object.freeze({
  /** SRD: a failed roll of doubles, or a roll of 100, is a fumble. */
  doubles: 'doubles',
  /** Only a roll of 100 is a fumble. */
  hundred: 'hundred',
});

/**
 * The OpenQuest SRD Rule Options: the defaults of the rules setting and the "OpenQuest SRD" Rules Preset. Rule code
 * reads the active Rule Options from `CONFIG.OQ.Rules`, never from here.
 */
export const SrdRules = Object.freeze({
  skillCap: true,
  criticalRule: CriticalRules.doubles,
  fumbleRule: FumbleRules.doubles,
  mastery: true,
  difficulty: Object.freeze({ easy: 50, simple: 20, difficult: -20, hard: -50 }),
});

/** The rules consts, aggregated into `CONFIG.OQ.RulesConfig`. */
export const RulesConfig = {
  CriticalRules,
  FumbleRules,
  srd: SrdRules,
};

/**
 * @param {object} rules Rule Options
 * @returns {boolean} whether every Rule Option equals its OpenQuest SRD value
 */
export function isSrdRules(rules) {
  return _.isEqual(rules, SrdRules);
}
