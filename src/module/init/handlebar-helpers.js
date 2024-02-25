import { logError } from '../utils/logger.js';
import _ from 'lodash-es';

export function registerHelpers() {
  Handlebars.registerHelper('getPartial', function (name, context) {
    const partialPath = CONFIG.OQ.ItemConfig.itemSheetPartials[name];
    const partial = (partialPath && Handlebars.partials[partialPath]) || undefined;
    if (partial) {
      return new Handlebars.SafeString(partial(context));
    } else {
      logError('Unknown partial: ', name);
      return '';
    }
  });

  Handlebars.registerHelper('itemState', (state) => {
    const itemState = CONFIG.OQ.ItemConfig.allItemsStates[state];
    const icon = itemState?.icon ?? '';
    return new Handlebars.SafeString(icon);
  });

  Handlebars.registerHelper('propertyByName', function (obj, propertyName) {
    return obj && propertyName in obj && obj[propertyName];
  });

  Handlebars.registerHelper('consolidateFlat', (amount) => {
    const moneyService = game.oq.moneyService;
    if (moneyService) {
      const fields = moneyService.consolidateFlat(amount);
      const result = _(fields)
        .filter((field) => field.amount)
        .map((field) => `<span>${field.amount}${field.name}</span>`)
        .value()
        .join('&nbsp;');
      return new Handlebars.SafeString(result);
    } else {
      return new Handlebars.SafeString(amount);
    }
  });
}
