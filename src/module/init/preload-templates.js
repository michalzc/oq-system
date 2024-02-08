import _ from 'lodash-es';

export async function preloadTemplates() {
  const templatePaths = [
    'systems/oq/templates/actor/parts/notes.hbs',
    'systems/oq/templates/actor/parts/skills.hbs',
    'systems/oq/templates/actor/parts/combat.hbs',
    'systems/oq/templates/actor/parts/attributes.hbs',
    'systems/oq/templates/actor/parts/skill.hbs',
    'systems/oq/templates/actor/parts/weapon.hbs',
    'systems/oq/templates/actor/parts/armour.hbs',
    'systems/oq/templates/actor/parts/equipment-list.hbs',
    'systems/oq/templates/actor/parts/equipment.hbs',
    'systems/oq/templates/actor/parts/spell.hbs',
    'systems/oq/templates/actor/parts/magic.hbs',
    'systems/oq/templates/actor/parts/ability.hbs',
    'systems/oq/templates/actor/parts/initiative.hbs',
    'systems/oq/templates/chat/parts/skill-ability-roll.hbs',
    'systems/oq/templates/chat/parts/damage-roll.hbs',
    'systems/oq/templates/chat/parts/weapon-roll.hbs',
    'systems/oq/templates/item/parts/traits.hbs',
  ];

  return loadTemplates(_.concat(templatePaths, _.values(CONFIG.OQ.ItemConfig.itemSheetPartials)));
}
