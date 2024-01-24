import _ from 'lodash-es';

export async function preloadTemplates() {
  const templatePaths = [
    'systems/oq/templates/actor/parts/notes.hbs',
    'systems/oq/templates/actor/parts/skills.hbs',
    'systems/oq/templates/actor/parts/attributes.hbs',
    'systems/oq/templates/actor/parts/skill-ability-row.hbs',
    'systems/oq/templates/actor/parts/weapon.hbs',
    'systems/oq/templates/chat/parts/skill-roll.hbs',
    'systems/oq/templates/chat/parts/damage-roll.hbs',
  ];

  return loadTemplates(_.concat(templatePaths, _.values(CONFIG.OQ.ItemConfig.itemSheetPartials)));
}
