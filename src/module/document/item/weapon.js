import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { signedNumberOrEmpty } from '../../utils.js';
import { testRoll } from '../../roll.js';
import { OQTestRollDialog } from '../../application/dialog/test-roll-dialog.js';

export class OQWeapon extends OQBaseItem {
  async _preUpdate(changed, options, user) {
    await super._preUpdate(changed, options, user);

    const changedWeaponType = changed.system?.weaponType;
    const currentImage = this.img;
    const weaponIcons = CONFIG.OQ.ItemConfig.weaponIcons;
    const newImage = weaponIcons[changedWeaponType];

    if (
      changedWeaponType &&
      changedWeaponType !== this.system.weaponType &&
      _.includes(_.values(weaponIcons), currentImage) &&
      newImage
    ) {
      _.merge(changed, {
        img: weaponIcons[changedWeaponType],
      });
    }
  }

  get damageFormula() {
    const damage = this.system.damage.damageFormula;
    const includeDM = !!this.system.damage.includeDamageMod;
    const damageFormula = includeDM ? `${damage} ${this.parent.system.attributes.dm.value}` : damage;

    return this.makeRollString(damageFormula);
  }
  get isRollable() {
    if (this.parent) {
      const skillReference = this.system.correspondingSkill?.skillReference;
      const skills = this.parent.system.groupedItems?.groupedSkillBySlug;

      return skillReference && skills && _.includes(_.keys(skills), skillReference);
    } else return false;
  }

  get rollValue() {
    const correspondingSkill = this.system.correspondingSkill;
    if (this.parent && correspondingSkill?.skillReference) {
      const formula = `@skills.${correspondingSkill.skillReference} ${signedNumberOrEmpty(
        correspondingSkill.skillMod,
      )}`;
      const roll = new Roll(formula, this.parent.getRollData()).roll({ async: false });
      return roll.total;
    } else return 0;
  }

  /**
   * @param {boolean} skipDialog
   * @returns {Promise<void>}
   */
  async itemTestRoll(skipDialog) {
    //skipDialog) {
    if (this.parent) {
      const baseRollData = this.makeBaseTestRollData();

      const parentRollData = this.parent.getRollData();

      const skillReference = this.system.correspondingSkill?.skillReference;
      const value = skillReference && _.get(parentRollData, `skills.${skillReference}`);
      const modifier = this.system.correspondingSkill?.skillMod;
      const skillName = this.parent?.system.groupedItems.groupedSkillBySlug[skillReference];
      const rollData = {
        ...baseRollData,
        rollType: 'weapon',
        value,
        modifier,
        skillName,
      };
      if (skipDialog) {
        await testRoll(rollData);
      } else {
        const dialog = new OQTestRollDialog(rollData);
        dialog.render(true);
      }
    }
  }
}
