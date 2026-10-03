import { OQCharacterActor } from '../document/actor/character-actor.js';
import { OQNpcActor } from '../document/actor/npc-actor.js';
import { OQCharacterSheet } from '../sheet/actor/character-sheet.js';
import { OQNpcSheet } from '../sheet/actor/npc-sheet.js';

export const ActorConfig = {
  documentClasses: {
    character: OQCharacterActor,
    npc: OQNpcActor,
  },
  sheetClasses: {
    character: OQCharacterSheet,
    npc: OQNpcSheet,
  },
  defaultIcons: {
    character: 'systems/oq/assets/icons/character.svg',
    npc: 'systems/oq/assets/icons/cultist.svg',
  },
  characteristicsParams: {
    characteristicPoints: 30,
    basePoints: 56,
    damageModifiers: [
      { key: 10, value: '-1d6' },
      { key: 15, value: '-1d4' },
      { key: 25, value: '' },
      { key: 30, value: '+1d4' },
    ],
    damageModifierFunction: function (value) {
      const tableVal = this.damageModifiers.find((kv) => value <= kv.key);
      if (tableVal) {
        return tableVal.value;
      } else {
        const mul = Math.floor((value - 16) / 15);
        return `+${mul}d6`;
      }
    },
  },
};
