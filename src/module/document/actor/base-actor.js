import _ from 'lodash-es';

export class OQBaseActor extends Actor {
  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);

    const newIcon = CONFIG.OQ.ActorConfig.defaultIcons[data.type];
    if (!options.fromCompendium && newIcon) {
      await this.update({ img: newIcon });
    }
  }

  prepareBaseData() {
    super.prepareBaseData();
    const system = this.system;
    const characteristics = _.mapValues(system.characteristics, (characteristic) => {
      const value = characteristic.base + characteristic.mod;
      return {
        ...characteristic,
        value,
      };
    });
    _.merge(this.system, {
      characteristics,
    });
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this.system = _.merge(this.system, {
      skills: this.getSkills(),
      attributes: this.calculateAttributes(),
      groupedSkills: this.getGroupedSkills(),
    });
  }

  getRollData() {
    const rollData = super.getRollData();
    const charRollData = Object.fromEntries(
      Object.entries(this.system.characteristics).map(([key, elem]) => [key, elem.value]),
    );
    const skills = Object.fromEntries(
      this.items.filter((i) => i.type === 'skill').map((skill) => [skill.system.shortName, skill.system.value]),
    );

    const newRollData = {
      ...charRollData,
      skills,
    };

    return _.merge(rollData, newRollData);
  }

  getGroupedSkills() {
    const skills = this.getSkills();
    return _.groupBy(skills, (skill) => skill.system.groupName);
  }

  getSkills() {
    return this.items.filter((item) => item.type === 'skill');
  }

  getSkillsBySlug() {
    return _.fromPairs(
      this.items.filter((item) => item.type === 'skill').map((skill) => [skill.system.skillSlug, skill]),
    );
  }

  calculateAttributes() {
    const attributes = this.system.attributes;
    const characteristics = this.system.characteristics;
    const defaults = CONFIG.OQ.ActorConfig.characteristicsParams;

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

    return mergeObject(attributes, {
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
    });
  }
}
