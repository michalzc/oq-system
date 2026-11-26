import _ from 'lodash-es';
import { getDefaultItemsForActor } from '../../utils/compendium-utils.js';
import {
  activeEffectChanges,
  attributeContribution,
  effectiveCharacteristics,
  normalMaximums,
} from '../../utils/effect-contributions.js';
import { getDeclaration } from '../../utils/initiative.js';
import {
  applyBarInput,
  availablePoints,
  availableTemporaryPoints,
  convertLegacyResources,
  correctPool,
  grantPool,
  hasPoolList,
  RECOVERED_EXCESS_LABEL_KEY,
  removePool,
  restorePoints,
  setOrdinaryPoints,
  spendPoints,
  temporaryPointResourceOfBar,
} from '../../utils/resource-points.js';

/**
 * Writes derived values onto the prepared attribute objects, keeping their stored fields (`base`, `mod`, ...). Every
 * derived key is assigned, even when `undefined`, so repeated data preparation never leaves stale values behind.
 */
function assignAttributes(attributes, derived) {
  for (const [key, values] of Object.entries(derived)) Object.assign(attributes[key], values);
}

export class OQBaseActor extends Actor {
  static otherSkillsTypes = ['knowledge', 'practical', 'custom'];

  static getDefaultArtwork(actorData) {
    const actorConfig = CONFIG.OQ.ActorConfig;
    const img = actorConfig.defaultIcons[actorData.type];

    if (img) {
      return {
        img,
        texture: {
          src: img,
        },
      };
    } else {
      return super.getDefaultArtwork(actorData);
    }
  }

  async _preCreate(source, options, userId) {
    if ((await super._preCreate(source, options, userId)) === false) return false;

    // Values in the creation data win, so duplicated and imported actors keep their own token settings.
    const tokenDefaults = CONFIG.OQ.ActorConfig.prototypeTokenDefaults;
    const prototypeToken = foundry.utils.mergeObject(
      foundry.utils.mergeObject(tokenDefaults.base, tokenDefaults[source.type] ?? {}),
      source.prototypeToken ?? {},
      { inplace: false },
    );
    this.updateSource({ prototypeToken });

    // Creation data is cleaned without data model migration, so legacy HP and MP in raw data (a macro creating an
    // actor from an old export) are converted here. Data copied from a loaded document already has its pool lists,
    // and new actors get empty ones from the schema.
    const label = game.i18n.localize(RECOVERED_EXCESS_LABEL_KEY);
    const converted = convertLegacyResources(this._source.system.characteristics, source.system?.attributes, label);
    if (!_.isEmpty(converted)) this.updateSource({ system: { attributes: converted } });

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
    // The OpenQuest changes of the actor's own effects, read once per preparation; item effects get their roles in
    // later chunks.
    this.effectChanges = activeEffectChanges(this.effects);
    this.applyCharacteristicEffects();
    assignAttributes(this.system.attributes, this.calculateBaseAttributes());
  }

  /**
   * Replaces each characteristic's `value` with its effective value, after effects. Its `unmodified` value (base plus
   * native modifier) stays, and `effects` holds the breakdown when effects change it. Everything else reads the
   * effective value, except the MP normal maximum and skills' learned values.
   */
  applyCharacteristicEffects() {
    const characteristics = this.system.characteristics;
    const effective = effectiveCharacteristics(
      _.mapValues(characteristics, (characteristic) => characteristic.unmodified),
      this.effectChanges,
    );
    for (const [key, result] of Object.entries(effective)) {
      characteristics[key].value = result.value;
      characteristics[key].effects = result.contributions.length ? result : undefined;
    }
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
    // Only changes made by macros or modules: OQActiveEffect#shouldApplyChange skips OpenQuest changes.
    this.applyActiveEffects('initial');
  }

  /**
   * Level 3 - attributes which need the prepared items.
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    assignAttributes(this.system.attributes, this.calculateItemDependentAttributes());
  }

  /**
   * Actor data an embedded item is allowed to read while it prepares itself. At that point the
   * actor is only partially prepared, so this is deliberately limited to level 1 attributes plus
   * the skills prepared so far - anything else does not exist yet and must not be reached for.
   *
   * @param {object} [options]
   * @param {boolean} [options.learned] unmodified characteristics and learned skill values, without effects, for
   *   skills' learned values; effective ones otherwise
   * @returns {object}
   */
  getDataForItems({ learned = false } = {}) {
    const characteristics = _.mapValues(this.system.characteristics, (char) =>
      learned ? char.unmodified : char.value,
    );

    return {
      ...characteristics,
      dm: learned ? this.calculateDamageModifier({ learned }) : this.system.attributes.dm.value,
      skills: this.getSkillsRollData({ learned }),
    };
  }

  getRollData() {
    return {
      ...super.getRollData(),
      ...this.getDataForItems(),
    };
  }

  getSkillsRollData({ learned = false } = {}) {
    return _.mapValues(this.system.skillsBySlug ?? {}, (skill) => ({
      value: learned ? skill.system.rollValues?.learnedValue : skill.system.rollValues?.value,
      mod: skill.system.rollValues?.mod,
    }));
  }

  getSkillsBySlug() {
    return _.fromPairs(this.items.filter((item) => item.type === 'skill').map((skill) => [skill.system.slug, skill]));
  }

  calculateBaseAttributes() {
    const attributes = this.system.attributes;
    const { hp: hpMax, mp: mpMax } = normalMaximums(this.system.characteristics, {
      hp: attributes.hp.mod,
      mp: attributes.mp.mod,
    });

    return {
      dm: {
        value: this.calculateDamageModifier(),
      },
      hp: {
        max: hpMax,
        value: Math.min(attributes.hp.value, hpMax),
        temporary: availableTemporaryPoints(attributes.hp.pools),
      },
      mp: {
        max: mpMax,
        value: Math.min(mpMax, attributes.mp.value),
        temporary: availableTemporaryPoints(attributes.mp.pools),
      },
      mr: this.effectAttribute('mr', attributes.mr.base + attributes.mr.mod),
    };
  }

  calculateItemDependentAttributes() {
    const attributes = this.system.attributes;

    return {
      ap: this.effectAttribute('ap', attributes.ap.base + attributes.ap.mod + this.calculateArmourPoints()),
      initiative: this.calculateInitiative(),
    };
  }

  /**
   * An attribute's effective value and, when effects change it, the breakdown shown in the sheet tooltip.
   * @param {string} target a key of `EFFECT_TARGETS`
   * @param {number} unmodified the value without effects
   * @returns {{value: number, effects: object|undefined}}
   */
  effectAttribute(target, unmodified) {
    const result = attributeContribution(target, unmodified, this.effectChanges);
    return { value: result.value, effects: result.contributions.length ? result : undefined };
  }

  /**
   * @param {object} [options]
   * @param {boolean} [options.learned] from unmodified STR and SIZ, without effects; effective ones otherwise
   * @returns {string}
   */
  calculateDamageModifier({ learned = false } = {}) {
    const { str, siz } = this.system.characteristics;
    const defaults = CONFIG.OQ.ActorConfig.characteristicsParams;

    const baseDM = defaults.damageModifierFunction(learned ? str.unmodified + siz.unmodified : str.value + siz.value);
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
    const declaration = getDeclaration(this);
    return { value: declaration.total, name: declaration.name || undefined };
  }

  /**
   * The stored temporary-point pools of a resource, in spending order. Read from the source, the base every pool
   * update starts from; preparation never changes pools.
   * @param {string} resource `hp` or `mp`
   * @returns {object[]}
   */
  temporaryPools(resource) {
    const pools = this._source.system.attributes[resource]?.pools;
    if (!hasPoolList({ pools })) throw new Error(`${resource} has no temporary points`);
    return pools;
  }

  /**
   * Grants temporary points as a new pool, spent after every existing one. On an unlinked token's actor the pool
   * belongs to that token only.
   * @param {string} resource `hp` or `mp`
   * @param {number} amount a nonnegative whole number, without an upper cap
   * @param {string} [label] shown in the pool editor; a blank label becomes "Manual"
   * @returns {Promise<OQBaseActor|undefined>}
   */
  async grantTemporaryPoints(resource, amount, label) {
    const grant = {
      id: foundry.utils.randomID(),
      label: label?.trim() || game.i18n.localize('OQ.Resources.Manual'),
      amount,
    };
    return this.#updatePools(resource, grantPool(this.temporaryPools(resource), grant));
  }

  /**
   * Corrects the remaining amount of a pool without moving it in the spending order.
   * @param {string} resource `hp` or `mp`
   * @param {string} poolId
   * @param {number} remaining a nonnegative whole number
   * @returns {Promise<OQBaseActor|undefined>}
   */
  async correctTemporaryPool(resource, poolId, remaining) {
    return this.#updatePools(resource, correctPool(this.temporaryPools(resource), poolId, remaining));
  }

  /**
   * Removes a pool, discarding only its remaining points.
   * @param {string} resource `hp` or `mp`
   * @param {string} poolId
   * @returns {Promise<OQBaseActor|undefined>}
   */
  async removeTemporaryPool(resource, poolId) {
    return this.#updatePools(resource, removePool(this.temporaryPools(resource), poolId));
  }

  #updatePools(resource, pools) {
    return this.update({ [`system.attributes.${resource}.pools`]: pools });
  }

  /**
   * A resource's points as the resource-points module works with them: the prepared ordinary current (already
   * within the normal maximum), the normal maximum and the stored pools.
   * @param {string} resource `hp` or `mp`
   * @returns {import('../../utils/resource-points.js').ResourceState}
   */
  resourceState(resource) {
    const { value, max } = this.system.attributes[resource];
    return { value: Math.max(0, value), max, pools: this.temporaryPools(resource) };
  }

  /**
   * Damage after armour: temporary HP first, the oldest pool first, then ordinary HP, floored at zero.
   * @param {number} amount a nonnegative whole number
   * @returns {Promise<{fromPools: number, fromOrdinary: number}>} the HP actually taken from each
   */
  async damageHp(amount) {
    return this.#spend('hp', amount);
  }

  /**
   * Healing: restores ordinary HP up to the normal maximum and never refills temporary HP.
   * @param {number} amount a nonnegative whole number
   * @returns {Promise<{restored: number}>} the ordinary HP actually restored
   */
  async healHp(amount) {
    return this.#restore('hp', amount);
  }

  /**
   * Sets ordinary HP, as typed on the sheet, clamped to zero and the normal maximum. Temporary HP is untouched.
   * @param {number} value a whole number
   * @returns {Promise<OQBaseActor|undefined>}
   */
  async setOrdinaryHp(value) {
    return this.#setOrdinary('hp', value);
  }

  /**
   * Spends MP: temporary MP first, the oldest pool first, then ordinary MP, floored at zero.
   * @param {number} amount a nonnegative whole number
   * @returns {Promise<{fromPools: number, fromOrdinary: number}>} the MP actually taken from each
   */
  async spendMp(amount) {
    return this.#spend('mp', amount);
  }

  /**
   * Regains MP: restores ordinary MP up to the normal maximum and never creates or refills temporary MP.
   * @param {number} amount a nonnegative whole number
   * @returns {Promise<{restored: number}>} the ordinary MP actually restored
   */
  async gainMp(amount) {
    return this.#restore('mp', amount);
  }

  /**
   * Sets ordinary MP, as typed on the sheet, clamped to zero and the normal maximum. Temporary MP is untouched.
   * @param {number} value a whole number
   * @returns {Promise<OQBaseActor|undefined>}
   */
  async setOrdinaryMp(value) {
    return this.#setOrdinary('mp', value);
  }

  /**
   * The MP that can be spent: ordinary MP plus temporary MP.
   * @returns {number}
   */
  availableMp() {
    return availablePoints(this.resourceState('mp'));
  }

  /** The public methods that change each resource with pools, by resource. */
  static #resourceRouteNames = {
    hp: { setOrdinary: 'setOrdinaryHp', spend: 'damageHp', restore: 'healHp' },
    mp: { setOrdinary: 'setOrdinaryMp', spend: 'spendMp', restore: 'gainMp' },
  };

  /**
   * The public methods that change a resource with pools, for routes that serve either resource (sheet, token HUD).
   * They call the named methods (`damageHp`, `spendMp`, ...), so whatever those do reaches every route.
   * @param {string} resource `hp` or `mp`
   * @returns {{setOrdinary: Function, spend: Function, restore: Function}} each taking a whole number of points, as
   *   `setOrdinaryHp`, `damageHp` and `healHp` do for HP
   */
  resourceRoutes(resource) {
    const names = OQBaseActor.#resourceRouteNames[resource];
    if (!names) throw new Error(`No resource with temporary points: ${resource}`);
    return _.mapValues(names, (name) => (amount) => this[name](amount));
  }

  async #spend(resource, amount) {
    const before = this.resourceState(resource);
    const { state, fromPools, fromOrdinary } = spendPoints(before, amount);
    await this.#updateResource(resource, before, state);
    return { fromPools, fromOrdinary };
  }

  async #restore(resource, amount) {
    const before = this.resourceState(resource);
    const { state, restored } = restorePoints(before, amount);
    await this.#updateResource(resource, before, state);
    return { restored };
  }

  async #setOrdinary(resource, value) {
    const before = this.resourceState(resource);
    return this.#updateResource(resource, before, setOrdinaryPoints(before, value).state);
  }

  /**
   * Stores what changed in a resource's ordinary current and pools, in one update.
   * @returns {Promise<OQBaseActor|undefined>} undefined when nothing changed
   */
  async #updateResource(resource, before, after) {
    const changes = OQBaseActor.#resourceChanges(resource, before, after);
    return _.isEmpty(changes) ? undefined : this.update(changes);
  }

  /**
   * The update data of a resource change. Unchanged pools are not written, so healing or a typed value never
   * overwrites a pool edited elsewhere meanwhile.
   */
  static #resourceChanges(resource, before, after) {
    const changes = {};
    if (after.value !== before.value) changes[`system.attributes.${resource}.value`] = after.value;
    if (!_.isEqual(after.pools, before.pools)) changes[`system.attributes.${resource}.pools`] = after.pools;
    return changes;
  }

  /**
   * A value typed into a token HUD bar input. On the HP and MP bars it agrees with chat and sheet: "-N" is damage or
   * spending, taking temporary points first, "+N" restores ordinary points up to the maximum, and a plain number sets
   * ordinary points, clamped. Other attributes keep core behaviour.
   *
   * The core `modifyTokenAttribute` hook sees the resulting update and may veto it. The change is then made by the
   * resource methods, like every other HP and MP route, with the same result; a hook that rewrites the update takes
   * over instead.
   * @override
   */
  async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
    const resource = temporaryPointResourceOfBar(attribute);
    if (!resource || !isBar) return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
    const amount = Math.trunc(Number(value));
    if (!Number.isFinite(amount)) return this;
    const before = this.resourceState(resource);
    const updates = OQBaseActor.#resourceChanges(resource, before, applyBarInput(before, amount, isDelta).state);
    if (_.isEmpty(updates)) return this;
    const preview = foundry.utils.deepClone(updates);
    if (Hooks.call('modifyTokenAttribute', { attribute, value, isDelta, isBar }, updates, this) === false) return this;
    if (!_.isEqual(updates, preview)) return this.update(updates);
    const routes = this.resourceRoutes(resource);
    if (!isDelta) await routes.setOrdinary(amount);
    else if (amount < 0) await routes.spend(-amount);
    else await routes.restore(amount);
    return this;
  }
}
