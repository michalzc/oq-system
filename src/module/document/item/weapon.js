import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { signedNumberOrEmpty } from '../../utils.js';
import { damageRoll, testRoll } from '../../roll.js';
import { OQTestRollDialog } from '../../application/dialog/test-roll-dialog.js';
import { OQDamageRollDialog } from '../../application/dialog/damage-roll-dialog.js';

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

  async prepareDerivedData() {
    super.prepareDerivedData();
    const tooltip = await this.tooltipWithTraits();
    const rollValue = this.getRollValue();
    const damageRollValue = this.getDamageRollValue();

    _.merge(this, {
      tooltip,
      rollValue,
      damageRollValue,
    });
  }

  getDamageRollValue() {
    if (this.parent) {
      const damageEntity = this.system.damage;
      const dmValue = this.parent.system.attributes.dm.value;
      if (damageEntity.damageFormula || (damageEntity.includeDamageMod && dmValue)) {
        const damage = damageEntity.damageFormula;
        const includeDM = !!damageEntity.includeDamageMod;
        const damageFormula = (includeDM ? `${damage} ${dmValue}` : damage).trim();

        return this.makeRollString(damageFormula);
      }
    }

    return null;
  }

  async makeDamageRoll(skipDialog = true) {
    const actorRollData = this.parent.getRollData();
    const damageFormula = this.system.damage.damageFormula;
    const includeDM = !!this.system.damage.includeDamageMod;
    const rollData = _.merge(this.makeBaseTestRollData(), {
      actorRollData,
      damageFormula,
      includeDM,
    });

    if (skipDialog) await damageRoll(rollData);
    else {
      const rollDialog = new OQDamageRollDialog(rollData);
      rollDialog.render(true);
    }
  }

  getRollValue() {
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
    const parentRollData = this.parent.getRollData();

    const skillReference = this.system.correspondingSkill?.skillReference;
    const value = skillReference && _.get(parentRollData, `skills.${skillReference}`);
    const modifier = this.system.correspondingSkill?.skillMod;
    const skillName = this.parent?.system.groupedItems.groupedSkillBySlug[skillReference];
    const rollData = _.merge(this.makeBaseTestRollData(), {
      rollType: 'weapon',
      value,
      modifier,
      skillName,
    });

    if (skipDialog) {
      await testRoll(rollData);
    } else {
      const dialog = new OQTestRollDialog(rollData);
      dialog.render(true);
    }
  }
}
