import { logError } from '../utils/logger.js';

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
}
