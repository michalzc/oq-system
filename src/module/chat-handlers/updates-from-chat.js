import _ from 'lodash-es';
import { formatString } from '../utils/utils.js';

function findTargets() {
  const targetTokens = canvas.tokens.controlled;
  return _.uniq(targetTokens.map((token) => token.actor));
}

const nameFromActor = (actor) => actor?.parent?.name ?? actor.name;

async function sendMessage(messageKey, actor, delta) {
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker(),
    type: CONST.CHAT_MESSAGE_TYPES.OOC,
    content: formatString(game.i18n.localize(messageKey), nameFromActor(actor), delta),
  });
}

async function applyDamage(event) {
  const button = event.currentTarget;
  $(button).blur();

  const dataSet = button.dataset;
  const value = parseInt(dataSet.damageValue);
  const type = dataSet.damageApplyType;
  const updates = findTargets().map(async (actor) => {
    const { hp, ap } = actor.system.attributes;
    const hpDelta = Math.max(0, type === 'normal' ? value - (ap.value ?? 0) : value);
    const updatedHpValue = Math.max(0, hp.value - hpDelta);
    if (hpDelta > 0) {
      await sendMessage('OQ.Chat.damageMessage', actor, Math.min(hp.value, hpDelta));
      return await actor.update({
        'system.attributes.hp.value': updatedHpValue,
      });
    } else {
      return sendMessage('OQ.Chat.damageSoaked', actor);
    }
  });
  await Promise.all(updates);
}

async function applyHealing(event) {
  const button = event.currentTarget;
  $(button).blur();

  const dataSet = button.dataset;
  const healingValue = parseInt(dataSet.healingValue);

  const updates = findTargets().map(async (actor) => {
    const { value, max } = actor.system.attributes.hp;
    const updatedHpValue = Math.min(max, value + healingValue);
    await sendMessage('OQ.Chat.healMessage', actor, Math.min(max - value, healingValue));
    return await actor.update({
      'system.attributes.hp.value': updatedHpValue,
    });
  });
  await Promise.all(updates);
}

async function adjustMagicPoints(event) {
  const button = event.currentTarget;
  $(button).blur();

  const dataSet = button.dataset;
  const updateValue = parseInt(dataSet.value);

  const updates = findTargets().map(async (actor) => {
    const { value, max } = actor.system.attributes.mp;
    const updatedMpValue = Math.max(0, Math.min(max, value + updateValue));
    if (updateValue > 0) await sendMessage('OQ.Chat.gainMagicPoints', actor, Math.min(max - value, updateValue));
    else await sendMessage('OQ.Chat.spentMagicPoints', actor, Math.min(value, -updateValue));
    return await actor.update({
      'system.attributes.mp.value': updatedMpValue,
    });
  });
  await Promise.all(updates);
}

async function rollDamageFromChatMessage(event) {
  event.preventDefault();
  const uuid = event.currentTarget.dataset.itemUuid;
  if (uuid) {
    const item = await fromUuid(uuid);
    if (item.parent && item.parent.isOwner) {
      await item.rollItemDamage(false);
    }
  }
}

export function handleDamageRollChatMessage(chatMessage, html) {
  const chatConfig = CONFIG.OQ.ChatConfig;
  if (chatMessage.flags[chatConfig.MessageFlags.key] === chatConfig.MessageFlags.updateFromChat) {
    html.find('.oq.roll .apply-damage').on('click', applyDamage);
    html.find('.oq.roll .apply-healing').on('click', applyHealing);
    html.find('.oq.roll .adjust-mp').on('click', adjustMagicPoints);
  }

  if (chatMessage.flags[chatConfig.MessageFlags.key] === chatConfig.MessageFlags.hasRollDamage) {
    html.find('.oq.roll .roll-damage').on('click', rollDamageFromChatMessage);
  }
}
