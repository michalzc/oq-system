import { OQActorDocumentProxy, OQItemDocumentProxy } from '../document/document-proxy.js';
import { OQItemDirectory } from '../document/item-directory.js';
import { OQCombat } from '../document/combat.js';

export function registerDocuments() {
  CONFIG.Actor.documentClass = OQActorDocumentProxy;
  CONFIG.Item.documentClass = OQItemDocumentProxy;
  CONFIG.Combat.documentClass = OQCombat;

  const localizeActorPrefix = 'TYPES.Actor';
  Object.entries(CONFIG.OQ.ActorConfig.sheetClasses).forEach(([key, sheetClass]) => {
    Actors.registerSheet(CONFIG.OQ.SYSTEM_ID, sheetClass, {
      types: [key],
      makeDefault: true,
      label: `${localizeActorPrefix}.${key}`,
    });
  });

  const localizeItemPrefix = 'TYPES.Item';
  Object.entries(CONFIG.OQ.ItemConfig.sheetClasses).forEach(([key, sheetClass]) => {
    Items.registerSheet(CONFIG.OQ.SYSTEM_ID, sheetClass, {
      types: [key],
      makeDefault: true,
      label: `${localizeItemPrefix}.${key}`,
    });
  });

  CONFIG.ui.items = OQItemDirectory;
}
