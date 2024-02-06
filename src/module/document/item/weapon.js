import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { damageRoll, testRoll } from '../../roll.js';
import { OQTestRollDialog } from '../../application/dialog/test-roll-dialog.js';
import { OQDamageRollDialog } from '../../application/dialog/damage-roll-dialog.js';
import { mostSignificantModifier } from '../../utils.js';

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
    const [rollValue, rollMod] = this.getRollValues();
    const rollValueWithMod = rollValue && rollMod && rollValue + rollMod;
    const damageRollValue = this.getDamageRollValue();

    _.merge(this, {
      damageRollValue,
      rollMod,
      rollValue,
      rollValueWithMod,
      tooltip,
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

  getRollValues() {
    const correspondingSkill = this.system.correspondingSkill;
    if (this.parent && correspondingSkill?.skillReference) {
      const formula = `@skills.${correspondingSkill.skillReference}.value`;
      const skillModValueFormula = `@skills.${correspondingSkill.skillReference}.mod`;

      const valueRoll = new Roll(formula, this.parent.getRollData()).roll({ async: false }).total;
      const skillModRoll = new Roll(skillModValueFormula, this.parent.getRollData()).roll({ async: false }).total;
      const mod = mostSignificantModifier(skillModRoll ?? 0, this.system.skillReference?.skillMod ?? 0);
      return [valueRoll, mod];
    } else return [null, null];
  }

  /**
   * @param {boolean} skipDialog
   * @returns {Promise<void>}
   */
  async itemTestRoll(skipDialog) {
    const skillReference = this.system.correspondingSkill?.skillReference;

    const skillName = this.parent?.system.groupedItems.groupedSkillBySlug[skillReference];
    const rollData = _.merge(this.makeBaseTestRollData(), {
      rollType: 'weapon',
      value: this.rollValue,
      modifier: this.rollMod,
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
