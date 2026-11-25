import { CharacterDataModel, NpcDataModel } from '../dataModel/data-models-actor.js';
import { OQEffectDataModel } from '../dataModel/data-models-effect.js';
import {
  ArmorDataModel,
  EquipmentDataModel,
  SkillDataModel,
  SpecialAbilityDataModel,
  SpellDataModel,
  WeaponDataModel,
} from '../dataModel/data-models-item.js';

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
    armour: ArmorDataModel,
    equipment: EquipmentDataModel,
    spell: SpellDataModel,
    specialAbility: SpecialAbilityDataModel,
  };

  // Replaces the core model of the base type, so every effect, including ones stored before v0.9, uses it.
  CONFIG.ActiveEffect.dataModels = {
    ...CONFIG.ActiveEffect.dataModels,
    base: OQEffectDataModel,
  };
}
