import _ from 'lodash-es';

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
  const content = await renderTemplate(
    CONFIG.OQ.ChatConfig.itemTemplate,
    _.merge(itemData, {
      traits,
    }),
  );
  await ChatMessage.create({
    style: CONST.CHAT_MESSAGE_STYLES.IC,
    content,
  });
}
