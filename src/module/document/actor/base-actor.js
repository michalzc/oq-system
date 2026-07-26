import _ from 'lodash-es';
import { getDefaultItemsForActor } from '../../utils/compendium-utils.js';

export class OQBaseActor extends Actor {
  static otherSkillsTypes = ['knowledge', 'practical', 'custom'];
  static combatItems = ['weapon', 'armour'];

  static getDefaultArtwork(actorData) {
    const actorConfig = CONFIG.OQ.ActorConfig;
    const img = actorConfig.defaultIcons[actorData.type];

    if (img) {
      return {
        img,
        'prototypeToken.texture.src': img,
      };
    } else {
      return super.getDefaultArtwork(actorData);
    }
  }

  async _preCreate(source, options, userId) {
    await super._preCreate(source, options, userId);

    if (!source.items) {
      const defaultItems = await getDefaultItemsForActor(source.type);
      if (defaultItems) {
        this.updateSource({
          items: defaultItems,
        });
      }
    }
  }

  /**
   * Level 1 - attributes derived from characteristics alone. Runs before the embedded items are
   * prepared, so items may safely rely on everything published here through getDataForItems.
   */
  prepareBaseData() {
    super.prepareBaseData();
    _.merge(this.system.attributes, this.calculateBaseAttributes());
  }

  /**
   * Level 2 - embedded items, prepared in dependency order. Weapons resolve their roll values from
   * the skill they correspond to, so every skill has to be ready before the remaining items start.
   */
  prepareEmbeddedDocuments() {
    const [skills, otherItems] = _.partition(this.items.contents, (item) => item.type === 'skill');

    skills.forEach((skill) => skill._safePrepareData());
    this.system.skillsBySlug = this.getSkillsBySlug();
    otherItems.forEach((item) => item._safePrepareData());

    // Actor#hierarchy covers items and effects - the latter have no ordering requirements.
    this.effects.forEach((effect) => effect._safePrepareData());
    this.applyActiveEffects();
  }

  /**
   * Level 3 - attributes which need the prepared items.
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    _.merge(this.system.attributes, this.calculateItemDependentAttributes());
  }

  /**
   * Actor data an embedded item is allowed to read while it prepares itself. At that point the
   * actor is only partially prepared, so this is deliberately limited to level 1 attributes plus
   * the skills prepared so far - anything else does not exist yet and must not be reached for.
   *
   * @returns {object}
   */
  getDataForItems() {
    const characteristics = _.mapValues(this.system.characteristics, (char) => char.value);

    return {
      ...characteristics,
      dm: this.system.attributes.dm.value,
      skills: this.getSkillsRollData(),
    };
  }

  getRollData() {
    return {
      ...super.getRollData(),
      ...this.getDataForItems(),
    };
  }

  getSkillsRollData() {
    return _.mapValues(this.system.skillsBySlug ?? {}, (skill) => ({
      value: skill.system.rollValues?.value,
      mod: skill.system.rollValues?.mod,
    }));
  }

  getSkillsBySlug() {
    return _.fromPairs(this.items.filter((item) => item.type === 'skill').map((skill) => [skill.system.slug, skill]));
  }

  calculateBaseAttributes() {
    const attributes = this.system.attributes;
    const characteristics = this.system.characteristics;

    const hpMax = Math.round((characteristics.siz.value + characteristics.con.value) / 2) + attributes.hp.mod;
    const mpMax = characteristics.pow.value + attributes.mp.mod;

    return {
      dm: {
        value: this.calculateDamageModifier(),
      },
      hp: {
        max: hpMax,
        value: Math.min(attributes.hp.value, hpMax),
      },
      mp: {
        max: mpMax,
        value: Math.min(mpMax, attributes.mp.value),
      },
      mr: {
        value: attributes.mr.base + attributes.mr.mod,
      },
    };
  }

  calculateItemDependentAttributes() {
    const attributes = this.system.attributes;

    return {
      ap: {
        value: attributes.ap.base + attributes.ap.mod + this.calculateArmourPoints(),
      },
      initiative: this.calculateInitiative(),
    };
  }

  calculateDamageModifier() {
    const characteristics = this.system.characteristics;
    const defaults = CONFIG.OQ.ActorConfig.characteristicsParams;

    const baseDM = defaults.damageModifierFunction(characteristics.str.value + characteristics.siz.value);
    const dmMod = this.system.attributes.dm.mod?.trim();

    if (!dmMod) return baseDM;
    return dmMod.startsWith('+') || dmMod.startsWith('-') ? `${baseDM} ${dmMod}` : `${baseDM} + ${dmMod}`;
  }

  calculateArmourPoints() {
    const armourStatuses = CONFIG.OQ.ItemConfig.armourStates;

    return Math.max(
      0,
      ...this.items
        .filter(
          (item) =>
            item.type === 'armour' &&
            (item.system.state === armourStatuses.worn.key || item.system.state === armourStatuses.natural.key),
        )
        .map((armour) => armour.system.ap ?? 0),
    );
  }

  calculateInitiative() {
    const { reference, mod } = this.system.attributes.initiative;
    const initiativeItem = reference && this.items.get(reference);
    if (initiativeItem) {
      const { value } = initiativeItem.getRollValues();

      return { value: (value ?? 0) + (mod ?? 0), name: initiativeItem.name };
    }

    return { value: mod ?? 0 };
  }
}
