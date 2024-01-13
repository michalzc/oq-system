import { OQActorDocumentProxy, OQItemDocumentProxy } from '../document/documentProxy.js';
import { log } from '../utils.js';

export function registerDocuments() {
  CONFIG.Actor.documentClass = OQActorDocumentProxy;
  CONFIG.Item.documentClass = OQItemDocumentProxy;

  const localizePrefix = 'TYPES.Actor';
  Object.entries(CONFIG.OQ.Actor.sheetClasses).forEach(([key, sheetClass]) => {
    log('Registering sheet for', key, 'sheet:', sheetClass);
    Actors.registerSheet(CONFIG.OQ.SYSTEM_ID, sheetClass, {
      types: [key],
      makeDefault: true,
      label: `${localizePrefix}.${key}`,
    });
  });
}
