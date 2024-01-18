export async function preloadTemplates() {
  const templatePaths = [
    'systems/oq/templates/actor/parts/notes.hbs',
    'systems/oq/templates/actor/parts/skills.hbs',
    'systems/oq/templates/actor/parts/attributes.hbs',
    'systems/oq/templates/chat/parts/skill-roll.hbs',
    'systems/oq/templates/applications/skill-roll-dialog.hbs',
    'systems/oq/templates/item/parts/header.hbs',
  ];

  return loadTemplates(templatePaths);
}
