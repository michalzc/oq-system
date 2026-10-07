import _ from 'lodash-es';
import { logError } from '../utils/logger.js';
import { renderTemplate, withCharacteristicLabels } from '../utils/utils.js';
import { createChatMessage, evaluateRoll } from '../utils/chat.js';
import { OQActorDialog } from './actor-dialog.js';

export class CharacteristicsDialog extends OQActorDialog {
  static DEFAULT_OPTIONS = {
    classes: ['characteristics'],
    position: { width: 400 },
    actions: {
      rollCharacteristic: CharacteristicsDialog.rollCharacteristic,
      rollAllCharacteristics: CharacteristicsDialog.rollAllCharacteristics,
      resetForm: CharacteristicsDialog.onFormReset,
    },
  };

  static PARTS = {
    form: {
      template: 'systems/oq/templates/applications/characteristics-dialog.hbs',
    },
  };

  get title() {
    return `${game.i18n.localize('OQ.Labels.EditCharacteristics')}: ${this.actor.name}`;
  }

  static calculatePoints(points, basePoints, sum) {
    return {
      all: points,
      spent: sum - basePoints,
      remain: points - sum + basePoints,
    };
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const characteristicsParams = CONFIG.OQ.ActorConfig.characteristicsParams;
    const sum = _.sum(_.map(this.actor.system.characteristics, (char) => char.base));
    return Object.assign(context, {
      characteristics: withCharacteristicLabels(this.actor.system.characteristics),
      points: CharacteristicsDialog.calculatePoints(
        characteristicsParams.characteristicPoints,
        characteristicsParams.basePoints,
        sum,
      ),
    });
  }

  _onChangeForm(formConfig, event) {
    if (event.target.matches('.characteristic-base-input, .all-points')) this.updatePoints();
    return super._onChangeForm(formConfig, event);
  }

  static onFormReset() {
    this.form.reset();
    this.updatePoints();
  }

  updatePoints() {
    const sum = _.sum(
      Array.from(this.element.querySelectorAll('.characteristic-base-input'), (input) => parseInt(input.value)),
    );
    const all = parseInt(this.element.querySelector('.all-points').value);
    const points = CharacteristicsDialog.calculatePoints(
      all,
      CONFIG.OQ.ActorConfig.characteristicsParams.basePoints,
      sum,
    );
    this.element.querySelector('.spent-points').textContent = points.spent.toString();
    this.element.querySelector('.remain-points').textContent = points.remain.toString();
  }

  getRollFormula(key) {
    return this.element.querySelector(`input[name="system.characteristics.${key}.roll"]`)?.value;
  }

  setBaseValue(key, value) {
    this.element.querySelector(`input[name="system.characteristics.${key}.base"]`).value = value;
  }

  async postRolls(rolls) {
    const content = await renderTemplate('systems/oq/templates/chat/parts/characteristics-roll.hbs', { rolls });
    await createChatMessage({
      content,
      rolls: _.values(rolls),
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    });
  }

  static async rollAllCharacteristics() {
    const rollPromises = _.keys(this.actor.system.characteristics)
      .map((key) => [key, this.getRollFormula(key)])
      .filter(([, formula]) => typeof formula === 'string')
      .map(([key, formula]) =>
        evaluateRoll(new Roll(formula))
          .then((result) => [key, result])
          .catch(() => undefined),
      );
    const resolvedPromises = await Promise.all(rollPromises);
    const rolls = _.fromPairs(resolvedPromises.filter((e) => e && e[1]));

    await this.postRolls(rolls);
    _.forIn(rolls, (roll, key) => this.setBaseValue(key, roll.total));
    this.updatePoints();
  }

  static async rollCharacteristic(event, target) {
    try {
      const key = target.dataset.key;
      const formula = this.getRollFormula(key);
      if (typeof formula === 'string') {
        const roll = await evaluateRoll(new Roll(formula));
        await this.postRolls({ [key]: roll });
        this.setBaseValue(key, roll.total);
        this.updatePoints();
      }
    } catch (e) {
      logError('Error during roll', e);
    }
  }
}
