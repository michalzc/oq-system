import { handleDamageRollChatMessage } from '../chat-handlers/damage-roll.js';

export function registerCustomHookHandlers() {
  Hooks.on('renderChatMessage', handleDamageRollChatMessage);
}
