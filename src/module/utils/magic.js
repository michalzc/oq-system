import _ from 'lodash-es';

/**
 * Magic points spent on a spell casting test, following the SRD: a success and a fumble cost the full magnitude,
 * a failure and a critical success cost one magic point.
 * @param {string} rollResult One of the `CONFIG.OQ.RollConfig.rollResults` values
 * @param {number} magnitude  The magnitude the spell is cast at
 * @returns {number}
 */
export function spellCastingCost(rollResult, magnitude) {
  const rollResults = CONFIG.OQ.RollConfig.rollResults;
  const fullCost = Math.max(0, magnitude ?? 0);
  switch (rollResult) {
    case rollResults.success:
    case rollResults.fumble:
      return fullCost;
    case rollResults.criticalSuccess:
    case rollResults.failure:
      return Math.min(1, fullCost);
    default:
      return 0;
  }
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
