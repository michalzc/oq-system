/**
 * @typedef {Object} Difficulty
 * @property {string} key
 * @property {number} value
 */

import { minMaxValue, renderTemplate } from './utils.js';
import { createChatMessage, evaluateRoll } from './chat.js';
import { CriticalRules, FumbleRules } from '../consts/rules-config.js';

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
  const mastered = !!rollData.mastered && isMaster(rollData.value, totalValue, CONFIG.OQ.Rules);
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
 * Determines the result of a roll under the active Rule Options (`CONFIG.OQ.Rules`).
 *
 * @param {object} resultFeatures - The features of the result.
 * @param {boolean} resultFeatures.double - Indicates if the result can be a double.
 * @param {boolean} resultFeatures.possibleFumble - Indicates if the result can be a fumble.
 * @param {number} rollValue - The value against which the roll is compared.
 * @param {object} rollData - The data of the roll.
 * @param {number} rollData.totalValue - The Modified skill.
 * @param {number} rollData.value - The unmodified skill.
 *
 * @returns {string} - The result of the roll. Possible values are:
 *   - "criticalSuccess" if the roll is a critical success.
 *   - "success" if the roll is a success.
 *   - "fumble" if the roll is a fumble.
 *   - "failure" if the roll is a failure.
 */
export function getResult(resultFeatures, rollValue, rollData) {
  const rollResults = CONFIG.OQ.RollConfig.rollResults;
  const rules = CONFIG.OQ.Rules;
  const modifiedSkill = rollData.totalValue;
  const mastered = isMaster(rollData.value, modifiedSkill, rules);

  if (mastered) return rollResults.criticalSuccess;
  else if (resultFeatures.possibleFumble) return rollResults.fumble;
  else if (rollValue <= modifiedSkill)
    return isCritical(resultFeatures, rollValue, modifiedSkill, rules)
      ? rollResults.criticalSuccess
      : rollResults.success;
  else return isFumble(resultFeatures, rules) ? rollResults.fumble : rollResults.failure;
}

/**
 * Whether a skill makes its owner a Master: Mastery is on, the unmodified skill is at least 100% and the Modified skill
 * is still at least 100%.
 * @param {number} value - The unmodified skill.
 * @param {number} modifiedSkill - The Modified skill; the unmodified skill when there are no modifiers.
 * @param {object} rules - The Rule Options, usually `CONFIG.OQ.Rules`.
 * @returns {boolean}
 */
export function isMaster(value, modifiedSkill, rules) {
  return rules.mastery && value >= MAX_VALUE && modifiedSkill >= MAX_VALUE;
}

/**
 * Whether a failed roll is a fumble under the fumble rule. A roll of 100 is handled by `getResult`.
 * @param {RollFeatures} resultFeatures - The features of the roll.
 * @param {object} rules - The Rule Options.
 * @returns {boolean}
 */
function isFumble(resultFeatures, rules) {
  return rules.fumbleRule === FumbleRules.doubles && resultFeatures.double;
}

/**
 * Whether a successful roll is a critical success under the critical rule.
 * @param {RollFeatures} resultFeatures - The features of the roll.
 * @param {number} rollValue - The D100 roll.
 * @param {number} modifiedSkill - The Modified skill.
 * @param {object} rules - The Rule Options.
 * @returns {boolean}
 */
function isCritical(resultFeatures, rollValue, modifiedSkill, rules) {
  if (rules.criticalRule === CriticalRules.tenth) return rollValue <= Math.ceil(modifiedSkill / 10);
  else return resultFeatures.double;
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
