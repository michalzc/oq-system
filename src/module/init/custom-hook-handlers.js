import { handleDamageRollChatMessage } from '../chat-handlers/updates-from-chat.js';
import { commandHandler } from '../chat-handlers/chat-command-listener.js';

export function registerCustomHookHandlers() {
  Hooks.on('renderChatMessage', handleDamageRollChatMessage);
  Hooks.on('chatMessage', commandHandler);
}
