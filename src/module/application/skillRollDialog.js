import { log } from '../utils.js';
import { roll } from '../roll.js';

/**
 * Displays a skill roll dialog.
 *
 * @param {string} speaker - The name of the speaker.
 * @param {object} rollData - The data required for the skill roll.
 * @returns {Promise<void>} - A promise that resolves when the skill roll dialog is closed.
 */
export async function skillRollDialog(speaker, rollData) {
  log('Rolling skill with dialog', speaker, rollData);
  const difficultiesForDialog = Object.fromEntries(
    Object.keys(CONFIG.OQ.DifficultyLevels).map((key) => [key, `OQ.Labels.DifficultyLevels.${key}`]),
  );
  const dialogRenderData = {
    ...rollData,
    difficulties: difficultiesForDialog,
    defaultDifficulty: 'normal',
  };
  const dialogContent = await renderTemplate('systems/oq/templates/applications/skillRollDialog.hbs', dialogRenderData);
  const dialog = new Dialog({
    title: `${game.i18n.localize('OQ.Dialog.SkillRollDialogTitle.Title')} ${rollData.entityName}`,
    content: dialogContent,
    classes: ['oq', 'dialog', 'skill-roll'],
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-two"></i>',
        label: game.i18n.localize('OQ.Dialog.Roll'),
        callback: (self) => makeRoll(rollData, self),
      },
      cancel: {
        icon: '<i class="fas fa-cancel"></i>',
        label: game.i18n.localize('OQ.Dialog.Cancel'),
      },
    },
    default: 'roll',
  });
  dialog.render(true);
}

async function makeRoll(rollData, dialog) {
  const difficultyKey = $(dialog).find('#difficulty').val();
  const othMods = dialog.find('#otherMods').val();

  const difficultyValue = CONFIG.OQ.DifficultyLevels[difficultyKey];
  await roll({
    ...rollData,
    difficulty: { key: difficultyKey, value: difficultyValue },
    modifier: othMods & parseInt(othMods),
  });
}
