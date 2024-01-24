import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { signedNumberOrEmpty } from '../../utils.js';

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
    return (
      !!this.parent && (!!this.system.correspondingSkill?.skillReference || !!this.system.correspondingSkill?.skillMod)
    );
  }
  get rollString() {
    const correspondingSkill = this.system.correspondingSkill;
    // const skill =
    const formula = [
      correspondingSkill?.skillReference && `@skills.${correspondingSkill.skillReference}`,
      correspondingSkill?.skillMod && signedNumberOrEmpty(correspondingSkill.skillMod),
    ].join(' ');
    return this.makeRollString(formula);
  }
}
