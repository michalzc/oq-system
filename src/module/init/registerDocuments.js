import { OQActorDocumentProxy, OQItemDocumentProxy } from '../document/documentProxy.js';
import * as CONFIG from '../consts.js';

export function registerDocuments() {
  CONFIG.Actor.documentClass = OQActorDocumentProxy;
  CONFIG.Item.documentClass = OQItemDocumentProxy;

  const localizeActorPrefix = 'TYPES.Actor';
  Object.entries(CONFIG.OQ.Actor.sheetClasses).forEach(([key, sheetClass]) => {
    Actors.registerSheet(CONFIG.OQ.SYSTEM_ID, sheetClass, {
      types: [key],
      makeDefault: true,
      label: `${localizeActorPrefix}.${key}`,
    });
  });

  const localizeItemPrefix = 'TYPES.Item';
  Object.entries(CONFIG.OQ.Item.sheetClasses).forEach(([key, sheetClass]) => {
    Items.registerSheet(CONFIG.OQ.SYSTEM_ID, sheetClass, {
      types: [key],
      makeDefault: true,
      label: `${localizeItemPrefix}.${key}`,
    });
  });
}
