import { OQActorBaseSheet } from './actor-base-sheet.js';
import _ from 'lodash-es';

export class OQNpcSheet extends OQActorBaseSheet {
  get template() {
    return 'systems/oq/templates/actor/npc-sheet.hbs';
  }

  async getData(options) {
    const context = await super.getData(options);
    const personal = this.actor.system.personal;
    const enrichedDescription = await TextEditor.enrichHTML(personal.description, { async: true });
    const enrichedShortDescription = await TextEditor.enrichHTML(personal.shortDescription, { async: true });
    return _.merge(context, {
      enrichedDescription,
      enrichedShortDescription,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.roll-characteristics').on('click', this.onRollCharacteristics.bind(this));
  }

  async onRollCharacteristics(event) {
    event.preventDefault();
    const characteristics = this.actor.system.characteristics;
    const rollsWithKey = _.toPairs(characteristics)
      .map(([key, characteristic]) => [
        key,
        characteristic.roll ? new Roll(characteristic.roll).roll({ async: false }) : null,
      ])
      .filter(([, roll]) => !!roll);
    const characteristicsToUpdate = {
      system: {
        characteristics: _.fromPairs(rollsWithKey.map(([key, roll]) => [key, { base: roll.total }])),
      },
    };
    await this.actor.update(characteristicsToUpdate);
    this.actor.sheet.render(true);
  }
}
