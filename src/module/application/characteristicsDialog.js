import { log } from '../utils.js';

export class CharacteristicsDialog extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;

    return mergeObject(options, {
      classes: ['oq', 'dialog', 'characteristics'],
      width: 400,
      id: 'characteristics-dialog',
    });
  }

  constructor(object) {
    super(object);

    this.points = CharacteristicsDialog.calculatePoints(
      CONFIG.OQ.DefaultCharacteristics.characteristicPoints,
      CONFIG.OQ.DefaultCharacteristics.basePoints,
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
    const actorData = this.object.toObject(false);
    const points = this.points;
    return mergeObject(data, {
      actorData: actorData,
      system: actorData.system,
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
      let dialog = $(target).closest('.oq.dialog.characteristics');
      if (dialog) {
        const sum = dialog
          .find('.characteristic-base-input')
          .toArray()
          .map((e) => parseInt(e.value))
          .reduce((l, r) => l + r);

        const initial = dialog.find('.all-points').val();
        this.points = CharacteristicsDialog.calculatePoints(initial, CONFIG.OQ.DefaultCharacteristics.basePoints, sum);
        dialog.find('.spent-points').html(this.points.spent.toString());
        dialog.find('.remain-points').html(this.points.remain.toString());
      }
    }
  }

  async rollAllCharacteristics(event) {
    if (event.currentTarget) {
      const characteristicsBlock = event.currentTarget.closest('.chars-table');
      if (characteristicsBlock) {
        const rollPromises = Object.keys(CONFIG.OQ.DefaultCharacteristics.characteristicsRolls)
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
        const rolls = resolvedPromises.filter((e) => e && e[1]);

        const messageHtml = rolls.map(([key, roll]) => {
          const i18key = `OQ.Characteristics.${key}.label`;
          return `<label class="chat-label">${game.i18n.localize(i18key)}: </label> ${roll.total}`;
        });
        const message = `<div class="oq">${messageHtml.join('<br>')}</div>`;

        const messageData = {
          content: message,
          type: CONST.CHAT_MESSAGE_TYPES.ROLL,
          rolls: rolls.map((e) => e[1]),
          speaker: ChatMessage.getSpeaker(this.object),
          classes: ['oq'],
        };

        await ChatMessage.create(messageData);

        rolls.forEach(([key, roll]) => {
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
          const roll = new Roll(rolls).evaluate({ async: false });
          // const htmlRoll = await roll.render();
          charsTable.find(`#char-${key}-base`).val(roll.total);
          const messageContent = `<div class="oq"><label class="chat-label">${game.i18n.localize(
            `OQ.Characteristics.${key}.label`,
          )}</label>: ${roll.total}</div>`;
          const messageData = {
            content: messageContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            rolls: [roll],
            class: ['oq'],
            speaker: ChatMessage.getSpeaker(this.object),
          };
          this.updatePoints(event);
          await ChatMessage.create(messageData);
        }
      } catch (e) {
        log('Error during roll', e);
      }
    }
  }

  get template() {
    return 'systems/oq/templates/applications/characteristicsDialog.hbs';
  }

  async _updateObject(event, formData) {
    await this.object.update({ data: formData });
    this.object.sheet?.render(true);
  }
}
