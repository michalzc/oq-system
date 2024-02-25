import _ from 'lodash-es';

export class OQMoneyService {
  constructor(moneyString) {
    this.moneyConfig = parseMoneyString(moneyString);
    this.fields = this.buildFields(this.moneyConfig);
    this.multiplier = this.getMultiplier();
  }

  buildFields() {
    return _(this.moneyConfig)
      .mapValues((elem, key) => ({
        name: key,
        label: elem.label,
        multiplier: elem.multiplier,
      }))
      .values()
      .value();
  }

  getMultiplier() {
    const smaller = _.last(this.fields)?.multiplier;
    if (smaller) {
      const [, decNum] = smaller.toString().split('.');
      if (decNum) return Math.pow(10, decNum.length);
      else return 1;
    }
  }

  consolidateFlat(amount) {
    // eslint-disable-next-line no-unused-vars
    const { remains, ...recalculated } = _.reduce(
      this.fields,
      (newMoney, coinsDef) => {
        const { remains } = newMoney;
        const amount = Math.floor(remains / (coinsDef.multiplier * this.multiplier));
        const newRemains = Math.floor(remains % (coinsDef.multiplier * this.multiplier));
        return _.merge(newMoney, {
          [coinsDef.name]: { amount, label: coinsDef.label, multiplier: coinsDef.multiplier },
          remains: newRemains,
        });
      },
      { remains: amount * this.multiplier },
    );
    return _(recalculated)
      .mapValues((elem, key) => ({ ...elem, name: key }))
      .sortBy((elem) => -elem.multiplier)
      .value();
  }

  consolidate(money) {
    const recalculated = _(money)
      .mapValues((count, key) => {
        const ref = this.moneyConfig[key];
        return ref ? count * ref.multiplier : 0;
      })
      .values()
      .reduce((left, right) => left + right);

    return this.consolidateFlat(recalculated);
  }
}

const moneyRe = /^(?<label>[\s\w]+)\s+\((?<abbrevation>\w+)\)\s*=\s*(?<multiplier>\d+(\.\d+)?)$/;

function fromGroup(group) {
  const result = moneyRe.exec(group);
  if (result) {
    return [
      result.groups.abbrevation,
      { label: result.groups.label, multiplier: parseFloat(result.groups.multiplier) },
    ];
  }
}

export function parseMoneyString(moneyString) {
  return _(moneyString)
    .split(',')
    .map((part) => part.trim())
    .map(fromGroup)
    .filter((part) => !!part)
    .sortBy((elem) => -elem.modifier)
    .fromPairs()
    .value();
}

export function buildMoneyService() {
  const moneyString = game.settings.get(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.coinsConfiguration);
  if (moneyString) return new OQMoneyService(moneyString);
}
