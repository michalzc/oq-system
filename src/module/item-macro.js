export async function createItemMacro(bar, data, slot) {
  const allowedMacroItems = [
    CONFIG.OQ.ItemConfig.itemTypes.skill,
    CONFIG.OQ.ItemConfig.itemTypes.weapon,
    CONFIG.OQ.ItemConfig.itemTypes.specialAbility,
  ];

  if (allowedMacroItems.includes(data.type)) {
    const command = `game.oq.rollItem('${data.name}')`;
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
