import { CharacterDataModel, NpcDataModel } from './actorDataModels.js';
import {
  ArmorDataModel,
  EquipmentDataModel,
  SkillDataModel,
  SpellDataModel,
  WeaponDataModel,
} from './itemDataModels.js';

export function registerDataModels() {
  CONFIG.Actor.dataModels = {
    ...CONFIG.Actor.dataModels,
    character: CharacterDataModel,
    npc: NpcDataModel,
  };

  CONFIG.Item.dataModels = {
    ...CONFIG.Item.dataModels,
    skill: SkillDataModel,
    weapon: WeaponDataModel,
    armor: ArmorDataModel,
    equipment: EquipmentDataModel,
    spell: SpellDataModel,
  };
}
