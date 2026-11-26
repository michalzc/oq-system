import _ from 'lodash-es';
import { convertLegacyMp, hasPoolList, RECOVERED_EXCESS_LABEL_KEY } from '../utils/resource-points.js';

const recoveredExcessLabel = () => game.i18n.localize(RECOVERED_EXCESS_LABEL_KEY);

/**
 * MP gains temporary-point pools (v0.9 resources), the same way migration 3 did for HP. MP that earlier versions
 * stored above the normal maximum is kept as one "recovered excess" pool, and every actor stores its ordinary MP with
 * its pool list.
 *
 * Loaded actors were already converted by their data model, so the Actor handler writes their MP as it is in memory.
 * Unlinked tokens keep their own MP in the actor delta, which data models don't convert: a delta overriding MP gets
 * its own pool list, so it never inherits the base actor's recovery pool.
 */
export const legacyMpExcessMigration = {
  version: 4,
  name: 'Recovered MP excess',
  handlers: {
    Actor: (source) => {
      const mp = source.system?.attributes?.mp;
      if (!mp) return {};
      const { value, pools } = hasPoolList(mp)
        ? mp
        : convertLegacyMp(source.system.characteristics, mp, recoveredExcessLabel());
      return { system: { attributes: { mp: { value, pools } } } };
    },
    Token: (source, { worldActor }) => {
      const delta = source.delta?.system;
      const mp = delta?.attributes?.mp;
      if (source.actorLink || mp?.value === undefined || hasPoolList(mp)) return {};
      const base = worldActor(source.actorId)?.system;
      if (!base) return {};
      const characteristics = _.merge({}, base.characteristics, delta.characteristics);
      const stored = { mod: mp.mod ?? base.attributes?.mp?.mod, value: mp.value };
      const converted = convertLegacyMp(characteristics, stored, recoveredExcessLabel());
      return { delta: { system: { attributes: { mp: converted } } } };
    },
  },
};
