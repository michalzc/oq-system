import { log } from './utils.js';

/**
 * @typedef {Object} Difficulty
 * @property {string} key
 * @property {number} value
 */

/**
 * @typedef {Object} RollData
 * @property {string|undefined} img
 * @property {boolean} mastered
 * @property {Difficulty|undefined} difficulty
 * @property {number|undefined} modifier
 * @property {Object} speaker
 * @property {string} rollType
 * @property {string} entityName
 * @property {number} value
 */

/**
 * @typedef {Object} DamageRollData
 * @property {string|undefined} img
 * @property {Object} speaker
 * @property {Object|undefined} actorRollData
 * @property {string|undefined} damageFormula
 * @property {string} entityName
 * @property {boolean} includeDM
 * @property {Object|undefined} customFormula
 */

/**
 *
 * Perform roll
 * @param {RollData} rollData
 * @returns {Promise<void>}
 */
export async function roll(rollData) {
  log('Making a roll for', rollData);

  const d100 = await new Roll(CONFIG.OQ.RollConfig.baseRollFormula).roll({ async: true });
  const resultFeatures = getResultFeatures(d100);
  const updatedRollData = {
    ...rollData,
    totalValue: rollData.value + (rollData.difficulty?.value ?? 0) + (rollData?.modifier ?? 0),
    masterNeverThrows: game.settings.get(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingKeys.masterNeverThrows.key),
  };
  const rollResult = getResult(resultFeatures, d100.total, updatedRollData);
  const mastery =
    (updatedRollData.totalValue === updatedRollData.value &&
      updatedRollData.mastered &&
      updatedRollData.masterNeverThrows) ||
    (updatedRollData.totalValue >= 100 && updatedRollData.mastered);
  const renderRoll = await d100.render();
  const renderData = {
    ...updatedRollData,
    rollResult,
    mastery: mastery,
    roll: d100,
    renderRoll,
  };
  const messageContent = await renderTemplate('systems/oq/templates/chat/parts/skill-roll.hbs', renderData);
  const messageData = {
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    speaker: rollData.speaker,
    rolls: [d100],
    content: messageContent,
  };
  await ChatMessage.create(messageData);
}

/**
 * Determines the result of a roll based on various input parameters.
 *
 * @param {object} resultFeatures - The features of the result.
 * @param {boolean} resultFeatures.double - Indicates if the result can be a double.
 * @param {boolean} resultFeatures.possibleFumble - Indicates if the result can be a fumble.
 * @param {number} rollValue - The value against which the roll is compared.
 * @param {object} rollData - The data of the roll.
 * @param {boolean} rollData.mastered - Indicates if the roll is mastered.
 * @param {boolean} rollData.masterNeverThrows - Indicates if master never throws.
 * @param {number} rollData.totalValue - The total value of the roll.
 *
 * @returns {string} - The result of the roll. Possible values are:
 *   - "criticalSuccess" if the roll is a critical success.
 *   - "success" if the roll is a success.
 *   - "fumble" if the roll is a fumble.
 *   - "failure" if the roll is a failure.
 */
export function getResult(resultFeatures, rollValue, rollData) {
  const rollResults = CONFIG.OQ.RollConfig.rollResults;
  if (rollData.mastered && rollData.masterNeverThrows)
    return resultFeatures.double ? rollResults.criticalSuccess : rollResults.success;
  else if (rollData.totalValue < rollValue && rollData.mastered) return rollResults.failure;
  else if (!rollData.mastered && resultFeatures.possibleFumble) return rollResults.fumble;
  else if (rollData.totalValue < rollValue) {
    return resultFeatures.double ? rollResults.fumble : rollResults.failure;
  } else {
    // if (rollData.totalValue >= rollValue)
    return resultFeatures.double ? rollResults.criticalSuccess : rollResults.success;
  }
}

/**
 * Determines the possible features of a given roll result.
 *
 * @param {object} roll - The roll object representing the result.
 * @returns {object} - An object containing the possible features of the roll result.
 * @property {boolean} possibleFumble - Indicates whether the roll result is a possible fumble (total equals 100).
 * @property {boolean} double - Indicates whether the roll result is a double (left digit equals right digit).
 */
export function getResultFeatures(roll) {
  const [left, right] = roll.total.toString();
  const possibleFumble = roll.total === 100;
  const double = possibleFumble || left === right;
  return {
    possibleFumble,
    double,
  };
}

/**
 *  @param {DamageRollData} rollData
 * @return {Promise<void>}
 */
export async function damageRoll(rollData) {
  if (rollData.damageFormula) {
    const damageFormula = rollData.customFormula
      ? rollData.customFormula
      : rollData.includeDM
        ? `${rollData.damageFormula} ${rollData.actorRollData.dm}`
        : rollData.damageFormula;
    const roll = await new Roll(damageFormula, rollData.actorRollData).roll();
    const renderedRoll = await roll.render();
    const content = await renderTemplate('systems/oq/templates/chat/parts/damage-roll.hbs', {
      ...rollData,
      roll,
      dm: rollData.actorRollData.dm,
      renderedRoll,
    });

    const messageData = {
      speaker: rollData.speaker,
      content: content,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: [roll],
    };
    await ChatMessage.create(messageData);
  }
}
