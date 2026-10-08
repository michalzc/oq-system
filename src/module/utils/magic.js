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
