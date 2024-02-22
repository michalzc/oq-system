import _ from 'lodash-es';
import { testRoll } from '../roll.js';

export class OQTestRollDialog extends FormApplication {
  constructor(object, options) {
    super(object, options);
    this.difficultyLevels = CONFIG.OQ.RollConfig.difficultyLevels;
    this.rollData = object;
  }

  static get defaultOptions() {
    const options = super.defaultOptions;

    return _.merge(options, {
      classes: ['oq', 'dialog', 'roll'],
      width: 400,
      id: 'roll-test-dialog',
      template: 'systems/oq/templates/applications/test-roll-dialog.hbs',
    });
  }

  activateListeners(html) {
    html.find('.cancel-button').on('click', this.onCancel.bind(this));
  }

  async onCancel(event) {
    event.preventDefault();
    await this.close();
  }

  getData(options = {}) {
    const context = super.getData(options);
    const defaultDifficulty = 'normal';
    const difficulties = _.fromPairs(
      _.keys(this.difficultyLevels).map((key) => [
        key,
        `${game.i18n.localize(`OQ.Labels.DifficultyLevels.${key}`)} (${this.difficultyLevels[key]}%)`,
      ]),
    );

    return _.merge(context, {
      ...this.rollData,
      difficulties,
      defaultDifficulty,
    });
  }

  // eslint-disable-next-line no-unused-vars
  async _updateObject(event, formData) {
    const difficultyKey = formData.difficulty;
    const difficulty = difficultyKey && { key: difficultyKey, value: this.difficultyLevels[difficultyKey] };
    const mod = formData.mod;
    await testRoll(
      _.merge(this.rollData, {
        difficulty,
        mod,
      }),
    );
  }

  async _render(force, options) {
    await super._render(force, options);
    setTimeout(() => {
      const inputField = $(this.form).find('#modifier');
      inputField.select();
    }, 50);
  }
}
