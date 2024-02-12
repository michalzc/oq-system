import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { damageRoll } from '../../roll.js';
import { OQDamageRollDialog } from '../../application/dialog/damage-roll-dialog.js';
import { minMaxValue, mostSignificantModifier } from '../../utils.js';

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

    const tooltip = await this.getTooltipWithTraits();

    const damageRollValue = this.getDamageRollValue();

    _.merge(this.system, {
      damageRollValue,
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

  async rollItemDamage(skipDialog = true) {
    const actorRollData = this.parent.getRollData();
    const damageFormula = this.system.damage.damageFormula;
    const includeDM = !!this.system.damage.includeDamageMod;
    const rollData = _.merge(this.getTestRollData(), {
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

      const parentRollData = this.parent.getRollData();
      const rollValue = minMaxValue(new Roll(formula, parentRollData).roll({ async: false }).total);
      const skillModRoll = new Roll(skillModValueFormula, parentRollData).roll({ async: false }).total;
      const rollMod = mostSignificantModifier(skillModRoll ?? 0, correspondingSkill?.skillMod ?? 0);
      const rollValueWithMod = rollMod && minMaxValue(rollValue + rollMod);
      return {
        rollValue,
        rollMod,
        rollValueWithMod,
      };
    } else return {};
  }

  getTestRollData() {
    const context = super.getTestRollData();

    const skillReference = this.system.correspondingSkill?.skillReference;
    const skillName = this.parent?.system.skillsBySlug[skillReference];
    return _.merge(context, {
      rollType: 'weapon',
      value: this.system.rollValue,
      modifier: this.system.rollMod,
      skillName,
    });
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();

    const { correspondingSkill, hands, encumbrance, rangeFormula, rate, cost, damage } = this.system;
    const parentSystem = this.parent?.system;
    const skillName =
      correspondingSkill?.skillReference &&
      parentSystem?.groupedItems?.groupedSkillBySlug[correspondingSkill.skillReference];

    const fields = [
      skillName && { label: `OQ.Labels.Skill`, value: skillName },
      encumbrance && { label: 'OQ.Labels.Enc', value: encumbrance },
      hands && { label: `OQ.Labels.Hands`, value: game.i18n.localize(`OQ.Labels.WeaponHands.${hands}`) },
      rangeFormula && { label: `OQ.Labels.Range`, value: rangeFormula },
      rate && { label: `OQ.Labels.FireRate`, value: rate },
      cost && { label: `OQ.Labels.Cost`, value: cost },
      damage?.damageFormula && {
        label: `OQ.Labels.Damage`,
        value: `${damage.damageFormula} ${damage.includeDamageMod ? parentSystem?.attributes?.dm?.value ?? '' : ''}`,
      },
    ].filter((item) => !!item);

    return _.merge(context, {
      itemSubtypeLabel: `OQ.Labels.WeaponTypes.${this.system.weaponType}`,
      fields,
    });
  }
}
