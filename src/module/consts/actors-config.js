import { OQCharacterActor } from '../document/actor/character-actor.js';
import { OQNpcActor } from '../document/actor/npc-actor.js';
import { OQCharacterSheet } from '../application/sheet/actor/character-sheet.js';
import { OQNpcSheet } from '../application/sheet/actor/npc-sheet.js';

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

export const CharacteristicsParams = {
  characteristicsRolls: {
    //FIXME delete after fixing dialog rolls
    str: '3d6',
    dex: '3d6',
    con: '3d6',
    siz: '2d6+6',
    int: '2d6+6',
    pow: '3d6',
    cha: '3d6',
  },
  characteristicPoints: 30,
  basePoints: 56,
  damageModifiers: [
    { key: 10, value: '-1d6' },
    { key: 15, value: '-1d4' },
    { key: 25, value: '0' },
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
};
