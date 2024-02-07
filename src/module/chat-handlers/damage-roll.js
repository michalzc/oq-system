import { log } from '../utils.js';
import _ from 'lodash-es';

function findTargets() {
  const targetTokens = canvas.tokens.controlled;
  return _.uniq(targetTokens.map((token) => token.actor));
}

async function applyDamage(event) {
  const button = event.currentTarget;
  $(button).blur();

  const dataSet = button.dataset;
  const value = dataSet.damageValue;
  const type = dataSet.damageApplyType;
  log('Applying damage', value, type);
  const updates = findTargets().map(async (actor) => {
    const { hp, ap } = actor.system.attributes;
    const hpDelta = Math.max(0, type === 'normal' ? value - (ap.value ?? 0) : value);
    const updatedHpValue = Math.max(0, hp.value - hpDelta);
    return await actor.update({
      'system.attributes.hp.value': updatedHpValue,
    });
  });
  await Promise.all(updates);
}

export function handleDamageRollChatMessage(chatMessage, html) {
  const chatConfig = CONFIG.OQ.ChatConfig;
  if (chatMessage.flags[chatConfig.MessageFlags.key] === chatConfig.MessageFlags.damageRoll) {
    log('registering damage hook');
    html.find('.oq.roll.damage-roll .apply-damage').on('click', applyDamage);
  }
}
