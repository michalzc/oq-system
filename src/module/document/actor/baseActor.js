import _ from 'lodash-es';

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
      skills: this.getSkills(),
    });
    this.system.groupedSkills = this.getGroupedSkills();
  }

  getRollData() {
    const rollData = super.getRollData();
    const charRollData = Object.fromEntries(
      Object.entries(this.system.characteristics).map(([key, elem]) => [key, elem.value]),
    );
    const skillData = Object.fromEntries(
      this.items.filter((i) => i.type === 'skill').map((skill) => [skill.system.shortName, skill.system.value]),
    );

    const newRollData = {
      ...charRollData,
      ...skillData,
    };

    return mergeObject(rollData, newRollData);
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

  getGroupedSkills() {
    const skills = this.getSkills();
    return _.groupBy(skills, (skill) => skill.system.groupName);
  }

  getSkills() {
    return this.items.filter((item) => item.type === 'skill');
  }
}
