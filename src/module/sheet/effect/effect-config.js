import { EFFECT_TARGETS, effectChangesToSave } from '../../utils/effect-contributions.js';

const FormDataExtended = foundry.applications.ux.FormDataExtended;

/**
 * The system effect editor, registered as the default sheet for every Active Effect. It edits name, icon, enabled, rules
 * text, source name and, on actor effects, OpenQuest changes chosen from the curated vocabulary instead of free
 * key/type/value rows. Stored changes it does not manage (made by macros or modules) are only listed, and saved back
 * exactly as stored. Statuses and duration stay hidden until the conditions and clocks chunks add them.
 */
export class OQActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {
  static DEFAULT_OPTIONS = {
    // Keep the parchment palette until the sheets support both colour schemes.
    classes: ['oq', 'sheet', 'effect', 'themed', 'theme-light'],
    window: { resizable: true },
    actions: {
      addEffectChange: OQActiveEffectConfig.#onAddEffectChange,
      deleteEffectChange: OQActiveEffectConfig.#onDeleteEffectChange,
    },
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

  /** OpenQuest changes are offered on actor effects only; item effects get their roles in later chunks. */
  get offersChanges() {
    return this.document.parent?.documentName === 'Actor';
  }

  async _preparePartContext(partId, context) {
    const partContext = await super._preparePartContext(partId, context);
    if (partId === 'details') {
      const entry = this.document.listEntry;
      const targetOptions = Object.fromEntries(Object.entries(EFFECT_TARGETS).map(([key, { label }]) => [key, label]));
      Object.assign(partContext, {
        systemFields: this.document.system.schema.fields,
        offersChanges: this.offersChanges,
        changes: entry.changes.map((change) => ({
          ...change,
          targetOptions,
          typeOptions: Object.fromEntries(
            EFFECT_TARGETS[change.target].types.map((type) => [type, `OQ.Effects.Operations.${type}`]),
          ),
        })),
        otherChanges: entry.otherChanges,
      });
    }
    return partContext;
  }

  _processFormData(event, form, formData) {
    const submitData = super._processFormData(event, form, formData);
    const { oqChanges, ...data } = submitData;
    if (!this.offersChanges) return data;
    data.system ??= {};
    data.system.changes = effectChangesToSave(this.document._source.system.changes, Object.values(oqChanges ?? {}));
    return data;
  }

  /**
   * Saves the form with one more OpenQuest change, as core does for its change rows.
   * @this {OQActiveEffectConfig}
   */
  static async #onAddEffectChange() {
    const { system } = this._processFormData(null, this.form, new FormDataExtended(this.form));
    const [target, { types }] = Object.entries(EFFECT_TARGETS)[0];
    const added = effectChangesToSave([], [{ target, type: types[0], value: 0 }]);
    return this.submit({ updateData: { system: { changes: [...system.changes, ...added] } } });
  }

  /**
   * Saves the form without the OpenQuest change of the clicked row.
   * @this {OQActiveEffectConfig}
   */
  static async #onDeleteEffectChange(event, target) {
    target.closest('li.change').remove();
    return this.submit();
  }
}
