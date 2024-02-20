export const oqGame = {
  rollItem,
};

async function rollItem(itemName) {
  const speaker = ChatMessage.getSpeaker();
  const actor = game.actors.tokens[speaker.token] ?? game.actors.get(speaker.actor);
  if (actor) {
    const item = actor.items.find((item) => itemName === item.name);
    if (item) {
      item.rollItemTest();
    }
  }
}
