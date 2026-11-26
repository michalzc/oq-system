import { OQBaseItem } from './base-item.js';
import { minMaxValue, mostSignificantModifier } from '../../utils/utils.js';
import { weaponDamage } from '../../utils/effect-contributions.js';

export class OQWeapon extends OQBaseItem {
  /**
   * The damage formula with the Damage Modifier and, after it, the damage terms of the weapon's "this item" effects.
   * `formula` is the whole formula as written, which the damage roll dialog starts from; `effects` holds the breakdown
   * when effects add terms.
   */
  calculateDamageRollValues() {
    if (this.parent) {
      const damage = this.system.damage;
      const dmValue = this.parent.system.attributes.dm.value;
      const damageFormula = damage.damageFormula;
      const includeDM = !!damage.includeDamageMod;
      const result = weaponDamage({ formula: damageFormula, dm: includeDM ? dmValue : '' }, this.effects);
      if (result.formula) {
        return {
          damageFormula,
          formula: result.formula,
          finalDamageFormula: this.makeRollString(result.formula),
          includeDM,
          // The formula without effects as the sheet shows formulas.
          effects: result.contributions.length
            ? { ...result, unmodified: this.makeRollString(result.unmodified) }
            : undefined,
        };
      }
    }
  }

  calculateRollValues() {
    const correspondingSkill = this.system.correspondingSkill;
    if (this.parent && correspondingSkill?.skillReference) {
      // Skills are prepared before weapons, so their roll values can be read as they are.
      const skill = this.parent.system.skillsBySlug?.[correspondingSkill.skillReference];
      if (skill) {
        const skillRollValues = skill.getRollValues();
        const { value, learnedValue } = skillRollValues;

        const mod = mostSignificantModifier(skillRollValues.mod ?? 0, correspondingSkill?.skillMod ?? 0);
        const valueWithMod = mod && minMaxValue(skillRollValues.value + mod);
        return {
          value,
          learnedValue,
          mod,
          valueWithMod,
        };
      }
    }

    return {};
  }

  getTestRollData() {
    const context = super.getTestRollData();

    const skillReference = this.system.correspondingSkill?.skillReference;
    const skill = this.parent?.system.skillsBySlug[skillReference];
    const skillName = skill?.name;
    return {
      ...context,
      rollType: 'weapon',
      skillName,
    };
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();

    const { correspondingSkill, hands, encumbrance, rangeFormula, rate, cost, damage } = this.system;
    const parentSystem = this.parent?.system;
    const skillName = parentSystem?.skillsBySlug?.[correspondingSkill?.skillReference]?.name;

    const fields = [
      skillName && { label: `OQ.Labels.Skill`, value: skillName },
      encumbrance && { label: 'OQ.Labels.Enc', value: encumbrance },
      hands && { label: `OQ.Labels.Hands`, value: game.i18n.localize(`OQ.Labels.WeaponHands.${hands}`) },
      rangeFormula && { label: `OQ.Labels.Range`, value: rangeFormula },
      rate && { label: `OQ.Labels.FireRate`, value: rate },
      cost && { label: `OQ.Labels.Cost`, value: cost },
      damage?.damageFormula && {
        label: `OQ.Labels.Damage`,
        value: this.system.damageRollValues?.formula ?? damage.damageFormula,
      },
    ].filter((item) => !!item);

    return {
      ...context,
      itemSubtypeLabel: `OQ.Labels.WeaponTypes.${this.system.type}`,
      fields,
    };
  }
}
