import _ from 'lodash-es';
import { damageRoll } from '../roll.js';

export class OQDamageRollDialog extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;

    return _.merge(options, {
      classes: ['oq', 'dialog', 'roll'],
      width: 400,
      id: 'roll-damage-dialog',
      template: 'systems/oq/templates/applications/damage-roll-dialog.hbs',
    });
  }

  activateListeners(html) {
    html.find('.cancel-button').on('click', this.onCancel.bind(this));
  }

  onCancel(event) {
    event.preventDefault();
    this.close();
  }

  getData(options) {
    const context = super.getData(options);
    const rollData = this.object;
    const formula = rollData.includeDM
      ? `${rollData.damageFormula} ${rollData.actorRollData.dm}`
      : rollData.damageFormula;
    const customformula = new Roll(formula).formula;
    return _.merge(context, {
      ...rollData,
      customformula,
    });
  }

  async _updateObject(event, formData) {
    const customFormula = formData.customformula;
    if (customFormula) {
      const rollData = this.object;

      await damageRoll(_.merge(rollData, { customFormula }));
    }
  }

  async _render(force, options) {
    await super._render(force, options);
    setTimeout(() => {
      const inputField = $(this.form).find('#customFormula');
      inputField.select();
    }, 50);
  }
}
