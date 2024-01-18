import { OQCharacterActor } from '../document/actor/character-actor.js';
import { OQNpcActor } from '../document/actor/npc-actor.js';
import { OQSkill } from '../document/item/skill.js';
import { OQWeapon } from '../document/item/weapon.js';
import { OQArmour } from '../document/item/armor.js';
import { OQEquipment } from '../document/item/equipment.js';
import { OQSpell } from '../document/item/spell.js';
import { OQCharacterSheet } from '../sheet/actor/character-sheet.js';
import { OQNpcSheet } from '../sheet/actor/npc-sheet.js';
import { OQSkillSheet } from '../sheet/item/skill-sheet.js';
import { OQSpecialAbility } from '../document/item/special-ability.js';
import { BaseRollFormula, DifficultyLevels, RollResults } from './rolls.js';
import { DefaultItemIcons, SkillGroups } from './items.js';
import { OQWeaponSheet } from '../sheet/item/weapon-sheet.js';
import { CharacteristicsParams, DefaultActorIcons } from './actors.js';

export const SYSTEM_ID = 'oq';
export const SYSTEM_NAME = 'OQ System';

const Actor = {
  documentClasses: {
    character: OQCharacterActor,
    npc: OQNpcActor,
  },
  sheetClasses: {
    character: OQCharacterSheet,
    npc: OQNpcSheet,
  },
};

const Item = {
  documentClasses: {
    skill: OQSkill,
    weapon: OQWeapon,
    armour: OQArmour,
    equipment: OQEquipment,
    spell: OQSpell,
    specialAbility: OQSpecialAbility,
  },
  sheetClasses: {
    skill: OQSkillSheet,
    weapon: OQWeaponSheet,
  },
};

const SettingKeys = {
  masterNeverThrows: {
    key: 'masterNeverThrows',
    localizationKey: 'MasterNeverThrows',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true,
    requiresReload: false,
  },
};

export const OQ = {
  SYSTEM_ID,
  SYSTEM_NAME,
  Actor,
  Item,
  CharacteristicsParams,
  SkillGroups,
  DifficultyLevels,
  BaseRollFormula,
  SettingKeys,
  RollResults,
  DefaultItemIcons,
  DefaultActorIcons,
};
