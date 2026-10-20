import _ from 'lodash-es';
import { openRollDialog } from './roll-dialog.js';

/**
 * Asks for the difficulty, the other modifiers and the message mode of a test roll.
 * @param {RollData} rollData
 * @returns {Promise<{difficulty: Difficulty|undefined, mod: number|null, messageMode: string}|null>} null if the
 *   dialog was cancelled or closed
 */
export async function promptTestRoll(rollData) {
  const formData = await openRollDialog({
    title: `${game.i18n.localize('OQ.Labels.Roll')}: ${rollData.entityName}`,
    template: 'systems/oq/templates/applications/test-roll-dialog.hbs',
    context: { ...rollData, ...difficultyContext() },
  });
  if (!formData) return null;

  const { difficulty, mod, messageMode } = formData;
  return { difficulty: toDifficulty(difficulty), mod, messageMode };
}

/**
 * The difficulty options of a test roll dialog template, labelled with their signed modifiers, e.g. "Easy (+50%)".
 * @returns {{difficulties: Object<string, string>, defaultDifficulty: string}}
 */
export function difficultyContext() {
  const difficulties = _.mapValues(difficultyLevels(), (value, key) => difficultyLabel(key, value));
  return { difficulties, defaultDifficulty: 'normal' };
}

/**
 * @param {string|undefined} difficultyKey The difficulty selected in the dialog
 * @returns {Difficulty|undefined} labelled as in the dialog, for the chat card
 */
export function toDifficulty(difficultyKey) {
  const value = difficultyKey && difficultyLevels()[difficultyKey];
  return difficultyKey && { key: difficultyKey, value, label: difficultyLabel(difficultyKey, value) };
}

/**
 * @param {string} key The difficulty level
 * @param {number} value Its modifier
 * @returns {string} e.g. "Easy (+50%)"
 */
function difficultyLabel(key, value) {
  return `${game.i18n.localize(`OQ.Labels.DifficultyLevels.${key}`)} (${value > 0 ? '+' : ''}${value}%)`;
}

/**
 * The difficulty levels in dialog order, from Easy to Hard, with their modifiers from the difficulty Rule Options.
 * Normal is always 0.
 * @returns {{easy: number, simple: number, normal: number, difficult: number, hard: number}}
 */
function difficultyLevels() {
  const { easy, simple, difficult, hard } = CONFIG.OQ.Rules.difficulty;
  return { easy, simple, normal: 0, difficult, hard };
}
