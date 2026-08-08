import { OQActorDocumentProxy, OQItemDocumentProxy } from '../document/document-proxy.js';
import { OQItemDirectory } from '../document/item-directory.js';
import { OQCombat } from '../document/combat.js';
import { OQCombatTracker } from '../application/combat-tracker.js';

export function registerDocuments() {
  CONFIG.Actor.documentClass = OQActorDocumentProxy;
  CONFIG.Item.documentClass = OQItemDocumentProxy;
  CONFIG.Combat.documentClass = OQCombat;
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

  CONFIG.ui.items = OQItemDirectory;
}
