import { OQActorDocumentProxy, OQItemDocumentProxy } from '../document/document-proxy.js';
import { OQCombat } from '../document/combat.js';
import { OQCombatant } from '../document/combatant.js';
import { OQCombatTracker } from '../application/combat-tracker.js';
import { OQActiveEffect } from '../document/active-effect.js';
import { OQActiveEffectConfig } from '../sheet/effect/effect-config.js';
import { OQToken } from '../canvas/token.js';

export function registerDocuments() {
  CONFIG.Actor.documentClass = OQActorDocumentProxy;
  CONFIG.Item.documentClass = OQItemDocumentProxy;
  CONFIG.Combat.documentClass = OQCombat;
  CONFIG.Combatant.documentClass = OQCombatant;
  CONFIG.ActiveEffect.documentClass = OQActiveEffect;
  CONFIG.Token.objectClass = OQToken;
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

  foundry.applications.apps.DocumentSheetConfig.registerSheet(
    foundry.documents.ActiveEffect,
    CONFIG.OQ.SYSTEM_ID,
    OQActiveEffectConfig,
    { makeDefault: true, label: 'OQ.Effects.EditorLabel' },
  );
}
