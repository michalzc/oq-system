import { OQBaseActor } from './base-actor.js';
import _ from 'lodash-es';

export class OQCharacterActor extends OQBaseActor {
  prepareDerivedData() {
    super.prepareDerivedData();

    _.merge(this.system, this.prepareSkills(), this.prepareCombatData());
  }

  prepareSkills() {
    const skills = this.system.groupedItems.skills;
    const groupedSkillByGroupName = _.groupBy(skills, (skill) => skill.system.groupName);
    return {
      groupedItems: {
        groupedSkillByGroupName,
      },
    };
  }
  prepareCombatData() {
    return {};
  }
}
