import { OQActorDocumentProxy, OQItemDocumentProxy } from '../document/documentProxy.js';

export function registerDocuments() {
  CONFIG.Actor.documentClass = OQActorDocumentProxy;
  CONFIG.Item.documentClass = OQItemDocumentProxy;
}
