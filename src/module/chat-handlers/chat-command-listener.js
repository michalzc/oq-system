import { createChatMessage, evaluateRoll } from '../utils/chat.js';
import { renderTemplate } from '../utils/utils.js';

const ChatLog = foundry.applications.sidebar.tabs.ChatLog;

async function sendAdjustMessage(rollString, type, chatData) {
  // The same actor core's /roll uses: the controlled token, otherwise the user's character. Works without a canvas.
  const actor = ChatMessage.getSpeakerActor(chatData.speaker) ?? game.user.character;
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
// `isMultiline` makes core split the input on Shift+Enter line breaks; only the first line is the command.
function adjustmentCommand(type) {
  return {
    rgx: new RegExp(`^/${type}\\s+(.+)$`, 'i'),
    isMultiline: true,
    fn: async (command, [match], chatData) => {
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
