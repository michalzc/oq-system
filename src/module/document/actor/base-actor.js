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

    _.merge(this.system, {
      attributes: this.calculateAttributes(),
      groupedItems: this.prepareGroupedItems(),
    });
  }

  getRollData() {
    const rollData = super.getRollData();
    const charRollData = Object.fromEntries(
      Object.entries(this.system.characteristics).map(([key, elem]) => [key, elem.value]),
    );
    const skills = Object.fromEntries(
      this.items.filter((i) => i.type === 'skill').map((skill) => [skill.system.slug, skill.system.value]),
    );
    const dm = this.system.attributes.dm.value;

    const newRollData = {
      ...charRollData,
      skills,
      dm,
    };

    return _.merge(rollData, newRollData);
  }

  getSkillsBySlug() {
    return _.fromPairs(
      this.items.filter((item) => item.type === 'skill').map((skill) => [skill.system.skillSlug, skill]),
    );
  }

  prepareGroupedItems() {
    const allItems = _.sortBy([...this.items], (item) => item.name);
    const groupedItems = _.groupBy(allItems, (item) => item.type);
    const skills = groupedItems.skill ?? [];
    const groupedSkills = _.groupBy(skills, (skill) => skill.system.group);

    const otherSkills = _.filter(skills, (skill) => _.includes(OQBaseActor.otherSkillsGroups, skill.system.group));
    const groupedSkillBySlug = _.fromPairs(skills.map((skill) => [skill.system.slug, skill.name]));

    const abilities = groupedItems.specialAbility ?? [];
    const skillsAndAbilities = _.concat(otherSkills, abilities);

    const magicSkills = groupedSkills.magic ?? [];
    const spells = groupedItems.spell ?? [];
    const magic = _.concat(magicSkills, spells);

    const combatSkills = groupedSkills.combat ?? [];
    const resistances = groupedSkills.resistance ?? [];
    const weapons = groupedItems.weapon ?? [];
    const armours = groupedItems.armour ?? [];
    const combat = _.concat(combatSkills, resistances, weapons, armours);

    const equipment = groupedItems.equipment ?? [];

    return {
      skills,
      combatSkills,
      resistances,
      groupedItems,
      groupedSkills,
      skillsAndAbilities,
      magic,
      combat,
      equipment,
      groupedSkillBySlug,
      weapons,
      armours,
    };
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
    });
  }
}
