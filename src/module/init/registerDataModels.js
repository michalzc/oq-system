import { CharacterDataModel, NpcDataModel } from '../dataModel/actorDataModels.js';
import {
  ArmorDataModel,
  EquipmentDataModel,
  SkillDataModel,
  SpecialAbilityDataModel,
  SpellDataModel,
  WeaponDataModel,
} from '../dataModel/itemDataModels.js';

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
    specialAbility: SpecialAbilityDataModel,
  };
}
