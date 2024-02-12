import _ from 'lodash-es';

export class OQBaseActor extends Actor {
  static otherSkillsGroups = ['knowledge', 'practical', 'custom'];
  static combatItems = ['weapon', 'armour'];

  async _preCreate(source, options, userId) {
    await super._preCreate(source, options, userId);
    const newImage = CONFIG.OQ.ActorConfig.defaultIcons[source.type];
    if (!source.img && newImage) {
      this.updateSource({
        img: newImage,
        'prototypeToken.texture.src': newImage,
      });
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
    const skillsBySlug = this.getSkillsBySlug();

    _.merge(this.system, {
      attributes: this.calculateAttributes(),
      skillsBySlug,
    });
  }

  getRollData() {
    const rollData = super.getRollData();
    const charRollData = _.fromPairs(_.map(this.system.characteristics, (char, key) => [key, char.value]));
    const skills = _.fromPairs(
      this.items
        .filter((i) => i.type === 'skill')
        .map((skill) => [skill.system.slug, { value: skill.system.rollValue, mod: skill.system.rollMod }]),
    );

    const dm = this.system.attributes.dm.value;

    const newRollData = {
      ...charRollData,
      skills,
      dm,
    };

    return { ...rollData, ...newRollData };
  }

  getSkillsBySlug() {
    return _.fromPairs(this.items.filter((item) => item.type === 'skill').map((skill) => [skill.system.slug, skill]));
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

    const armourStatuses = CONFIG.OQ.ItemConfig.armourStates;

    const maxArmour = Math.max(
      0,
      ...this.items
        .filter(
          (item) =>
            item.type === 'armour' &&
            (item.system.state === armourStatuses.worn.key || item.system.state === armourStatuses.natural.key),
        )
        .map((armour) => armour.system.ap ?? 0),
    );

    const mrValue = attributes.mr.base + attributes.mr.mod;
    const apValue = attributes.ap.base + attributes.ap.mod + maxArmour;

    return _.merge(attributes, {
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
      initiative: {
        value: this.calculateInitiative(),
      },
    });
  }

  calculateInitiative() {
    const { reference, mod } = this.system.attributes.initiative;
    const initiativeItem = reference && this.items.get(reference);
    if (initiativeItem) {
      const { rollValue } = initiativeItem.getRollValues();

      return (rollValue ?? 0) + (mod ?? 0);
    }

    return mod ?? 0;
  }
}
