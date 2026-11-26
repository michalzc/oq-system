import _ from 'lodash-es';
import { formatString } from '../utils/utils.js';
import { createChatMessage } from '../utils/chat.js';

function findTargets() {
  const targetTokens = canvas.ready ? canvas.tokens.controlled : [];
  return _.uniq(targetTokens.map((token) => token.actor));
}

/** A button's amount: a whole number of 0 or more, otherwise 0. */
const buttonAmount = (value) => (Number.isInteger(value) ? Math.max(0, value) : 0);

const nameFromActor = (actor) => actor?.parent?.name ?? actor.name;

async function sendMessage(messageKey, actor, ...values) {
  await createChatMessage({
    speaker: ChatMessage.getSpeaker(),
    style: CONST.CHAT_MESSAGE_STYLES.OOC,
    content: formatString(game.i18n.localize(messageKey), nameFromActor(actor), ...values),
  });
}

async function applyDamage(event) {
  const button = event.currentTarget;
  button.blur();

  const dataSet = button.dataset;
  const value = parseInt(dataSet.damageValue);
  const type = dataSet.damageApplyType;
  const updates = findTargets().map(async (actor) => {
    // Armour soaks normal damage before temporary HP is touched.
    const armour = type === 'normal' ? actor.system.attributes.ap.value ?? 0 : 0;
    const damage = Math.max(0, buttonAmount(value) - armour);
    if (damage === 0) return sendMessage('OQ.Chat.damageSoaked', actor);
    const { fromPools, fromOrdinary } = await actor.damageHp(damage);
    const taken = fromPools + fromOrdinary;
    if (fromPools) return sendMessage('OQ.Chat.damageAbsorbed', actor, taken, fromPools);
    return sendMessage('OQ.Chat.damageMessage', actor, taken);
  });
  await Promise.all(updates);
}

async function applyHealing(event) {
  const button = event.currentTarget;
  button.blur();

  const dataSet = button.dataset;
  const healingValue = parseInt(dataSet.healingValue);

  const updates = findTargets().map(async (actor) => {
    const { restored } = await actor.healHp(buttonAmount(healingValue));
    return sendMessage('OQ.Chat.healMessage', actor, restored);
  });
  await Promise.all(updates);
}

async function adjustMagicPoints(event) {
  const button = event.currentTarget;
  button.blur();

  // The decrease button's value is the rolled total with a leading minus, "-0" included.
  const { value } = button.dataset;
  const decrease = value.trim().startsWith('-');
  const amount = buttonAmount(Math.abs(parseInt(value)));
  const updates = findTargets().map(async (actor) => {
    // Spending takes temporary MP first; gaining restores ordinary MP only.
    if (decrease) {
      const { fromPools, fromOrdinary } = await actor.spendMp(amount);
      return sendMessage('OQ.Chat.spentMagicPoints', actor, fromPools + fromOrdinary);
    }
    const { restored } = await actor.gainMp(amount);
    return sendMessage('OQ.Chat.gainMagicPoints', actor, restored);
  });
  await Promise.all(updates);
}

async function rollDamageFromChatMessage(event) {
  event.preventDefault();
  const uuid = event.currentTarget.dataset.itemUuid;
  if (uuid) {
    const item = await fromUuid(uuid);
    if (!item) {
      ui.notifications.warn('OQ.Warnings.ItemNotFound', { localize: true });
      return;
    }
    if (item.parent && item.parent.isOwner) {
      await item.rollItemDamage(false);
    }
  }
}

function addClickListener(html, selector, listener) {
  html.querySelectorAll(selector).forEach((element) => element.addEventListener('click', listener));
}

export function handleDamageRollChatMessage(chatMessage, html) {
  const messageFlags = CONFIG.OQ.ChatConfig.MessageFlags;
  const messageType = chatMessage.getFlag(messageFlags.scope, messageFlags.key);

  if (messageType === messageFlags.updateFromChat) {
    addClickListener(html, '.oq.roll .apply-damage', applyDamage);
    addClickListener(html, '.oq.roll .apply-healing', applyHealing);
    addClickListener(html, '.oq.roll .adjust-mp', adjustMagicPoints);
  }

  if (messageType === messageFlags.hasRollDamage) {
    addClickListener(html, '.oq.roll .roll-damage', rollDamageFromChatMessage);
  }
}
