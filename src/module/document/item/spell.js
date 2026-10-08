import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { inRangeValue, renderTemplate } from '../../utils/utils.js';
import { evaluateTestRoll, postTestRoll } from '../../utils/roll.js';
import { spellCastingCost } from '../../utils/magic.js';
import { createChatMessage } from '../../utils/chat.js';
import { promptSpellCast } from '../../application/spell-cast-dialog.js';

const SpellCastTemplate = 'systems/oq/templates/chat/parts/spell-cast.hbs';

export class OQSpell extends OQBaseItem {
  getItemDataForChat() {
    const context = super.getItemDataForChat();
    return { ...context, traits: [...this.getTraits()], itemSubtypeLabel: `OQ.Labels.SpellTypes.${this.system.type}` };
  }

  calculateRollValues() {
    // Skills are prepared before spells, so their roll values can be read as they are.
    const skill = this.castingSkill;
    return skill ? skill.getRollValues() : {};
  }

  get castingSkill() {
    const skillReference = this.system.skillReference;
    return (skillReference && this.parent?.system.skillsBySlug?.[skillReference]) || undefined;
  }

  getTestRollData() {
    const context = super.getTestRollData();
    return {
      ...context,
      rollType: 'spell',
      skillName: this.castingSkill?.name,
      spellTypeLabel: `OQ.Labels.SpellTypes.${this.system.type}`,
    };
  }

  /**
   * Casts the spell. Spells that cost magic points are rolled against their casting skill; spells with no magic
   * point cost use up their remaining magnitude instead.
   * @param {boolean} skipDialog Casts at the highest available magnitude without asking
   */
  async rollItemTest(skipDialog) {
    if (!this.parent) return this.sendItemToChat();
    if (this.noMagicPoints) return this.castNoMagicPointsSpell(skipDialog);
    return this.castMagicPointsSpell(skipDialog);
  }

  async castMagicPointsSpell(skipDialog) {
    const rollData = this.getTestRollData();
    if (!this.castingSkill) return warn('OQ.Warnings.NoCastingSkill');

    const magnitude = this.castingMagnitude;
    const magicPoints = this.parent.system.attributes.mp.value;
    const variant = !this.system.nonVariant;
    const minimalCost = variant ? 1 : magnitude;
    if (magicPoints < minimalCost) return warn('OQ.Warnings.NotEnoughMagicPoints');

    const castOptions = skipDialog
      ? { magnitude }
      : await promptSpellCast({
          ...rollData,
          rollable: true,
          variant,
          maxMagnitude: variant ? Math.min(magnitude, magicPoints) : magnitude,
        });
    if (!castOptions) return;
    if (castOptions.magnitude > magicPoints) return warn('OQ.Warnings.NotEnoughMagicPoints');

    const castRollData = { ...rollData, ...castOptions };
    const testRollResult = await evaluateTestRoll(castRollData);
    const mpSpent = spellCastingCost(testRollResult.rollResult, castOptions.magnitude);
    await this.parent.update({ 'system.attributes.mp.value': Math.max(0, magicPoints - mpSpent) });
    await postTestRoll(castRollData, testRollResult, { rollable: true, mpSpent });
  }

  async castNoMagicPointsSpell(skipDialog) {
    if (this.expended) return warn('OQ.Warnings.SpellExpended');

    const variant = this.hasSplitDivineCasting;
    const maxMagnitude = this.system.magnitude;
    const remaining = variant ? this.system.remainingMagnitude : maxMagnitude;
    const rollData = this.getTestRollData();

    const castOptions = skipDialog
      ? { magnitude: remaining }
      : await promptSpellCast({ ...rollData, rollable: false, variant, maxMagnitude: remaining });
    if (!castOptions) return;

    const remainingMagnitude = inRangeValue(0, remaining, remaining - castOptions.magnitude);
    await this.castDivineSpell(remainingMagnitude);

    const content = await renderTemplate(SpellCastTemplate, {
      ...rollData,
      ...castOptions,
      rollable: false,
      remainingMagnitude,
      maxMagnitude,
    });
    await createChatMessage({ speaker: rollData.speaker, content }, castOptions.messageMode);
  }

  /**
   * The magnitude a magic point spell is cast at by default. A spell always costs at least one magic point.
   * @returns {number}
   */
  get castingMagnitude() {
    return Math.max(1, this.system.magnitude ?? 0);
  }

  getTraits() {
    const constTraits = [
      this.hasSplitDivineCasting &&
        `${game.i18n.localize('OQ.Labels.RemainingMagnitude')}(${this.system.remainingMagnitude})`,
      this.system.magnitude && `${game.i18n.localize('OQ.Labels.Magnitude')}(${this.system.magnitude})`,
      this.system.expended && game.i18n.localize('OQ.Labels.Expended'),
      this.system.nonVariant && game.i18n.localize('OQ.Labels.NonVariable'),
      this.system.noMagicPoints && game.i18n.localize('OQ.Labels.NoMagicPoints'),
    ].filter((trait) => !!trait);
    return _.concat(constTraits, super.getTraits());
  }

  get hasSplitDivineCasting() {
    return this.system.hasSplitDivineCasting;
  }

  get expended() {
    return this.system.expended;
  }

  get noMagicPoints() {
    return this.system.noMagicPoints;
  }

  /**
   * Whether the spell has been cast and not yet regained, in part or in full.
   * @returns {boolean}
   */
  get spent() {
    return this.noMagicPoints && this.system.remainingMagnitude < this.system.magnitude;
  }

  async castDivineSpell(magnitude = 0) {
    if (this.noMagicPoints) {
      const update = inRangeValue(0, this.system.magnitude, magnitude);
      return this.update({ 'system.remainingMagnitude': update });
    }
  }

  async regainDivineSpell() {
    if (this.noMagicPoints) {
      return this.update({ 'system.remainingMagnitude': this.system.magnitude });
    }
  }

  /**
   * Regains every spent spell with no magic point cost of the actor in a single update.
   * @param {Actor} actor
   * @param {string} [spellType] Regains only the spells of this type
   */
  static async regainAllDivineSpells(actor, spellType) {
    const updates = actor.items
      .filter((item) => item.type === 'spell' && item.spent && (!spellType || item.system.type === spellType))
      .map((spell) => ({ _id: spell.id, 'system.remainingMagnitude': spell.system.magnitude }));
    if (updates.length) await actor.updateEmbeddedDocuments('Item', updates);
  }
}

function warn(messageKey) {
  ui.notifications.warn(messageKey, { localize: true });
}
