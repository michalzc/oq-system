export const oqGame = {
  rollItem,
  rollDamageFromItem,
};

export function getRollByType(rollType) {
  const speaker = ChatMessage.getSpeaker();
  const actor = game.actors.tokens[speaker.token] ?? game.actors.get(speaker.actor);
  return async function (itemName) {
    if (actor) {
      const item = actor.items.find((item) => item.name === itemName);
      if (item) {
        switch (rollType) {
          case 'rollTest':
            return item.rollItemTest();

          case 'rollDamage':
            return item.rollItemDamage(false);
        }
      }
    }
  };
}

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
