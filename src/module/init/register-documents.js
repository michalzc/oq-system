import { OQActorDocumentProxy, OQItemDocumentProxy } from '../document/document-proxy.js';
import { OQCombat } from '../document/combat.js';
import { OQCombatant } from '../document/combatant.js';
import { OQTokenDocument } from '../document/token.js';
import { OQChatMessage } from '../document/chat-message.js';
import { OQCombatTracker } from '../application/combat-tracker.js';

export function registerDocuments() {
  CONFIG.Actor.documentClass = OQActorDocumentProxy;
  CONFIG.Item.documentClass = OQItemDocumentProxy;
  CONFIG.Combat.documentClass = OQCombat;
  CONFIG.Combatant.documentClass = OQCombatant;
  CONFIG.Token.documentClass = OQTokenDocument;
  CONFIG.ChatMessage.documentClass = OQChatMessage;
  OQCombat.registerQueries();
  CONFIG.ui.combat = OQCombatTracker;

  const localizeActorPrefix = 'TYPES.Actor';
  Object.entries(CONFIG.OQ.ActorConfig.sheetClasses).forEach(([key, sheetClass]) => {
    foundry.documents.collections.Actors.registerSheet(CONFIG.OQ.SYSTEM_ID, sheetClass, {
      types: [key],
      makeDefault: true,
      label: `${localizeActorPrefix}.${key}`,
    });
  });

  const localizeItemPrefix = 'TYPES.Item';
  Object.entries(CONFIG.OQ.ItemConfig.sheetClasses).forEach(([key, sheetClass]) => {
    foundry.documents.collections.Items.registerSheet(CONFIG.OQ.SYSTEM_ID, sheetClass, {
      types: [key],
      makeDefault: true,
      label: `${localizeItemPrefix}.${key}`,
    });
  });
}
