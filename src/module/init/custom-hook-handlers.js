import { handleDamageRollChatMessage } from '../chat-handlers/updates-from-chat.js';
import { commandHandler } from '../chat-handlers/chat-command-listener.js';
import { onHotbarDrop } from '../utils/item-macro.js';

export function registerCustomHookHandlers() {
  Hooks.on('renderChatMessage', handleDamageRollChatMessage);
  Hooks.on('chatMessage', commandHandler);
  Hooks.on('hotbarDrop', onHotbarDrop);
}
