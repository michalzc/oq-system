import { renderTemplate } from './utils.js';

/**
 * The message mode selected in the chat log: one of the `CONFIG.ChatMessage.modes` keys (public, private to GMs, blind,
 * self or in character).
 * @returns {string}
 */
export const currentMessageMode = () => game.settings.get('core', 'messageMode');

/**
 * Evaluates a roll that will be posted with `createChatMessage`. Like core's `/broll`, a blind roll never asks the
 * roller to enter the dice (manual or interactive dice fulfillment).
 * @param {Roll} roll
 * @param {string} [messageMode] Defaults to the mode selected in the chat log.
 * @returns {Promise<Roll>}
 */
export function evaluateRoll(roll, messageMode = currentMessageMode()) {
  return roll.evaluate({ allowInteractive: messageMode !== 'blind' });
}

/**
 * Creates a chat message with the given visibility. Without the `messageMode` option core posts every message
 * publicly.
 * @param {object} messageData
 * @param {string} [messageMode] Defaults to the mode selected in the chat log.
 * @returns {Promise<ChatMessage|undefined>}
 */
export function createChatMessage(messageData, messageMode = currentMessageMode()) {
  return ChatMessage.create(messageData, { messageMode, chatBubble: false });
}

/**
 * @typedef {object} FieldData
 * @property {string} label
 * @property {any} value
 */

/**
 * @typedef {object} ItemData
 * @property {object} speaker
 * @property {string} name
 * @property {string} itemTypeLabel
 * @property {string} img
 * @property {string} description
 * @property {string|undefined} traits
 * @property {string|undefined} itemSubtypeLabel
 * @property {Array.<FieldData>} fields
 */

/**
 *
 * @param {ItemData} itemData
 * @returns {Promise<void>}
 */
export async function displayItem(itemData) {
  const traits = (itemData.traits ?? []).join(', ');
  const content = await renderTemplate(CONFIG.OQ.ChatConfig.itemTemplate, { ...itemData, traits });
  await createChatMessage({
    speaker: itemData.speaker,
    style: CONST.CHAT_MESSAGE_STYLES.IC,
    content,
  });
}
