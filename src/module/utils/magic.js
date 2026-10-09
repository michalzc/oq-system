import _ from 'lodash-es';

/**
 * The Manipulation cost table of the SRD Sorcery chapter: the lowest casting skill value that allows a magnitude, and
 * the magic points it costs on top of the base one.
 * @type {{minSkill: number, magnitude: number, extraCost: number}[]}
 */
export const SORCERY_MANIPULATION = [
  { minSkill: 0, magnitude: 1, extraCost: 0 },
  { minSkill: 1, magnitude: 2, extraCost: 1 },
  { minSkill: 11, magnitude: 3, extraCost: 2 },
  { minSkill: 21, magnitude: 4, extraCost: 3 },
  { minSkill: 31, magnitude: 5, extraCost: 4 },
  { minSkill: 41, magnitude: 6, extraCost: 5 },
  { minSkill: 51, magnitude: 7, extraCost: 6 },
  { minSkill: 61, magnitude: 8, extraCost: 7 },
  { minSkill: 71, magnitude: 9, extraCost: 8 },
  { minSkill: 81, magnitude: 10, extraCost: 9 },
  { minSkill: 91, magnitude: 15, extraCost: 10 },
  { minSkill: 100, magnitude: 20, extraCost: 10 },
];

/**
 * The highest magnitude a sorcerer can manipulate a spell to with the given casting skill value.
 * @param {number} skillValue
 * @returns {number}
 */
export function sorceryMaxMagnitude(skillValue) {
  return _.findLast(SORCERY_MANIPULATION, (row) => (skillValue ?? 0) >= row.minSkill)?.magnitude ?? 1;
}

/**
 * The full magic point cost of casting a spell at the given magnitude. Sorcery follows the Manipulation table, so
 * magnitudes above 10 cost 11 magic points; other spells cost their magnitude.
 * @param {string} spellType One of the `CONFIG.OQ.ItemConfig.spellsTypes` values
 * @param {number} magnitude
 * @returns {number}
 */
export function spellMagicPointCost(spellType, magnitude) {
  if (spellType !== CONFIG.OQ.ItemConfig.spellsTypes.sorcery) return magnitude;
  const row = SORCERY_MANIPULATION.find((row) => row.magnitude >= magnitude) ?? _.last(SORCERY_MANIPULATION);
  return 1 + row.extraCost;
}

/**
 * The highest magnitude, up to the given one, that the magic points pay for.
 * @param {string} spellType One of the `CONFIG.OQ.ItemConfig.spellsTypes` values
 * @param {number} magnitude
 * @param {number} magicPoints
 * @returns {number}
 */
export function maxAffordableMagnitude(spellType, magnitude, magicPoints) {
  if (spellMagicPointCost(spellType, magnitude) <= magicPoints) return magnitude;
  // Below the cost cap a magnitude costs one magic point per point.
  return Math.min(magnitude, magicPoints);
}

/**
 * Magic points spent on a spell casting test, following the SRD: a success and a fumble cost the full cost, a failure
 * and a critical success cost one magic point.
 * @param {string} rollResult One of the `CONFIG.OQ.RollConfig.rollResults` values
 * @param {number} fullCost   The magic point cost of the magnitude the spell is cast at, see `spellMagicPointCost`
 * @returns {number}
 */
export function spellCastingCost(rollResult, fullCost) {
  const rollResults = CONFIG.OQ.RollConfig.rollResults;
  const cost = Math.max(0, fullCost ?? 0);
  switch (rollResult) {
    case rollResults.success:
    case rollResults.fumble:
      return cost;
    case rollResults.criticalSuccess:
    case rollResults.failure:
      return Math.min(1, cost);
    default:
      return 0;
  }
}

/**
 * Additional `system` values for a new spell. A divine spell needs no magic points, unless the creation data says
 * otherwise, and a spell with no magic point cost starts with its full magnitude remaining.
 * @param {object} source The `system` creation data, as given
 * @param {object} system The `system` data of the pending spell
 * @returns {object}
 */
export function newSpellChanges(source, system) {
  const changes = {};
  if (system.type === CONFIG.OQ.ItemConfig.spellsTypes.divine && source.noMagicPoints === undefined) {
    changes.noMagicPoints = true;
  }
  const noMagicPoints = changes.noMagicPoints ?? system.noMagicPoints;
  if (noMagicPoints && source.remainingMagnitude === undefined) changes.remainingMagnitude = system.magnitude;
  return changes;
}

/**
 * Additional `system` changes for a spell update. Changing the type to divine checks No Magic Points. A spell that
 * switches to No Magic Points starts with its full magnitude remaining, and when the magnitude of a spell with no magic
 * point cost changes, an unspent spell stays unspent and a spent one keeps no more than the new magnitude.
 * @param {object} system  The current `system` data of the spell
 * @param {object} changes The `system` changes of the update. The sheet submits every field, changed or not.
 * @returns {object}
 */
export function spellUpdateChanges(system, changes = {}) {
  const updates = {};
  const divine = CONFIG.OQ.ItemConfig.spellsTypes.divine;
  if (changes.type === divine && system.type !== divine) updates.noMagicPoints = true;

  const noMagicPoints = updates.noMagicPoints ?? changes.noMagicPoints ?? system.noMagicPoints;
  if (!noMagicPoints) return updates;

  const magnitude = changes.magnitude ?? system.magnitude;
  if (!system.noMagicPoints) {
    updates.remainingMagnitude = magnitude;
  } else if (magnitude !== system.magnitude) {
    const unspent = system.remainingMagnitude >= system.magnitude;
    const remaining = changes.remainingMagnitude ?? system.remainingMagnitude;
    updates.remainingMagnitude = unspent ? magnitude : Math.min(remaining, magnitude);
  }
  return updates;
}

/**
 * The groups of custom type spells, one per custom type name, sorted by name. A spell with no name gets the generic
 * custom type label.
 * @param {Item[]} spells Custom type spells
 * @returns {{type: string, customTypeName: string, label: string, spells: Item[], spent: boolean}[]}
 */
export function customSpellGroups(spells) {
  const customType = CONFIG.OQ.ItemConfig.spellsTypes.custom;
  const groups = _.groupBy(spells, (spell) => spell.system.customTypeName ?? '');
  return _.sortBy(Object.keys(groups)).map((customTypeName) => ({
    type: customType,
    customTypeName,
    label: customTypeName || `OQ.Labels.SpellTypes.${customType}`,
    spells: groups[customTypeName],
    spent: groups[customTypeName].some((spell) => spell.spent),
  }));
}

/**
 * Whether the spell belongs to the spell group: every spell without a type, the spells of the type otherwise. Custom
 * type spells are also matched by their custom type name, so each custom group is separate.
 * @param {Item} spell
 * @param {string} [spellType]
 * @param {string} [customTypeName]
 * @returns {boolean}
 */
export function isInSpellGroup(spell, spellType, customTypeName) {
  if (!spellType) return true;
  if (spell.system.type !== spellType) return false;
  return (
    spellType !== CONFIG.OQ.ItemConfig.spellsTypes.custom ||
    (spell.system.customTypeName ?? '') === (customTypeName ?? '')
  );
}
