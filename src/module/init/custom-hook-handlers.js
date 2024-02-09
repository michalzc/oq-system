import { handleDamageRollChatMessage } from '../chat-handlers/updates-from-chat.js';
import { commandHandler } from '../chat-handlers/chat-command-listener.js';
import { log } from '../utils.js';

export function registerCustomHookHandlers() {
  Hooks.on('renderChatMessage', handleDamageRollChatMessage);
  Hooks.on('chatMessage', commandHandler);
  Hooks.on('createDocument', tempCreateDocument);
}

function tempCreateDocument(document, options, userId) {
  log('Create Document', document, options, userId);
}
