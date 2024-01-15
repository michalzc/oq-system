import { log } from './utils.js';

/**
 * @typedef {Object} Difficulty
 * @property {string} key
 * @property {number} value
 */

/**
 * @typedef {Object} RollData
 * @property {boolean} mastered
 * @property {Difficulty} difficulty
 * @property {number} modifier
 * @property {Object} speaker
 * @property {string} rollType
 * @property {string} entityName
 * @property {number} value
 */

/**
 * Perform roll
 * @param {RollData} rollData
 * @returns {Promise<void>}
 */
export async function roll(rollData) {
  log('Making a roll for', rollData);

  const d100 = await new Roll(CONFIG.OQ.BaseRollFormula).roll({ async: true });
  const resultFeatures = getResultFeatures(d100);
  const updatedRollData = {
    ...rollData,
    totalValue: rollData.value + (rollData.difficulty?.value ?? 0) + (rollData?.modifier ?? 0),
    masterNeverThrows: game.settings.get(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingKeys.masterNeverThrows.key),
  };
  const rollResult = getResult(resultFeatures, d100.total, updatedRollData);
  let mastery =
    (updatedRollData.totalValue === updatedRollData.value &&
      updatedRollData.mastered &&
      updatedRollData.masterNeverThrows) ||
    (updatedRollData.totalValue >= 100 && updatedRollData.mastered);
  let renderData = {
    ...updatedRollData,
    rollResult,
    mastery: mastery,
    roll: d100,
  };
  log('Render data', renderData);
  const messageContent = await renderTemplate('systems/oq/templates/chat/parts/skill-roll.hbs', renderData);
  const messageData = {
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    speaker: rollData.speaker,
    rolls: [d100],
    content: messageContent,
  };
  log('Message data', messageData);
  await ChatMessage.create(messageData);
}

function getResult(resultFeatures, rollValue, rollData) {
  const rollResults = CONFIG.OQ.RollResults;
  if (rollData.mastered && rollData.masterNeverThrows)
    return resultFeatures.double ? rollResults.criticalSuccess : rollResults.success;
  else if (rollValue === 100 && !rollData.mastered && !rollData.masterNeverThrows) return rollResults.fumble;
  else if (rollData.totalValue < rollValue) {
    return resultFeatures.double ? rollResults.fumble : rollResults.failure;
  } else if (rollData.totalValue >= rollValue) {
    return resultFeatures.double ? rollResults.criticalSuccess : rollResults.success;
  }
}

function getResultFeatures(roll) {
  const total = roll.total;
  const [left, right] = roll.total.toString();
  const possibleFumble = total === 100;
  const double = possibleFumble || left === right;
  return {
    possibleFumble,
    double,
  };
}
