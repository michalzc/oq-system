import { OQBaseActor } from './actor/base-actor.js';
import { OQBaseItem } from './item/base-item.js';

const actorHandler = {
  construct(target, [data, context]) {
    const actorConstructor = CONFIG.OQ.Actor.documentClasses[data.type];
    return actorConstructor ? new actorConstructor(data, context) : new OQBaseActor(data, context);
  },
};

const itemHandler = {
  construct(_, [data, context]) {
    const itemConstructor = CONFIG.OQ.Item.documentClasses[data.type];
    return itemConstructor ? new itemConstructor(data, context) : new OQBaseItem(data, context);
  },
};

export const OQActorDocumentProxy = new Proxy(OQBaseActor, actorHandler);
export const OQItemDocumentProxy = new Proxy(OQBaseItem, itemHandler);
