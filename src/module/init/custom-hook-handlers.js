import { handleDamageRollChatMessage } from '../chat-handlers/updates-from-chat.js';
import { onHotbarDrop } from '../utils/item-macro.js';

export function registerCustomHookHandlers() {
  Hooks.on('renderChatMessageHTML', handleDamageRollChatMessage);
  Hooks.on('renderChatMessageHTML', markNpcMessage);
  Hooks.on('hotbarDrop', onHotbarDrop);
  const renderDeclarations = foundry.utils.debounce(() => {
    if (ui.combat?.viewed?.isDeclaration) ui.combat.render();
  }, 100);
  const refreshDeclarations = (doc) => {
    const combat = ui.combat?.viewed;
    const actor = relatedActor(doc);
    if (!combat?.isDeclaration || !actor) return;
    // A world actor's ID also matches unlinked tokens inheriting its changes. A synthetic token actor shares that ID, so
    // it must match exactly, or every other token of the same base actor would re-render the tracker.
    const affected = (c) => (actor.isToken ? c.actor?.uuid === actor.uuid : c.actorId === actor.id);
    if (combat.combatants.some(affected)) renderDeclarations();
  };
  // ActorDelta and Token updates cover unlinked tokens as well as ordinary actor/item updates.
  for (const hook of [
    'updateActor',
    'createItem',
    'updateItem',
    'deleteItem',
    'updateToken',
    'updateActorDelta',
    'createActiveEffect',
    'updateActiveEffect',
    'deleteActiveEffect',
  ]) {
    Hooks.on(hook, refreshDeclarations);
  }
}

/** The actor whose declaration a document change can affect: Items and ActiveEffects reach it through their parents. */
function relatedActor(doc) {
  if (doc?.documentName === 'Token') return doc.actor;
  if (doc?.documentName === 'Actor') return doc;
  return doc?.parent ? relatedActor(doc.parent) : null;
}

/** Gives messages spoken by NPCs their own palette. */
function markNpcMessage(message, html) {
  html.classList.toggle('oq-npc', message.speakerActor?.type === 'npc');
}
