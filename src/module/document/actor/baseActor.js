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
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this.system = mergeObject(this.system, {
      attributes: this.calculateAttributes(),
      groupedSkills: this.getSkills(),
    });
  }

  calculateAttributes() {
    const attributes = this.system.attributes;
    const characteristics = this.system.characteristics;
    const defaults = CONFIG.OQ.DefaultCharacteristics;

    const baseDM = defaults.damageModifierFunction(characteristics.str.value + characteristics.siz.value);
    const dmMod = attributes.dm.mod?.trim();
    const dmValue = dmMod
      ? dmMod.startsWith('+') || dmMod.startsWith('-')
        ? `${baseDM} ${dmMod}`
        : `${baseDM} + ${dmMod}`
      : baseDM;

    const hpMax = Math.round((characteristics.siz.value + characteristics.con.value) / 2) + attributes.hp.mod;
    const hpValue = Math.min(attributes.hp.value, hpMax);

    const mpMax = characteristics.pow.value + attributes.mp.mod;
    const mpValue = Math.min(mpMax, attributes.mp.value);

    const mrValue = attributes.mr.base + attributes.mr.mod;
    const apValue = attributes.ap.base + attributes.ap.mod;

    return {
      dm: {
        value: dmValue,
      },
      hp: {
        max: hpMax,
        value: hpValue,
      },
      mp: {
        max: mpMax,
        value: mpValue,
      },
      mr: {
        value: mrValue,
      },
      ap: {
        value: apValue,
      },
    };
  }

  getSkills() {
    const skills = this.items.filter((item) => item.type === 'skill');
    const groupedSkills = Object.fromEntries(
      skills.map((skill) => {
        const skillData = skill.system;
        return [skillData.groupName, skill];
      }),
    );
    log('Skills', groupedSkills);
    return groupedSkills;
  }
}
