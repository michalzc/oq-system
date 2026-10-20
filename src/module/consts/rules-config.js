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

/** The allowed integer range of each difficulty modifier Rule Option. Their mutual order is not enforced. */
export const DifficultyRanges = Object.freeze({
  easy: Object.freeze({ min: 0, max: 100 }),
  simple: Object.freeze({ min: 0, max: 100 }),
  difficult: Object.freeze({ min: -100, max: 0 }),
  hard: Object.freeze({ min: -100, max: 0 }),
});

/** The rules consts, aggregated into `CONFIG.OQ.RulesConfig`. */
export const RulesConfig = {
  CriticalRules,
  FumbleRules,
  DifficultyRanges,
  srd: SrdRules,
};

/**
 * @param {object} rules Rule Options
 * @returns {boolean} whether every Rule Option equals its OpenQuest SRD value
 */
export function isSrdRules(rules) {
  return _.isEqual(rules, SrdRules);
}

/** The named Rules Presets, compared in order; rules matching none of them are the "Custom" preset. */
export const RulesPresets = Object.freeze({ srd: SrdRules });

/** The key of the Rules Preset for rules matching no named preset. */
export const CustomRulesPreset = 'custom';

/**
 * @param {object} rules Rule Options
 * @returns {string} the key of the Rules Preset whose values all equal `rules`, or `CustomRulesPreset`
 */
export function rulesPresetOf(rules) {
  const match = Object.entries(RulesPresets).find(([, preset]) => _.isEqual(rules, preset));
  return match ? match[0] : CustomRulesPreset;
}

/**
 * @param {object} rules Rule Options
 * @returns {Array<[string, *]>} the dotted path and value of every single Rule Option, e.g. `['difficulty.easy', 50]`
 */
export function ruleOptionEntries(rules) {
  const entries = (object, prefix) =>
    Object.entries(object).flatMap(([key, value]) =>
      _.isPlainObject(value) ? entries(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]],
    );
  return entries(rules, '');
}

/**
 * Reads the Rule Options from the flat data of a form whose inputs are named `<prefix>.<Rule Option path>`. Every value
 * is converted to the type of its SRD value; an empty or non-numeric number becomes `NaN`. Other fields are ignored.
 * @param {object} formData flat form data, keyed by input name
 * @param {string} prefix the input name prefix, e.g. `oq.rules`
 * @returns {object} Rule Options, not yet validated
 */
export function rulesFromFormData(formData, prefix) {
  const toType = (srdValue, value) => {
    if (typeof srdValue === 'boolean') return Boolean(value);
    if (typeof srdValue === 'number') return value === null || value === '' ? NaN : Number(value);
    return String(value ?? '');
  };
  return ruleOptionEntries(SrdRules).reduce(
    (rules, [path, srdValue]) => _.set(rules, path, toType(srdValue, formData[`${prefix}.${path}`])),
    {},
  );
}

/**
 * Checks Rule Options before they are saved. The setting's field would silently clamp an out-of-range modifier, so
 * the rules form rejects such values with this instead.
 * @param {object} rules Rule Options, e.g. from `rulesFromFormData`
 * @returns {Array<{path: string, min?: number, max?: number}>} the invalid Rule Options, with the allowed range of a
 *   difficulty modifier; empty when all are valid
 */
export function invalidRuleOptions(rules) {
  const invalidChoices = [
    ['criticalRule', CriticalRules],
    ['fumbleRule', FumbleRules],
  ]
    .filter(([key, choices]) => !Object.values(choices).includes(rules[key]))
    .map(([path]) => ({ path }));
  const invalidModifiers = Object.entries(DifficultyRanges)
    .filter(([key, { min, max }]) => {
      const value = rules.difficulty?.[key];
      return !Number.isInteger(value) || value < min || value > max;
    })
    .map(([key, { min, max }]) => ({ path: `difficulty.${key}`, min, max }));
  return [...invalidChoices, ...invalidModifiers];
}
