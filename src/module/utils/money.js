import _ from 'lodash-es';
export class OQMoneyService {
  constructor(moneyString) {
    this.moneyConfig = parseMoneyString(moneyString);
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
  return _.fromPairs(
    moneyString
      .split(',')
      .map((part) => part.trim())
      .map(fromGroup)
      .filter((part) => !!part),
  );
}
