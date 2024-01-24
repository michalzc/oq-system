import { OQBaseItem } from './base-item.js';
import { roll } from '../../roll.js';
import { skillRollDialog } from '../../application/skill-roll-dialog.js';
import _ from 'lodash-es';

export class OQSkill extends OQBaseItem {
  prepareDerivedData() {
    super.prepareDerivedData();

    let skillTotal = this.getValue();
    const extendedData = {
      slug: this.name.slugify().replace(/\(/g, '').replace(/\)/g, ''),
      groupName: this.getGroupLabel(),
      value: skillTotal,
      mastered: skillTotal >= 100,
    };

    this.system = _.merge(this.system, extendedData);
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
    const speaker = ChatMessage.getSpeaker({ actor: this.actor, token: this.actor.token });
    const rollData = {
      img: this.img,
      mastered: this.system.mastered,
      speaker,
      rollType: 'skill',
      entityName: this.name,
      value: this.system.value,
    };
    if (skipDialog) {
      await roll(rollData);
    } else {
      await skillRollDialog(speaker, rollData);
    }
  }
}
