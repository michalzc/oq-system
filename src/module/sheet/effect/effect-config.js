import {
  EFFECT_ROLES,
  EFFECT_TARGETS,
  effectChangesToSave,
  unreadableDamageTerms,
} from '../../utils/effect-contributions.js';

const FormDataExtended = foundry.applications.ux.FormDataExtended;

/**
 * The system effect editor, registered as the default sheet for every Active Effect. It edits name, icon, enabled, rules
 * text, source name and OpenQuest changes chosen from the curated vocabulary instead of free key/type/value rows: actor
 * targets on actor effects, its role's targets on an item effect with a role (`EFFECT_ROLES`). Stored changes it does not manage (made by macros or modules) are only listed, and saved back
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

  /** Item effects stored before v0.9 have no role and are offered no OpenQuest changes. */
  get offersChanges() {
    return this.document.targets.length > 0;
  }

  async _preparePartContext(partId, context) {
    const partContext = await super._preparePartContext(partId, context);
    if (partId === 'details') {
      const entry = this.document.listEntry;
      const targetOptions = Object.fromEntries(this.document.targets.map((key) => [key, EFFECT_TARGETS[key].label]));
      const role = this.document._source.system.role;
      Object.assign(partContext, {
        systemFields: this.document.system.schema.fields,
        offersChanges: this.offersChanges,
        role: role && { label: EFFECT_ROLES[role].label, hint: `OQ.Effects.RoleHint.${role}` },
        changes: entry.changes.map((change) => ({
          ...change,
          allowsMinimum: EFFECT_TARGETS[change.target].allowsMinimum ?? false,
          isFormula: EFFECT_TARGETS[change.target].formula ?? false,
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

  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    // Another target may allow other operations or a minimum: save, so the row is drawn again for its new target.
    if (event.target.matches('.oq-changes select.target')) this.submit();
  }

  _processFormData(event, form, formData) {
    const submitData = super._processFormData(event, form, formData);
    const { oqChanges, ...data } = submitData;
    if (!this.offersChanges) return data;
    data.system ??= {};
    // The operation select is not named `type`: core's change listener would take it for one of its own rows.
    const edited = Object.values(oqChanges ?? {}).map(({ operation, ...change }) => ({ ...change, type: operation }));
    const unreadable = unreadableDamageTerms(edited);
    // Thrown, as core's own validation does here: the submission shows the message and the editor stays open.
    if (unreadable.length) {
      throw new Error(game.i18n.format('OQ.Effects.InvalidDamageTerms', { terms: unreadable.join(', ') }));
    }
    data.system.changes = effectChangesToSave(this.document._source.system.changes, edited, this.document.targets);
    return data;
  }

  /**
   * Saves the form with one more OpenQuest change, as core does for its change rows.
   * @this {OQActiveEffectConfig}
   */
  static async #onAddEffectChange() {
    const { system } = this._processFormData(null, this.form, new FormDataExtended(this.form));
    const targets = this.document.targets;
    const [target] = targets;
    const { types, formula } = EFFECT_TARGETS[target];
    const added = effectChangesToSave([], [{ target, type: types[0], value: formula ? '' : 0 }], targets);
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
