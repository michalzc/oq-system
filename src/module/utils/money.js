import _ from 'lodash-es';

export class OQMoneyService {
  constructor(moneyString) {
    this.moneyConfig = parseMoneyString(moneyString);
    this.fields = this.buildFields(this.moneyConfig);
    this.multiplier = this.getMultiplier();
    // Value of each coin in integer units of the smallest coin, so consolidation never touches floats.
    this.units = _.mapValues(this.moneyConfig, (coin) => Math.round(coin.multiplier * this.multiplier));
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
    const decimals = _.max(this.fields.map((field) => decimalPlaces(field.multiplier))) ?? 0;
    return Math.pow(10, decimals);
  }

  consolidateFlat(amount) {
    return this.consolidateUnits(Math.round((amount || 0) * this.multiplier));
  }

  consolidate(money) {
    const units = _(money)
      .map((count, key) => Math.round((count || 0) * (this.units[key] ?? 0)))
      .reduce((left, right) => left + right, 0);

    return this.consolidateUnits(units);
  }

  consolidateUnits(units) {
    let remains = units;
    return this.fields.map((coin) => {
      const unit = this.units[coin.name];
      const amount = Math.floor(remains / unit);
      remains = remains % unit;
      return { ...coin, amount };
    });
  }
}

function decimalPlaces(number) {
  const [, decimals = ''] = number.toString().split('.');
  return decimals.length;
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
    .sortBy(([, coin]) => -coin.multiplier)
    .fromPairs()
    .value();
}

export function buildMoneyService() {
  const moneyString = game.settings.get(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.coinsConfiguration);
  if (moneyString) return new OQMoneyService(moneyString);
}
