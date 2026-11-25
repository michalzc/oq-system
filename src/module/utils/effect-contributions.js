/**
 * Pure effect logic over plain effect data: no Foundry calls, so it is tested in plain Node.
 *
 * An effect is read as its plain fields: `name`, `img`, `disabled`, `description` (the rules text) and `system`
 * (`sourceName`, `changes`). Effect documents and their `toObject()` copies both fit.
 */

/**
 * The curated change vocabulary: every target an OpenQuest change may name, with the operations it allows. Later
 * chunks add targets here; the effect editor offers only these.
 */
export const EFFECT_TARGETS = Object.freeze({
  ap: { label: 'OQ.Effects.Targets.ap', types: ['add', 'multiply', 'override'] },
});

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

/** An OpenQuest change whose target and operation the vocabulary knows, so this system can apply and edit it. */
function isManagedChange(change) {
  return EFFECT_TARGETS[change?.target]?.types.includes(change.type) ?? false;
}

function isActive(effect) {
  // Effect documents also report suppression through `active`; plain data has only `disabled`.
  return effect.active ?? !effect.disabled;
}

/** Rounds down, ignoring floating point noise such as 100 × 0.29 = 28.999999999999996. */
function roundDown(value) {
  return Math.floor(Math.round(value * 1e9) / 1e9);
}

function displayValue(value) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

/**
 * What the effects list and the effect editor show for one effect.
 * @param {object} effect plain effect data
 * @returns {{name: string, img: string, sourceName: string, rulesText: string, state: 'enabled'|'disabled',
 *   enabled: boolean, changes: Array<{target: string, type: string, value: number}>,
 *   otherChanges: Array<{key: string, type: string, value: string}>}}
 */
export function effectListEntry(effect) {
  const changes = effect.system?.changes ?? [];
  const enabled = !effect.disabled;
  return {
    name: effect.name,
    img: effect.img,
    sourceName: effect.system?.sourceName ?? '',
    rulesText: effect.description ?? '',
    state: enabled ? 'enabled' : 'disabled',
    enabled,
    changes: changes.filter(isManagedChange).map(({ target, type, value }) => ({ target, type, value })),
    // Made by a macro or module (keeping core behaviour), or naming a target this version does not know.
    otherChanges: changes
      .filter((change) => !isManagedChange(change))
      .map(({ key, target, type, value }) => ({ key: key || target, type, value: displayValue(value) })),
  };
}

/**
 * The changes an effect editor saves: the stored changes it does not manage, exactly as stored, followed by the edited
 * OpenQuest changes.
 * @param {object[]} storedChanges the effect's stored changes
 * @param {Array<{target: string, type: string, value: number|null}>} edited the OpenQuest changes from the editor
 * @returns {object[]}
 */
export function effectChangesToSave(storedChanges, edited) {
  return [
    ...storedChanges.filter((change) => !isManagedChange(change)),
    ...edited.map(({ target, type, value }) => ({
      key: '',
      target,
      type,
      value: Number(value) || 0,
      phase: 'initial',
    })),
  ];
}

/** A change that leaves its target as it is, such as a row just added in the editor. */
function changesNothing(type, value) {
  return (type === 'add' && value === 0) || (type === 'multiply' && value === 1);
}

/**
 * The OpenQuest changes of the active effects, each with the identity, name, source name and rules text of its
 * effect. Changes that change nothing are left out.
 * @param {Iterable<object>} effects plain effect data or effect documents
 * @returns {Array<{effectId: string, name: string, sourceName: string, rulesText: string, target: string,
 *   type: string, value: number}>}
 */
export function activeEffectChanges(effects) {
  const changes = [];
  for (const effect of effects) {
    if (!isActive(effect)) continue;
    for (const change of effect.system?.changes ?? []) {
      const value = Number(change.value);
      if (!isManagedChange(change) || !Number.isFinite(value) || changesNothing(change.type, value)) continue;
      changes.push({
        effectId: effect.id ?? effect._id,
        name: effect.name,
        sourceName: effect.system?.sourceName ?? '',
        rulesText: effect.description ?? '',
        target: change.target,
        type: change.type,
        value,
      });
    }
  }
  return changes;
}

/**
 * The effective value of one attribute and the effects that contributed to it. Multipliers apply to the unmodified
 * value (rounded down), then additions, then an override replaces the result; of several overrides the highest wins.
 * `needsReview` marks results a human should adjudicate: multiplied and added amounts together, or several overrides.
 * @param {string} target a key of `EFFECT_TARGETS`
 * @param {number} unmodified the value without effects
 * @param {object[]} changes from `activeEffectChanges`
 * @returns {{value: number, unmodified: number, needsReview: boolean, contributions: Array<{effectId: string,
 *   name: string, sourceName: string, type: string, value: number}>}} contributions in the order they are applied
 */
export function attributeContribution(target, unmodified, changes) {
  const ofType = (type) =>
    changes
      .filter((change) => change.target === target && change.type === type)
      .map(({ effectId, name, sourceName, value }) => ({ effectId, name, sourceName, type, value }));
  const multipliers = ofType('multiply');
  const additions = ofType('add');
  const overrides = ofType('override');
  const sum = (contributions) => contributions.reduce((total, { value }) => total + value, 0);

  const factor = multipliers.reduce((product, { value }) => product * value, 1);
  const calculated = roundDown(unmodified * factor) + sum(additions);
  // Several overrides are a conflict for a human to adjudicate; the highest is used so the result is deterministic.
  const value = overrides.length ? Math.max(...overrides.map(({ value }) => value)) : calculated;
  return {
    value,
    unmodified,
    needsReview: (multipliers.length > 0 && additions.length > 0) || overrides.length > 1,
    // In the order they are applied.
    contributions: [...multipliers, ...additions, ...overrides],
  };
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
