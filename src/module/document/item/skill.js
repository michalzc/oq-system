import { OQBaseItem } from './baseItem.js';
import { roll } from '../../roll.js';

export class OQSkill extends OQBaseItem {
  prepareDerivedData() {
    super.prepareDerivedData();

    let skillTotal = this.getValue();
    const extendedData = {
      shortName: this.getShortName(),
      groupName: this.getGroupLabel(),
      value: skillTotal,
      mastered: skillTotal >= 100,
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
      const total = new Roll(formula, rollData).roll({ async: false }).total;

      return Math.min(100, Math.max(0, total));
    } else {
      return 0;
    }
  }

  async makeRoll(skipDialog) {
    if (skipDialog) {
      const speaker = ChatMessage.getSpeaker({ actor: this.actor, token: this.actor.token });
      await roll({
        mastered: this.system.mastered,
        speaker,
        rollType: 'skill',
        entityName: this.name,
        value: this.system.value,
      });
    } else {
      //TODO: implement
    }
  }
}
