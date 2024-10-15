import _ from 'lodash-es';

const commandRegex = /\/(?<command>[a-zA-Z]+)\s(?<param>.*)/;

const Commands = {
  hp: hpHandler,
  mp: mpHandler,
};

async function sendAdjustMessage(rollString, type, chatData) {
  const actor = game.user.isGM ? _.head(canvas.tokens.controlled.map((token) => token.actor)) : game.user.character;
  const roll = await new Roll(rollString, actor?.getRollData()).roll();
  const renderedRoll = await roll.render();
  const content = await renderTemplate(CONFIG.OQ.ChatConfig.adjustmentTemplate, { roll, renderedRoll, type });
  await ChatMessage.create({
    ...chatData,
    rolls: [roll],
    content,
    flags: {
      oqMessageType: CONFIG.OQ.ChatConfig.MessageFlags.updateFromChat,
    },
  });
}

async function mpHandler(roll, chatData) {
  await sendAdjustMessage(roll, CONFIG.OQ.ChatConfig.AdjustmentType.mp, chatData);
}

async function hpHandler(roll, chatData) {
  await sendAdjustMessage(roll, CONFIG.OQ.ChatConfig.AdjustmentType.hp, chatData);
}
export function commandHandler(chatLog, message, chatData) {
  const match = commandRegex.exec(message);
  if (match) {
    const command = match.groups?.command;
    const param = match.groups?.param;
    const handler = Commands[command];
    if (handler) {
      handler(param, chatData);
      return false;
    }
  }

  return true;
}
