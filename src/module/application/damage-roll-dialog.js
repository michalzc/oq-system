import { openRollDialog } from './roll-dialog.js';

/**
 * Asks for the formula and the message mode of a damage roll.
 * @param {DamageRollData} rollData
 * @returns {Promise<{customFormula: string, messageMode: string}|null>} null if the dialog was cancelled or closed
 */
export async function promptDamageRoll(rollData) {
  const formula = rollData.includeDM
    ? `${rollData.damageFormula} ${rollData.actorRollData.dm}`
    : rollData.damageFormula;

  const formData = await openRollDialog({
    title: `${game.i18n.localize('OQ.Labels.DamageRoll')}: ${rollData.entityName}`,
    template: 'systems/oq/templates/applications/damage-roll-dialog.hbs',
    context: { ...rollData, customFormula: new Roll(formula).formula },
  });
  if (!formData) return null;

  const { customFormula, messageMode } = formData;
  return { customFormula, messageMode };
}
