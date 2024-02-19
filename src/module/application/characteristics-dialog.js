import { logError } from '../utils.js';
import _ from 'lodash-es';

const mergeObject = foundry.utils.mergeObject;
export class CharacteristicsDialog extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;

    return mergeObject(options, {
      classes: ['oq', 'dialog', 'characteristics'],
      width: 400,
      id: 'characteristics-dialog',
      template: 'systems/oq/templates/applications/characteristics-dialog.hbs',
    });
  }

  constructor(object) {
    super(object);

    this.points = CharacteristicsDialog.calculatePoints(
      CONFIG.OQ.ActorConfig.characteristicsParams.characteristicPoints,
      CONFIG.OQ.ActorConfig.characteristicsParams.basePoints,
      Object.values(object.system.characteristics)
        .map((char) => char.base)
        .reduce((l, r) => l + r),
    );
  }

  static calculatePoints(points, basePoints, sum) {
    return {
      all: points,
      spent: sum - basePoints,
      remain: points - sum + basePoints,
    };
  }

  getData(options) {
    const data = super.getData(options);
    const points = this.points;
    let system = this.object.system;
    return mergeObject(data, {
      name: this.object.name,
      system,
      points,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('a.roll-characteristic').on('click', this.rollCharacteristic.bind(this));
    html.find('a.roll-all').on('click', this.rollAllCharacteristics.bind(this));
    html.find('.characteristic-base-input').on('change', this.updatePoints.bind(this));
    html.find('button[type=reset].reset').closest('form').on('reset', this.onFormReset.bind(this));
    html.find('.all-points').on('change', this.updatePoints.bind(this));
  }

  onFormReset(event) {
    const updatePoints = this.updatePoints.bind(this);
    setTimeout(function () {
      updatePoints(event);
    }, 1);
  }

  updatePoints(event) {
    const target = event.currentTarget;
    if (target) {
      const dialog = $(target).closest('.oq.dialog.characteristics');
      if (dialog) {
        const sum = dialog
          .find('.characteristic-base-input')
          .toArray()
          .map((e) => parseInt(e.value))
          .reduce((l, r) => l + r);

        const initial = dialog.find('.all-points').val();
        this.points = CharacteristicsDialog.calculatePoints(
          initial,
          CONFIG.OQ.ActorConfig.characteristicsParams.basePoints,
          sum,
        );
        dialog.find('.spent-points').html(this.points.spent.toString());
        dialog.find('.remain-points').html(this.points.remain.toString());
      }
    }
  }

  async rollAllCharacteristics(event) {
    if (event.currentTarget) {
      const characteristicsBlock = event.currentTarget.closest('.chars-table');
      if (characteristicsBlock) {
        const characteristicKeys = _.keys(this.object.system.characteristics);
        const rollPromises = characteristicKeys
          .map((key) => [key, `input[name="characteristics.${key}.roll"]`])
          .map(([key, selector]) => [key, $(characteristicsBlock).find(selector).val()])
          .filter(([, value]) => typeof value === 'string')
          .map(([key, value]) =>
            new Roll(value)
              .roll({ async: true })
              .then((result) => [key, result])
              .catch(() => undefined),
          );
        const resolvedPromises = await Promise.all(rollPromises);
        const rolls = _.fromPairs(resolvedPromises.filter((e) => e && e[1]));

        const content = await renderTemplate('systems/oq/templates/chat/parts/characteristics-roll.hbs', {
          rolls,
        });

        const messageData = {
          content: content,
          type: CONST.CHAT_MESSAGE_TYPES.ROLL,
          rolls: _.values(rolls),
          speaker: ChatMessage.getSpeaker(this.object),
        };

        await ChatMessage.create(messageData);

        _.forIn(rolls, (roll, key) => {
          $(characteristicsBlock).find(`#char-${key}-base`).val(roll.total);
        });

        this.updatePoints(event);
      }
    }
  }

  async rollCharacteristic(event) {
    if (event.currentTarget) {
      try {
        const elem = event.currentTarget;
        const key = elem.dataset['key'];
        const charsTable = $(event.currentTarget).closest('.chars-table');
        const selector = `input[name="characteristics.${key}.roll"]`;
        const rolls = charsTable.find(selector).val();
        if (typeof rolls === 'string') {
          const roll = await new Roll(rolls).evaluate({ async: true });

          const content = await renderTemplate('systems/oq/templates/chat/parts/characteristics-roll.hbs', {
            rolls: { [key]: roll },
          });
          const messageData = {
            content: content,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            rolls: [roll],
            class: ['oq'],
            speaker: ChatMessage.getSpeaker(this.object),
          };
          this.updatePoints(event);
          await ChatMessage.create(messageData);
          charsTable.find(`#char-${key}-base`).val(roll.total);
        }
      } catch (e) {
        logError('Error during roll', e);
      }
    }
  }

  async _updateObject(event, formData) {
    await this.object.update({ data: formData });
    this.object.sheet?.render(true);
  }
}
