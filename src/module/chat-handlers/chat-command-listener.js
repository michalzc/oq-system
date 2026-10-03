import _ from 'lodash-es';
import { createChatMessage, evaluateRoll } from '../utils/chat.js';

const renderTemplate = foundry.applications.handlebars.renderTemplate;
const ChatLog = foundry.applications.sidebar.tabs.ChatLog;

async function sendAdjustMessage(rollString, type, chatData) {
  const actor = game.user.isGM ? _.head(canvas.tokens.controlled.map((token) => token.actor)) : game.user.character;
  const roll = await evaluateRoll(new Roll(rollString, actor?.getRollData()));
  const renderedRoll = await roll.render();
  const content = await renderTemplate(CONFIG.OQ.ChatConfig.adjustmentTemplate, { roll, renderedRoll, type });
  const messageFlags = CONFIG.OQ.ChatConfig.MessageFlags;
  await createChatMessage({
    ...chatData,
    rolls: [roll],
    content,
    flags: {
      [messageFlags.scope]: { [messageFlags.key]: messageFlags.updateFromChat },
    },
  });
}

// The chat input is ProseMirror, so the matched text is HTML.
function htmlToText(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.textContent;
}

// Not `isRoll`: that would also make core enrich `[[/hp …]]` as a plain dice roll.
function adjustmentCommand(type) {
  return {
    rgx: new RegExp(`^/${type}\\s+(.+)$`, 'i'),
    fn: async (command, match, chatData) => {
      await sendAdjustMessage(htmlToText(match[1]), type, chatData);
      return false;
    },
  };
}

export function registerChatCommands() {
  const { hp, mp } = CONFIG.OQ.ChatConfig.AdjustmentType;
  ChatLog.CHAT_COMMANDS.oqHp = adjustmentCommand(hp);
  ChatLog.CHAT_COMMANDS.oqMp = adjustmentCommand(mp);
}
