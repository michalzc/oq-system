/**
 * The system effect editor, registered as the default sheet for every Active Effect. It edits name, icon, enabled, rules
 * text and source name. It renders no input for stored changes, so the changes of effects made by macros or modules
 * are saved back exactly as stored and only listed as other stored changes. Statuses and duration stay hidden until
 * the conditions and clocks chunks add them.
 */
export class OQActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {
  static DEFAULT_OPTIONS = {
    // Keep the parchment palette until the sheets support both colour schemes.
    classes: ['oq', 'sheet', 'effect', 'themed', 'theme-light'],
    window: { resizable: true },
  };

  static PARTS = {
    header: { template: 'templates/sheets/active-effect/header.hbs' },
    details: { template: 'systems/oq/templates/effect/effect-config.hbs', scrollable: [''] },
    footer: { template: 'templates/generic/form-footer.hbs' },
  };

  // A single tab without navigation: core part preparation expects a tab for the details part.
  static TABS = {
    sheet: {
      tabs: [{ id: 'details' }],
      initial: 'details',
      labelPrefix: 'EFFECT.TABS',
    },
  };

  async _preparePartContext(partId, context) {
    const partContext = await super._preparePartContext(partId, context);
    if (partId === 'details') {
      Object.assign(partContext, {
        systemFields: this.document.system.schema.fields,
        otherChanges: this.document.listEntry.otherChanges,
      });
    }
    return partContext;
  }
}
