/**
 * Pure effect logic over plain effect data: no Foundry calls, so it is tested in plain Node.
 *
 * An effect is read as its plain fields: `name`, `img`, `disabled`, `description` (the rules text) and `system`
 * (`sourceName`, `changes`). Effect documents and their `toObject()` copies both fit.
 */

import { hpNormalMaximum, mpNormalMaximum } from './resource-points.js';
import { isMaster } from './roll.js';
import { minMaxValue } from './utils.js';

/** The characteristics, in sheet order. Each is a change target of its own. */
export const CHARACTERISTICS = Object.freeze(['str', 'con', 'dex', 'siz', 'int', 'pow', 'cha']);

/**
 * The curated change vocabulary: every target an OpenQuest change may name, with the operations it allows, whether a
 * multiplied value rounds down and whether a change may carry a minimum. Later chunks add targets here; the effect
 * editor offers only these.
 */
export const EFFECT_TARGETS = Object.freeze({
  ap: { label: 'OQ.Effects.Targets.ap', types: ['add', 'multiply', 'override'], roundsDown: true },
  // The SRD states no rounding for movement, so a multiplied rate keeps its fraction.
  mr: { label: 'OQ.Effects.Targets.mr', types: ['add', 'multiply', 'override'], allowsMinimum: true },
  // Diminish: "a characteristic may not go below 1 through use of this spell".
  ...Object.fromEntries(
    CHARACTERISTICS.map((key) => [
      key,
      {
        label: `OQ.Labels.CharacteristicsNames.${key}.label`,
        types: ['add', 'multiply', 'override'],
        roundsDown: true,
        allowsMinimum: true,
      },
    ]),
  ),
  // A damage formula term (1D4, -1), added after the Damage Modifier.
  weaponDamage: { label: 'OQ.Effects.Targets.weaponDamage', types: ['add'], formula: true },
});

/** The targets actor effects may name. */
export const ACTOR_TARGETS = Object.freeze(['ap', 'mr', ...CHARACTERISTICS]);

/**
 * The roles an item-borne effect may have, each with whether it transfers to the item's owner and the targets it may
 * name. "This item" changes only the weapon bearing it.
 */
export const EFFECT_ROLES = Object.freeze({
  thisItem: { label: 'OQ.Effects.Roles.thisItem', transfer: false, targets: Object.freeze(['weaponDamage']) },
});

/**
 * The `transfer` an effect's role requires, which no other setting may change.
 * @param {object} effect plain effect data
 * @returns {boolean|undefined} undefined for an effect without a role
 */
export function roleTransfer(effect) {
  return EFFECT_ROLES[effect.system?.role]?.transfer;
}

/**
 * The targets an effect's editor offers: those of its role, or the actor targets for an actor effect. An item effect
 * without a role (stored before v0.9) is offered none; its changes keep core behaviour.
 * @param {object} effect plain effect data
 * @param {string} [parentDocumentName] `Actor` or `Item`
 * @returns {readonly string[]} keys of `EFFECT_TARGETS`
 */
export function effectTargets(effect, parentDocumentName) {
  const role = EFFECT_ROLES[effect.system?.role];
  if (role) return role.targets;
  return parentDocumentName === 'Actor' ? ACTOR_TARGETS : [];
}

/**
 * Whether a stored change is an OpenQuest change. Such changes name a `target` and are applied only by this module;
 * core key-path application skips them. Changes without a target were made by macros or modules and keep core
 * behaviour.
 * @param {object} change
 * @returns {boolean}
 */
export function isOpenQuestChange(change) {
  return Boolean(change?.target);
}

/**
 * An OpenQuest change whose target and operation the vocabulary knows, so this system can apply and edit it.
 * @param {object} change
 * @param {readonly string[]} [targets] the targets the change's effect may name; any in the vocabulary by default
 */
function isManagedChange(change, targets) {
  if (targets && !targets.includes(change?.target)) return false;
  return EFFECT_TARGETS[change?.target]?.types.includes(change.type) ?? false;
}

function isActive(effect) {
  // Effect documents also report suppression through `active`; plain data has only `disabled`.
  return effect.active ?? !effect.disabled;
}

/** Drops floating point noise such as 100 × 0.29 = 28.999999999999996. */
function withoutNoise(value) {
  return Math.round(value * 1e9) / 1e9;
}

function displayValue(value) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

/**
 * What the effects list and the effect editor show for one effect.
 * @param {object} effect plain effect data
 * @param {readonly string[]} [targets] the targets the effect may name, from `effectTargets`; actor targets by default
 * @returns {{name: string, img: string, sourceName: string, rulesText: string, state: 'enabled'|'disabled',
 *   enabled: boolean, changes: Array<{target: string, type: string, value: number}>,
 *   otherChanges: Array<{key: string, type: string, value: string}>}}
 */
export function effectListEntry(effect, targets = ACTOR_TARGETS) {
  const changes = effect.system?.changes ?? [];
  const managed = (change) => isManagedChange(change, targets);
  const enabled = !effect.disabled;
  return {
    name: effect.name,
    img: effect.img,
    sourceName: effect.system?.sourceName ?? '',
    rulesText: effect.description ?? '',
    state: enabled ? 'enabled' : 'disabled',
    enabled,
    changes: changes
      .filter(managed)
      .map((change) => withMinimum(change, { target: change.target, type: change.type, value: change.value })),
    // Made by a macro or module (keeping core behaviour), or naming a target this version does not know.
    otherChanges: changes
      .filter((change) => !managed(change))
      .map(({ key, target, type, value }) => ({ key: key || target, type, value: displayValue(value) })),
  };
}

/**
 * The changes an effect editor saves: the stored changes it does not manage, exactly as stored, followed by the edited
 * OpenQuest changes.
 * @param {object[]} storedChanges the effect's stored changes
 * @param {Array<{target: string, type: string, value: number|string|null}>} edited the OpenQuest changes from the
 *   editor; a damage term is saved as typed, trimmed
 * @param {readonly string[]} [targets] the targets the effect may name, from `effectTargets`; actor targets by default
 * @returns {object[]}
 */
export function effectChangesToSave(storedChanges, edited, targets = ACTOR_TARGETS) {
  return [
    ...storedChanges.filter((change) => !isManagedChange(change, targets)),
    ...edited.map(({ target, type, value, minimum }) => ({
      key: '',
      ...withMinimum(
        { target, minimum },
        { target, type, value: EFFECT_TARGETS[target].formula ? String(value ?? '').trim() : Number(value) || 0 },
      ),
      phase: 'initial',
    })),
  ];
}

/**
 * The damage terms among the edited changes that are neither blank nor readable by `damageTerm`, which the editor
 * refuses to save.
 * @param {Array<{target: string, value: *}>} edited
 * @returns {string[]} as typed
 */
export function unreadableDamageTerms(edited) {
  return edited
    .filter(({ target }) => EFFECT_TARGETS[target]?.formula)
    .map(({ value }) => String(value ?? '').trim())
    .filter((value) => value && !damageTerm(value));
}

/** A change that leaves its target as it is, such as a row just added in the editor. */
function changesNothing(type, value) {
  return (type === 'add' && value === 0) || (type === 'multiply' && value === 1);
}

const DAMAGE_TERM = /^[+-]?(\d*D\d+|\d+)([+-](\d*D\d+|\d+))*$/;

/**
 * A damage formula term as it is added to a damage formula: signed, without spaces, dice in capitals (`+1D4`, `-1`,
 * `+2D6+1`). Undefined for anything else, such as a blank value or a formula with references.
 * @param {*} value
 * @returns {string|undefined}
 */
export function damageTerm(value) {
  const term = String(value ?? '')
    .replace(/\s+/g, '')
    .toUpperCase();
  if (!DAMAGE_TERM.test(term)) return undefined;
  return /^[+-]/.test(term) ? term : `+${term}`;
}

/** What a change applies: a number, or a damage term for formula targets. Undefined if it changes nothing. */
function changeValue(change) {
  if (EFFECT_TARGETS[change.target].formula) return damageTerm(change.value);
  const value = Number(change.value);
  return Number.isFinite(value) && !changesNothing(change.type, value) ? value : undefined;
}

/** The given fields of a change, plus the minimum it sets, if any. */
function withMinimum(change, fields) {
  const minimum = changeMinimum(change);
  return minimum === undefined ? fields : { ...fields, minimum };
}

/** The minimum a change sets, if its target allows one. */
function changeMinimum(change) {
  const minimum = change.minimum === null || change.minimum === '' ? NaN : Number(change.minimum);
  return EFFECT_TARGETS[change.target].allowsMinimum && Number.isFinite(minimum) ? minimum : undefined;
}

/**
 * The OpenQuest changes of the active effects, each with the identity, name, source name and rules text of its
 * effect. Changes that change nothing are left out.
 * @param {Iterable<object>} effects plain effect data or effect documents
 * @param {readonly string[]} [targets] only changes naming these targets, such as `ACTOR_TARGETS`; any by default
 * @returns {Array<{effectId: string, name: string, sourceName: string, rulesText: string, target: string,
 *   type: string, value: number, minimum?: number}>} `minimum` only when the change sets one its target allows
 */
export function activeEffectChanges(effects, targets) {
  const changes = [];
  for (const effect of effects) {
    if (!isActive(effect)) continue;
    for (const change of effect.system?.changes ?? []) {
      if (!isManagedChange(change, targets)) continue;
      const value = changeValue(change);
      if (value === undefined) continue;
      changes.push(
        withMinimum(change, {
          effectId: effect.id ?? effect._id,
          name: effect.name,
          sourceName: effect.system?.sourceName ?? '',
          rulesText: effect.description ?? '',
          target: change.target,
          type: change.type,
          value,
        }),
      );
    }
  }
  return changes;
}

/**
 * The effective value of one attribute and the effects that contributed to it. Multipliers apply to the unmodified
 * value (rounded down where the target rounds), then additions, then an override replaces the result; of several
 * overrides the highest wins. Last, the highest minimum any contributing change sets is a floor the effects cannot
 * push the value below; it never raises a value that is already lower without effects (Slow: "may not go below one
 * metre through use of this spell").
 * `needsReview` marks results a human should adjudicate: multiplied and added amounts together, or several overrides.
 * @param {string} target a key of `EFFECT_TARGETS`
 * @param {number} unmodified the value without effects
 * @param {object[]} changes from `activeEffectChanges`
 * @returns {{value: number, unmodified: number, needsReview: boolean, minimum?: number, contributions:
 *   Array<{effectId: string, name: string, sourceName: string, type: string, value: number, minimum?: number}>}}
 *   contributions in the order they are applied; `minimum` only when a change sets one
 */
export function attributeContribution(target, unmodified, changes) {
  const ofType = (type) =>
    changes
      .filter((change) => change.target === target && change.type === type)
      .map((change) => {
        const { effectId, name, sourceName, value } = change;
        return withMinimum(change, { effectId, name, sourceName, type, value });
      });
  const multipliers = ofType('multiply');
  const additions = ofType('add');
  const overrides = ofType('override');
  // In the order they are applied.
  const contributions = [...multipliers, ...additions, ...overrides];
  const sum = (amounts) => amounts.reduce((total, { value }) => total + value, 0);

  const factor = multipliers.reduce((product, { value }) => product * value, 1);
  const multiplied = withoutNoise(unmodified * factor);
  const calculated = withoutNoise(
    (EFFECT_TARGETS[target].roundsDown ? Math.floor(multiplied) : multiplied) + sum(additions),
  );
  // Several overrides are a conflict for a human to adjudicate; the highest is used so the result is deterministic.
  const replaced = overrides.length ? Math.max(...overrides.map(({ value }) => value)) : calculated;
  const minimums = contributions.filter(({ minimum }) => minimum !== undefined).map(({ minimum }) => minimum);
  const minimum = minimums.length ? Math.max(...minimums) : undefined;
  return {
    value: minimum === undefined ? replaced : Math.max(replaced, Math.min(minimum, unmodified)),
    unmodified,
    needsReview: (multipliers.length > 0 && additions.length > 0) || overrides.length > 1,
    ...(minimum === undefined ? {} : { minimum }),
    contributions,
  };
}

/**
 * The effective characteristics: each unmodified characteristic (base plus native modifier) with the effects that
 * change it, as `attributeContribution` combines them.
 * @param {Object<string, number>} unmodified unmodified values by characteristic key
 * @param {object[]} changes from `activeEffectChanges`
 * @returns {Object<string, ReturnType<typeof attributeContribution>>} by characteristic key
 */
export function effectiveCharacteristics(unmodified, changes) {
  return Object.fromEntries(
    Object.entries(unmodified).map(([key, value]) => [key, attributeContribution(key, value, changes)]),
  );
}

/**
 * The HP and MP normal maximums. HP follows the effective SIZ and CON. MP follows unmodified POW, so Enhance and
 * Diminish POW never change it, as the SRD says of both spells.
 * @param {Object<string, {value: number, unmodified: number}>} characteristics from `effectiveCharacteristics`
 * @param {{hp: number, mp: number}} mods the native HP and MP modifiers
 * @returns {{hp: number, mp: number}}
 */
export function normalMaximums(characteristics, mods) {
  const { siz, con, pow } = characteristics;
  return {
    hp: hpNormalMaximum(siz.value, con.value, mods.hp),
    mp: mpNormalMaximum(pow.unmodified, mods.mp),
  };
}

/**
 * A skill's effective and learned values. The effective value, from effective characteristics, is the one tested.
 * The learned value, from unmodified characteristics, is what training gave: Master eligibility reads it, so a skill
 * pushed to 100% only by an effect does not make its owner a Master.
 * @param {{base: number, learnedBase: number, advancement: number}} skill the skill formula's value with effective and
 *   with unmodified characteristics, and the skill's advancement
 * @param {object} rules the Rule Options, usually `CONFIG.OQ.Rules`
 * @returns {{value: number, baseValue: number, learnedValue: number, learnedBaseValue: number, mastered: boolean,
 *   changedByEffects: boolean}} values within the range the rules allow
 */
export function skillValues({ base, learnedBase, advancement }, rules) {
  const value = minMaxValue(base + advancement, rules);
  const learnedValue = minMaxValue(learnedBase + advancement, rules);
  return {
    value,
    baseValue: base,
    learnedValue,
    learnedBaseValue: learnedBase,
    mastered: isMaster(learnedValue, value, rules),
    changedByEffects: base !== learnedBase,
  };
}

const CHARACTERISTIC_REFERENCE = new RegExp(`@\\{?(${CHARACTERISTICS.join('|')})\\b`, 'g');

/**
 * The characteristics a formula references directly, as `@int` or `@{int}`, each once, in the order they first appear.
 * No recursion through skill references, no inference from names, no algebra: `@int - @int + 50` references INT.
 * @param {string} [formula]
 * @returns {string[]} characteristic keys
 */
export function referencedCharacteristics(formula) {
  return [...new Set([...(formula ?? '').matchAll(CHARACTERISTIC_REFERENCE)].map((match) => match[1]))];
}

/**
 * One contribution's operation and amount as the contributions tooltip shows it.
 * @param {{type: string, value: number}} contribution
 * @returns {string}
 */
export function formatContribution({ type, value }) {
  switch (type) {
    case 'multiply':
      return `×${value}`;
    case 'override':
      return `= ${value}`;
    default:
      return value < 0 ? `−${-value}` : `+${value}`;
  }
}

/**
 * A weapon's damage formula with the damage terms of its own "this item" definitions after the Damage Modifier.
 * @param {{formula: string, dm: string}} weapon the weapon's damage formula and the Damage Modifier it adds, blank when
 *   it adds none
 * @param {Iterable<object>} itemEffects the weapon's own effects, plain data or documents
 * @returns {{formula: string, unmodified: string, contributions: Array<{effectId: string, name: string,
 *   sourceName: string, term: string}>}} `unmodified` without the terms of effects
 */
export function weaponDamage({ formula, dm }, itemEffects) {
  const local = activeEffectChanges(
    [...itemEffects].filter((effect) => effect.system?.role === 'thisItem'),
    EFFECT_ROLES.thisItem.targets,
  );
  const contributions = local
    .filter((change) => change.target === 'weaponDamage')
    .map(({ effectId, name, sourceName, value }) => ({ effectId, name, sourceName, term: value }));
  const unmodified = [formula, dm].filter(Boolean).join(' ');
  return {
    formula: [unmodified, ...contributions.map(({ term }) => term)].filter(Boolean).join(' '),
    unmodified,
    contributions,
  };
}
