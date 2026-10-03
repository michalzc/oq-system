import _ from 'lodash-es';
import { openRollDialog } from './roll-dialog.js';

/**
 * Asks for the difficulty, the other modifiers and the message mode of a test roll.
 * @param {RollData} rollData
 * @returns {Promise<{difficulty: Difficulty|undefined, mod: number|null, messageMode: string}|null>} null if the
 *   dialog was cancelled or closed
 */
export async function promptTestRoll(rollData) {
  const difficultyLevels = CONFIG.OQ.RollConfig.difficultyLevels;
  const difficulties = _.mapValues(
    difficultyLevels,
    (value, key) => `${game.i18n.localize(`OQ.Labels.DifficultyLevels.${key}`)} (${value}%)`,
  );

  const formData = await openRollDialog({
    title: `${game.i18n.localize('OQ.Labels.Roll')}: ${rollData.entityName}`,
    template: 'systems/oq/templates/applications/test-roll-dialog.hbs',
    context: { ...rollData, difficulties, defaultDifficulty: 'normal' },
  });
  if (!formData) return null;

  const { difficulty: difficultyKey, mod, messageMode } = formData;
  return {
    difficulty: difficultyKey && { key: difficultyKey, value: difficultyLevels[difficultyKey] },
    mod,
    messageMode,
  };
}
