// Must stay synchronous: Hooks.call only stops core's own drop handling on a literal `false`, not a Promise.
export function onHotbarDrop(bar, data, slot) {
  const allowedMacroItems = [
    CONFIG.OQ.ItemConfig.itemTypes.skill,
    CONFIG.OQ.ItemConfig.itemTypes.weapon,
    CONFIG.OQ.ItemConfig.itemTypes.specialAbility,
  ];

  if (data.type !== 'Item') return;
  const item = foundry.utils.fromUuidSync(data.uuid, { strict: false });
  if (!item?.parent || !allowedMacroItems.includes(item.type)) return;

  createItemMacro(item, slot);
  return false;
}

async function createItemMacro(item, slot) {
  const command = `game.oq.rollItem(${JSON.stringify(item.name)})`;
  const existingMacro = game.macros.find((macro) => macro.name === item.name && macro.command === command);
  const macro = existingMacro
    ? existingMacro
    : await Macro.create({
        name: item.name,
        type: 'script',
        img: item.img,
        command: command,
        flags: { oq: { itemMacro: true } },
      });
  await game.user.assignHotbarMacro(macro, slot);
}
