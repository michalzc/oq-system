import _ from 'lodash-es';
import { log } from '../../utils.js';

export class OQBaseActor extends Actor {
  static otherSkillsGroups = ['knowledge', 'practical', 'custom'];
  static combatItems = ['weapon', 'armour'];
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
    const groupedItems = _.groupBy([...this.items], (item) => item.type);
    const skills = groupedItems.skill ?? [];
    const groupedSkills = _.groupBy(skills, (skill) => skill.system.group);
    const groupedSkillByGroupName = _.groupBy(skills, (skill) => skill.system.groupName);
    const otherSkills = _.filter(skills, (skill) => _.includes(OQBaseActor.otherSkillsGroups, skill.system.group));
    const groupedSkillBySlug = _.fromPairs(skills.map((skill) => [skill.system.slug, skill.name]));
    log('Skills by slug', groupedSkillBySlug);

    const abilities = groupedItems.specialAbility ?? [];
    const skillsAndAbilities = _.concat(otherSkills, abilities);

    const magicSkills = groupedSkills.magic ?? [];
    const spells = groupedItems.spell ?? [];
    const magic = _.concat(magicSkills, spells);

    const combatSkills = groupedSkills.combat ?? [];
    const resistances = groupedSkills.resistance ?? [];
    const weapons = groupedItems.weapon ?? [];
    const armour = groupedItems.armour ?? [];
    const combat = _.concat(combatSkills, resistances, weapons, armour);

    const equipment = groupedItems.equipment ?? [];

    return {
      skillsAndAbilities,
      magic,
      combat,
      equipment,
      groupedSkillByGroupName,
      groupedSkillBySlug,
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
