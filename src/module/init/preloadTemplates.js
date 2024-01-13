export async function preloadTemplates() {
  const templatePaths = ['systems/oq/templates/actor/parts/notes.hbs', 'systems/oq/templates/actor/parts/skills.hbs'];

  return loadTemplates(templatePaths);
}
