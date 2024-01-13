import { OQBaseItem } from './baseItem.js';

export class OQSkill extends OQBaseItem {
  prepareDerivedData() {
    super.prepareDerivedData();

    const extendedData = {
      shortName: this.getShortName(),
      groupName: this.getGroupLabel(),
      value: this.getValue(),
    };

    this.system = mergeObject(this.system, extendedData);
  }

  getShortName() {
    return this.name.replace(/\s/g, '').replace('(', '_').replace(')', '');
  }

  getGroupLabel() {
    const group = this.system.group;
    if (group === 'custom') {
      return this.system.customGroupName;
    } else {
      return `OQ.SkillGroups.${group}`;
    }
  }

  getValue() {
    if (this.parent) {
      const rollData = this.parent.getRollData();
      const formula = `${this.system.formula} + ${this.system.mod}`;
      return new Roll(formula, rollData).roll({ async: false }).total;
    } else {
      return 0;
    }
  }
}
