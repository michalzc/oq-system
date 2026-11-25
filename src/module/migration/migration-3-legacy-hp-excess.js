import _ from 'lodash-es';
import { convertLegacyHp, hasPoolList, RECOVERED_EXCESS_LABEL_KEY } from '../utils/resource-points.js';

const recoveredExcessLabel = () => game.i18n.localize(RECOVERED_EXCESS_LABEL_KEY);

/**
 * HP gains temporary-point pools (v0.9 resources). HP that earlier versions stored above the normal maximum is kept
 * as one "recovered excess" pool, and every actor stores its ordinary HP with its pool list.
 *
 * Loaded actors were already converted by their data model, so the Actor handler writes their HP as it is in memory;
 * stored HP without a pool list would be converted again, with the same result, on every load. Unlinked tokens keep
 * their own HP in the actor delta, which data models don't convert: a delta overriding HP gets its own pool list, so
 * it never inherits the base actor's recovery pool.
 */
export const legacyHpExcessMigration = {
  version: 3,
  name: 'Recovered HP excess',
  handlers: {
    Actor: (source) => {
      const hp = source.system?.attributes?.hp;
      if (!hp) return {};
      const { value, pools } = hasPoolList(hp)
        ? hp
        : convertLegacyHp(source.system.characteristics, hp, recoveredExcessLabel());
      return { system: { attributes: { hp: { value, pools } } } };
    },
    Token: (source, { worldActor }) => {
      const delta = source.delta?.system;
      const hp = delta?.attributes?.hp;
      if (source.actorLink || hp?.value === undefined || hasPoolList(hp)) return {};
      const base = worldActor(source.actorId)?.system;
      if (!base) return {};
      const characteristics = _.merge({}, base.characteristics, delta.characteristics);
      const stored = { mod: hp.mod ?? base.attributes?.hp?.mod, value: hp.value };
      const converted = convertLegacyHp(characteristics, stored, recoveredExcessLabel());
      return { delta: { system: { attributes: { hp: converted } } } };
    },
  },
};
