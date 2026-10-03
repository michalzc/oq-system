import { OQActorBaseSheet } from './actor-base-sheet.js';
import _ from 'lodash-es';
import { OQNPCShortDescriptionEdit } from '../../application/short-desc-editor.js';

export class OQNpcSheet extends OQActorBaseSheet {
  static DEFAULT_OPTIONS = {
    actions: {
      rollCharacteristics: OQNpcSheet.onRollCharacteristics,
      editShortDescription: OQNpcSheet.onEditShortDescription,
    },
  };

  static PARTS = {
    sheet: {
      template: 'systems/oq/templates/actor/npc-sheet.hbs',
      scrollable: ['.sheet-content .tab.active'],
    },
  };

  static TABS = {
    primary: {
      tabs: [
        { id: 'details', label: 'OQ.Nav.Details' },
        { id: 'description', label: 'OQ.Nav.Description' },
      ],
      initial: 'details',
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const personal = this.actor.system.personal;
    return Object.assign(context, {
      enrichedDescription: await this.enrichHTML(personal.description),
      enrichedShortDescription: await this.enrichHTML(personal.shortDescription),
    });
  }

  static async onRollCharacteristics(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    const characteristics = this.actor.system.characteristics;
    const asyncRolls = _.toPairs(characteristics).map(([key, characteristic]) => {
      const rollPromise = characteristic.roll ? new Roll(characteristic.roll).evaluate() : Promise.resolve(null);
      return rollPromise.then((rollResult) => [key, rollResult]);
    });
    const rolls = Promise.all(asyncRolls);
    const rollsWithKey = (await rolls).filter(([, roll]) => !!roll);
    const characteristicsToUpdate = {
      system: {
        characteristics: _.fromPairs(rollsWithKey.map(([key, roll]) => [key, { base: roll.total }])),
      },
    };
    await this.actor.update(characteristicsToUpdate);
  }

  static async onEditShortDescription(event) {
    event.preventDefault();
    if (!this.isEditable) return;

    const dialog = new OQNPCShortDescriptionEdit(this.actor);
    dialog.render(true);
  }
}
