import { OQActorDocumentProxy, OQItemDocumentProxy } from '../document/documentProxy.js';

export function registerDocuments() {
  CONFIG.Actor.documentClass = OQActorDocumentProxy;
  CONFIG.Item.documentClass = OQItemDocumentProxy;

  const localizePrefix = 'TYPES.Actor';
  Object.entries(CONFIG.OQ.Actor.sheetClasses).forEach(([key, sheetClass]) => {
    Actors.registerSheet(CONFIG.OQ.SYSTEM_ID, sheetClass, {
      types: [key],
      makeDefault: true,
      label: `${localizePrefix}.${key}`,
    });
  });
}
