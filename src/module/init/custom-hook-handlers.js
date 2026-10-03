import { handleDamageRollChatMessage } from '../chat-handlers/updates-from-chat.js';
import { onHotbarDrop } from '../utils/item-macro.js';

export function registerCustomHookHandlers() {
  Hooks.on('renderChatMessageHTML', handleDamageRollChatMessage);
  Hooks.on('hotbarDrop', onHotbarDrop);
}
