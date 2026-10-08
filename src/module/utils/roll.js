/**
 * @typedef {Object} Difficulty
 * @property {string} key
 * @property {number} value
 */

import { minMaxValue, renderTemplate } from './utils.js';
import { createChatMessage, evaluateRoll } from './chat.js';

/**
 * @typedef {Object} RollData
 * @property {'skill'|'weapon'} rollType
 * @property {string|undefined} skillName
 * @property {string|undefined} img
 * @property {boolean} mastered
 * @property {Difficulty|undefined} difficulty
 * @property {number|undefined} mod
 * @property {Object} speaker
 * @property {string} rollType
 * @property {string} entityName
 * @property {number} value
 * @property {string|undefined} messageMode Defaults to the mode selected in the chat log.
 */

const MAX_VALUE = 100;

const TestRollTemplates = {
  skill: 'systems/oq/templates/chat/parts/skill-ability-roll.hbs',
  specialAbility: 'systems/oq/templates/chat/parts/skill-ability-roll.hbs',
  weapon: 'systems/oq/templates/chat/parts/weapon-roll.hbs',
  spell: 'systems/oq/templates/chat/parts/spell-cast.hbs',
};

/**
 * @typedef {Object} TestRollResult
 * @property {Roll} roll
 * @property {string} rollResult One of the `CONFIG.OQ.RollConfig.rollResults` values
 * @property {number} totalValue
 * @property {boolean} mastered
 */

/**
 * Performs test roll
 * @param {RollData} rollData
 * @returns {Promise<void>}
 */
export async function testRoll(rollData) {
  await postTestRoll(rollData, await evaluateTestRoll(rollData));
}

/**
 * Rolls the test dice and works out the result, without posting anything.
 * @param {RollData} rollData
 * @returns {Promise<TestRollResult>}
 */
export async function evaluateTestRoll(rollData) {
  const roll = await evaluateRoll(new Roll(CONFIG.OQ.RollConfig.baseRollFormula), rollData.messageMode);
  const resultFeatures = getResultFeatures(roll);
  const totalValue = minMaxValue((rollData.value ?? 0) + (rollData.difficulty?.value ?? 0) + (rollData?.mod ?? 0));

  const rollResult = getResult(resultFeatures, roll.total, { value: rollData.value, totalValue });
  const mastered = rollData.value >= MAX_VALUE && totalValue >= MAX_VALUE && rollData.mastered;
  return { roll, rollResult, totalValue, mastered };
}

/**
 * Posts the chat message of an evaluated test roll.
 * @param {RollData} rollData
 * @param {TestRollResult} testRollResult
 * @param {object} [extraContext] Additional data for the chat template
 * @returns {Promise<void>}
 */
export async function postTestRoll(rollData, testRollResult, extraContext = {}) {
  const { roll, rollResult } = testRollResult;
  const rollTypeLabel = `TYPES.Item.${rollData.rollType}`;
  const rollResults = CONFIG.OQ.RollConfig.rollResults;
  const showDamageButton =
    rollData.hasDamage && [rollResults.success, rollResults.criticalSuccess].includes(rollResult);
  const renderData = {
    ...rollData,
    ...testRollResult,
    ...extraContext,
    rollTypeLabel,
    showDamageButton,
  };

  const template = TestRollTemplates[rollData.rollType];
  const messageContent = await renderTemplate(template, renderData);
  const messageFlags = CONFIG.OQ.ChatConfig.MessageFlags;
  const flags = showDamageButton ? { [messageFlags.scope]: { [messageFlags.key]: messageFlags.hasRollDamage } } : {};
  const messageData = {
    speaker: rollData.speaker,
    rolls: [roll],
    content: messageContent,
    flags: flags,
  };
  await createChatMessage(messageData, rollData.messageMode);
}

/**
 * Determines the result of a roll based on various input parameters.
 *
 * @param {object} resultFeatures - The features of the result.
 * @param {boolean} resultFeatures.double - Indicates if the result can be a double.
 * @param {boolean} resultFeatures.possibleFumble - Indicates if the result can be a fumble.
 * @param {number} rollValue - The value against which the roll is compared.
 * @param {object} rollData - The data of the roll.
 * @param {number} rollData.totalValue - The total value of the roll.
 * @param {number} rollData.value
 *
 * @returns {string} - The result of the roll. Possible values are:
 *   - "criticalSuccess" if the roll is a critical success.
 *   - "success" if the roll is a success.
 *   - "fumble" if the roll is a fumble.
 *   - "failure" if the roll is a failure.
 */
export function getResult(resultFeatures, rollValue, rollData) {
  const rollResults = CONFIG.OQ.RollConfig.rollResults;
  const mastered = rollData.value >= 100 && rollData.totalValue >= 100;

  if (mastered) return rollResults.criticalSuccess;
  else if (resultFeatures.possibleFumble) return rollResults.fumble;
  else if (rollValue <= rollData.totalValue)
    return resultFeatures.double ? rollResults.criticalSuccess : rollResults.success;
  else return resultFeatures.double ? rollResults.fumble : rollResults.failure;
}

/**
 * @typedef RollFeatures
 * @property {boolean} double
 * @property {boolean} possibleFumble
 */

/**
 * Determines the possible features of a given roll result.
 *
 * @param {object} roll - The roll object representing the result.
 * @param {number} roll.total - Total roll result.
 * @returns {RollFeatures} - An object containing the possible features of the roll result.
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
 * @typedef {Object} DamageRollData
 * @property {string|undefined} img
 * @property {Object} speaker
 * @property {Object|undefined} actorRollData
 * @property {string|undefined} damageFormula
 * @property {string|undefined} finalDamageFormula
 * @property {string} entityName
 * @property {boolean} includeDM
 * @property {Object|undefined} customFormula
 * @property {string|undefined} messageMode Defaults to the mode selected in the chat log.
 */

/**
 *  @param {DamageRollData} rollData
 * @return {Promise<void>}
 */
export async function damageRoll(rollData) {
  const damageFormula = rollData.customFormula ? rollData.customFormula : rollData.finalDamageFormula;
  const roll = await evaluateRoll(new Roll(damageFormula, rollData.actorRollData), rollData.messageMode);
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
    rolls: [roll],
    flags: {
      [CONFIG.OQ.ChatConfig.MessageFlags.scope]: {
        [CONFIG.OQ.ChatConfig.MessageFlags.key]: CONFIG.OQ.ChatConfig.MessageFlags.updateFromChat,
      },
    },
  };
  await createChatMessage(messageData, rollData.messageMode);
}
