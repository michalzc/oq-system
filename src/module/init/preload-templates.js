import _ from 'lodash-es';

export async function preloadTemplates() {
  const templatePaths = [
    'systems/oq/templates/actor/parts/notes.hbs',
    'systems/oq/templates/actor/parts/skills.hbs',
    'systems/oq/templates/actor/parts/attributes.hbs',
    'systems/oq/templates/chat/parts/skill-roll.hbs',
  ];

  return loadTemplates(_.concat(templatePaths, _.values(CONFIG.OQ.ItemConfig.itemSheetPartials)));
}
