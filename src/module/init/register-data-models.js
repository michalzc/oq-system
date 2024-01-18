import { CharacterDataModel, NpcDataModel } from '../dataModel/actor-data-models.js';
import {
  ArmorDataModel,
  EquipmentDataModel,
  SkillDataModel,
  SpecialAbilityDataModel,
  SpellDataModel,
  WeaponDataModel,
} from '../dataModel/item-data-models.js';

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
