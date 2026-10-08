import { openRollDialog } from './roll-dialog.js';
import { difficultyContext, toDifficulty } from './test-roll-dialog.js';

/**
 * @typedef {object} SpellCastData
 * @property {string} entityName
 * @property {string|undefined} skillName
 * @property {number|undefined} value  The casting skill value
 * @property {boolean} rollable       Whether the casting needs a skill test
 * @property {boolean} variant        Whether the caster chooses the magnitude
 * @property {number} maxMagnitude    The highest magnitude the spell can be cast at
 */

/**
 * Asks for the magnitude of a spell and, for spells that need a casting test, the difficulty and the other
 * modifiers. Spells that need no test only get a confirmation.
 * @param {SpellCastData} castData
 * @returns {Promise<{magnitude: number, difficulty: Difficulty|undefined, mod: number|null, messageMode: string}|null>}
 *   null if the dialog was cancelled or closed, or the chosen magnitude is out of range
 */
export async function promptSpellCast(castData) {
  const { rollable, variant, maxMagnitude } = castData;
  const formData = await openRollDialog({
    title: `${game.i18n.localize('OQ.Dialog.Cast')}: ${castData.entityName}`,
    template: 'systems/oq/templates/applications/spell-cast-dialog.hbs',
    context: { ...castData, ...(rollable ? difficultyContext() : {}) },
    button: rollable ? {} : { label: 'OQ.Dialog.Cast', icon: 'fas fa-hand-sparkles' },
  });
  if (!formData) return null;

  const { difficulty, mod, messageMode } = formData;
  const magnitude = variant ? formData.magnitude : maxMagnitude;
  if (!Number.isInteger(magnitude) || magnitude < 1 || magnitude > maxMagnitude) {
    ui.notifications.warn(game.i18n.format('OQ.Warnings.InvalidMagnitude', { max: maxMagnitude }));
    return null;
  }
  return { magnitude, difficulty: toDifficulty(difficulty), mod, messageMode };
}
