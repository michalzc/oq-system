export const oqGame = {
  rollItem,
  rollDamageFromItem,
};

export async function rollItem(itemName) {
  const speaker = ChatMessage.getSpeaker();
  const actor = game.actors.tokens[speaker.token] ?? game.actors.get(speaker.actor);
  if (actor) {
    const item = actor.items.find((item) => itemName === item.name);
    if (item) {
      item.rollItemTest();
    }
  }
}

export async function rollDamageFromItem(itemName) {
  const speaker = ChatMessage.getSpeaker();
  const actor = game.actors.tokens[speaker.token] ?? game.actors.get(speaker.actor);
  if (actor) {
    const item = actor.items.find((item) => itemName === item.name);
    if (item) {
      item.rollItemDamage(false);
    }
  }
}
