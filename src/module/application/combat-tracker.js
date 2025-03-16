import { log } from '../utils/logger.js';
import _ from 'lodash-es';

export class OQCombatTracker extends CombatTracker {
  get template() {
    return 'systems/oq/templates/applications/combat-tracker.hbs';
  }

  async getData(options = {}) {
    const baseData = await super.getData(options);
    const initiatives =
      baseData.combat &&
      _.fromPairs(baseData.combat.turns.map((elem) => [elem.id, elem.actor?.system.attributes?.initiative]));
    log('Got data', baseData);

    if (initiatives) {
      log('Initiatives', initiatives);
      const turns = baseData.turns.map((turn) => {
        const initiativeName = initiatives[turn.id]?.name;
        return _.merge(turn, { initiativeName });
      });
      return _.merge(baseData, { turns });
    } else {
      return baseData;
    }
  }
}
