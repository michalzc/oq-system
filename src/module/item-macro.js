import { log } from './utils.js';

export async function createItemMacro(bar, data, slot) {
  const allowedMacrotItems = [
    CONFIG.OQ.ItemConfig.itemTypes.skill,
    CONFIG.OQ.ItemConfig.itemTypes.weapon,
    CONFIG.OQ.ItemConfig.itemTypes.specialAbility,
  ];

  log('HotbarDrop', data, slot);
  if (allowedMacrotItems.includes(data.type)) {
    const command = `game.oq.rollItem('${data._id}')`;
    const existingMacro = game.macros.find((macro) => macro.name === data.name && macro.command === command);
    const macro = existingMacro
      ? existingMacro
      : await Macro.create({
          name: data.name,
          type: 'script',
          img: data.img,
          command: command,
          flags: { 'oq.itemMacro': true },
        });
    game.user.assignHotbarMacro(macro, slot);
  } else {
    ui.notifications.warn(game.i18n.localize('OQ.Warnings.OnlyItemCanBeMacro'));
  }

  return false;
}

export async function rollItem(itemId) {
  log('Rolling item', itemId);

  const speaker = ChatMessage.getSpeaker();
  const actor = game.actors.tokens[speaker.token] ?? game.actors.get(speaker.actor);
  if (actor) {
    const item = actor.items.get(itemId);
    if (item) {
      item.rollItemTest();
    }
  }
}
