import { OQBaseActor } from './actor/baseActor.js';
import { OQBaseItem } from './item/baseItem.js';

const actorHandler = {
  construct(target, [data, context]) {
    const actorConstructor = CONFIG.OQ.Actor.documentClasses[data.type];
    return actorConstructor ? new actorConstructor(data, context) : OQBaseActor(data, context);
  },
};

const itemHandler = {
  construct(_, [data, context]) {
    const itemConstructor = CONFIG.OQ.Item.documentClasses[data.type];
    return itemConstructor ? new itemConstructor(data, context) : OQBaseItem(data, context);
  },
};

export const OQActorDocumentProxy = new Proxy(Actor, actorHandler);
export const OQItemDocumentProxy = new Proxy(Item, itemHandler);
