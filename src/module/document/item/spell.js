import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { inRangeValue, renderTemplate } from '../../utils/utils.js';
import { evaluateTestRoll, postTestRoll } from '../../utils/roll.js';
import { isInSpellGroup, spellCastingCost } from '../../utils/magic.js';
import { createChatMessage } from '../../utils/chat.js';
import { promptSpellCast } from '../../application/spell-cast-dialog.js';

const SpellCastTemplate = 'systems/oq/templates/chat/parts/spell-cast.hbs';

// Casts of all spells on an actor share a queue on this client. Token actor UUIDs include the scene and token.
const castingQueues = new Map();

function enqueueCast(actor, cast) {
  const key = actor.uuid;
  const result = (castingQueues.get(key) ?? Promise.resolve()).then(cast);
  // Keep failures visible to the caller, without blocking later casts or retaining idle actors.
  const tail = result
    .catch(() => {})
    .finally(() => {
      if (castingQueues.get(key) === tail) castingQueues.delete(key);
    });
  castingQueues.set(key, tail);
  return result;
}

export class OQSpell extends OQBaseItem {
  getItemDataForChat() {
    const context = super.getItemDataForChat();
    return { ...context, traits: [...this.getTraits()], itemSubtypeLabel: this.typeLabel };
  }

  /**
   * The custom type name of a custom type spell, otherwise the localization key of the spell type.
   * @returns {string}
   */
  get typeLabel() {
    const { type, customTypeName } = this.system;
    const isCustom = type === CONFIG.OQ.ItemConfig.spellsTypes.custom;
    return (isCustom && customTypeName) || `OQ.Labels.SpellTypes.${type}`;
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
      spellTypeLabel: this.typeLabel,
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
    let castOptions;
    if (!skipDialog) {
      if (!this.castingSkill) return warn('OQ.Warnings.NoCastingSkill');
      const magnitude = this.castingMagnitude;
      const magicPoints = this.parent.system.attributes.mp.value;
      const variant = !this.system.nonVariant;
      if (magicPoints < (variant ? 1 : magnitude)) return warn('OQ.Warnings.NotEnoughMagicPoints');
      castOptions = await promptSpellCast({
        ...this.getTestRollData(),
        rollable: true,
        variant,
        maxMagnitude: variant ? Math.min(magnitude, magicPoints) : magnitude,
      });
      if (!castOptions) return;
    }

    const cast = await enqueueCast(this.parent, async () => {
      if (!this.castingSkill) return warn('OQ.Warnings.NoCastingSkill');
      const maxMagnitude = this.castingMagnitude;
      const magicPoints = this.parent.system.attributes.mp.value;
      const variant = !this.system.nonVariant;
      const options = skipDialog
        ? { magnitude: variant ? Math.min(maxMagnitude, magicPoints) : maxMagnitude }
        : castOptions;
      if (magicPoints < (variant ? 1 : maxMagnitude) || options.magnitude > magicPoints) {
        return warn('OQ.Warnings.NotEnoughMagicPoints');
      }
      if (!validMagnitude(options.magnitude, maxMagnitude, !variant)) return;

      const castRollData = { ...this.getTestRollData(), ...options };
      const testRollResult = await evaluateTestRoll(castRollData);
      // Dice fulfillment can wait for user input. Honor resource edits made during that wait too.
      const currentMagicPoints = this.parent.system.attributes.mp.value;
      if (options.magnitude > currentMagicPoints) return warn('OQ.Warnings.NotEnoughMagicPoints');
      const mpSpent = spellCastingCost(testRollResult.rollResult, options.magnitude);
      const updated = await this.parent.update({ 'system.attributes.mp.value': currentMagicPoints - mpSpent });
      if (!updated) return;
      return { castRollData, testRollResult, mpSpent };
    });
    if (cast) {
      await postTestRoll(cast.castRollData, cast.testRollResult, { rollable: true, mpSpent: cast.mpSpent });
    }
  }

  async castNoMagicPointsSpell(skipDialog) {
    let castOptions;
    if (!skipDialog) {
      if (this.expended) return warn('OQ.Warnings.SpellExpended');
      const variant = this.hasSplitDivineCasting;
      castOptions = await promptSpellCast({
        ...this.getTestRollData(),
        rollable: false,
        variant,
        maxMagnitude: variant ? this.system.remainingMagnitude : this.system.magnitude,
      });
      if (!castOptions) return;
    }

    const cast = await enqueueCast(this.parent, async () => {
      if (this.expended) return warn('OQ.Warnings.SpellExpended');
      const variant = this.hasSplitDivineCasting;
      const maxMagnitude = this.system.magnitude;
      const remaining = variant ? Math.min(this.system.remainingMagnitude, maxMagnitude) : maxMagnitude;
      const options = skipDialog ? { magnitude: remaining } : castOptions;
      if (!validMagnitude(options.magnitude, remaining, !variant)) return;

      const rollData = this.getTestRollData();
      const remainingMagnitude = remaining - options.magnitude;
      const updated = await this.castDivineSpell(remainingMagnitude);
      if (!updated) return;
      return { ...rollData, ...options, rollable: false, remainingMagnitude, maxMagnitude };
    });
    if (cast) {
      const content = await renderTemplate(SpellCastTemplate, cast);
      await createChatMessage({ speaker: cast.speaker, content }, cast.messageMode);
    }
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
   * @param {string} [customTypeName] Regains only the custom type spells of this name, with the custom spell type
   */
  static async regainAllDivineSpells(actor, spellType, customTypeName) {
    const updates = actor.items
      .filter((item) => item.type === 'spell' && item.spent && isInSpellGroup(item, spellType, customTypeName))
      .map((spell) => ({ _id: spell.id, 'system.remainingMagnitude': spell.system.magnitude }));
    if (updates.length) await actor.updateEmbeddedDocuments('Item', updates);
  }
}

function warn(messageKey) {
  ui.notifications.warn(messageKey, { localize: true });
}

function validMagnitude(magnitude, maxMagnitude, nonVariant) {
  if (
    Number.isInteger(magnitude) &&
    magnitude >= 1 &&
    magnitude <= maxMagnitude &&
    (!nonVariant || magnitude === maxMagnitude)
  ) {
    return true;
  }
  ui.notifications.warn(game.i18n.format('OQ.Warnings.InvalidMagnitude', { max: maxMagnitude }));
  return false;
}
