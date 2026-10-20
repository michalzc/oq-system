import _ from 'lodash-es';
import {
  CustomRulesPreset,
  RulesPresets,
  invalidRuleOptions,
  ruleOptionEntries,
  rulesFromFormData,
  rulesPresetOf,
} from '../consts/rules-config.js';

/**
 * The GM-only settings menu editing the Rule Options, with a Rules Preset combo box. The preset is not saved: it is
 * derived from the Rule Options shown in the form.
 */
export class RulesConfigDialog extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2,
) {
  static DEFAULT_OPTIONS = {
    id: 'oq-rules-config',
    // Keep the parchment palette like the other OQ dialogs.
    classes: ['oq', 'oq-dialog', 'themed', 'theme-light', 'rules-config'],
    tag: 'form',
    window: { title: 'OQ.Settings.rules.name', icon: 'fa-solid fa-scale-balanced' },
    position: { width: 520 },
    form: { handler: RulesConfigDialog.onSubmit, closeOnSubmit: false },
  };

  static PARTS = {
    form: { template: 'systems/oq/templates/applications/rules-config-dialog.hbs' },
    footer: { template: 'templates/generic/form-footer.hbs' },
  };

  /** @returns {string} the id of the rules setting, also the name prefix of the form inputs */
  static get settingId() {
    return `${CONFIG.OQ.SYSTEM_ID}.${CONFIG.OQ.SettingsConfig.keys.rules}`;
  }

  /** @returns {foundry.data.fields.SchemaField} the schema of the rules setting */
  static get rulesField() {
    return game.settings.settings.get(RulesConfigDialog.settingId).type;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const rules = game.settings.get(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.rules);
    const presetKeys = [...Object.keys(RulesPresets), CustomRulesPreset];
    return Object.assign(context, {
      rootId: this.id,
      fields: RulesConfigDialog.rulesField.fields,
      rules,
      preset: rulesPresetOf(rules),
      presets: _.fromPairs(presetKeys.map((key) => [key, `OQ.Settings.rules.preset.choices.${key}`])),
      buttons: [{ type: 'submit', icon: 'fa-solid fa-floppy-disk', label: 'SETTINGS.Save' }],
    });
  }

  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    // The browser would block out-of-range numbers silently; the submit handler rejects them with a notification.
    this.element.noValidate = true;
  }

  _onChangeForm(formConfig, event) {
    const presetSelect = this.element.querySelector('select.rules-preset');
    if (event.target === presetSelect) {
      const preset = RulesPresets[presetSelect.value];
      if (preset) this.fillForm(preset);
    } else {
      presetSelect.value = rulesPresetOf(this.readForm());
    }
    return super._onChangeForm(formConfig, event);
  }

  /** @returns {object} the Rule Options currently in the form, not validated */
  readForm() {
    const formData = new foundry.applications.ux.FormDataExtended(this.element);
    return rulesFromFormData(formData.object, RulesConfigDialog.settingId);
  }

  /** @param {object} rules Rule Options to show in the form */
  fillForm(rules) {
    for (const [path, value] of ruleOptionEntries(rules)) {
      const input = this.element.elements.namedItem(`${RulesConfigDialog.settingId}.${path}`);
      if (!input) continue;
      if (input.type === 'checkbox') input.checked = value;
      else input.value = value;
    }
  }

  /**
   * Saves the Rule Options. The range pickers already clamp typed modifiers; anything invalid that still gets here is
   * rejected with a notification, keeping the form open, as the setting itself would clamp it silently. Rules
   * differing from the active ones ask for a reload.
   */
  static async onSubmit(event, form, formData) {
    const rules = rulesFromFormData(formData.object, RulesConfigDialog.settingId);
    const invalid = invalidRuleOptions(rules);
    if (invalid.length) {
      ui.notifications.error(invalid.map(RulesConfigDialog.invalidMessage).join(' '));
      return;
    }

    await game.settings.set(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.rules, rules);
    await this.close({ submitted: true });
    // Compared with the rules active in this session, so declining a reload and saving again still asks.
    if (!_.isEqual(rules, CONFIG.OQ.Rules)) {
      await foundry.applications.settings.SettingsConfig.reloadConfirm({ world: true });
    }
  }

  /**
   * @param {{path: string, min?: number, max?: number}} invalid an invalid Rule Option from `invalidRuleOptions`
   * @returns {string} the localized error message
   */
  static invalidMessage({ path, min, max }) {
    const field = RulesConfigDialog.rulesField.getField(path);
    const label = game.i18n.localize(field?.label ?? path);
    return min === undefined
      ? game.i18n.format('OQ.Settings.rules.errors.invalidChoice', { label })
      : game.i18n.format('OQ.Settings.rules.errors.outOfRange', { label, min, max });
  }
}
