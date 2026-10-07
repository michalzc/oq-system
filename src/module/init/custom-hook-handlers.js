import { handleDamageRollChatMessage } from '../chat-handlers/updates-from-chat.js';
import { onHotbarDrop } from '../utils/item-macro.js';

export function registerCustomHookHandlers() {
  Hooks.on('renderChatMessageHTML', handleDamageRollChatMessage);
  Hooks.on('hotbarDrop', onHotbarDrop);
  const refreshDeclarations = () => {
    if (ui.combat?.viewed?.isDeclaration) ui.combat.render();
  };
  // ActorDelta and Token updates cover unlinked tokens as well as ordinary actor/item updates.
  for (const hook of [
    'updateActor',
    'createItem',
    'updateItem',
    'deleteItem',
    'updateToken',
    'updateActorDelta',
    'createActiveEffect',
    'updateActiveEffect',
    'deleteActiveEffect',
  ]) {
    Hooks.on(hook, refreshDeclarations);
  }
}
