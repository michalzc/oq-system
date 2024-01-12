import { log } from '../../utils.js';

export class OQBaseActor extends Actor {
  prepareBaseData() {
    super.prepareBaseData();
    const defaults = CONFIG.OQ.DefaultCharacteristics;
    const localizationPrefix = 'OQ.Characteristics.';

    const characteristics = Object.fromEntries(
      Object.entries(this.system.characteristics).map(([key, elem]) => {
        const value = elem.base + elem.mod;
        const label = `${localizationPrefix}${key}.label`;
        const abbr = `${localizationPrefix}${key}.abbr`;
        const roll = elem.roll ? elem.roll : defaults.characteristicsRolls[key];
        const base = elem.base;
        const mod = elem.mod;

        return [key, { value, label, abbr, roll, base, mod }];
      }),
    );

    const newData = {
      characteristics,
    };

    this.system = mergeObject(this.system, newData);
    log('OQBaseActor.prepareBaseData', this);
  }
}
