import { logError } from '../utils.js';

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
    const icon = CONFIG.OQ.ItemConfig.allItemsStates[state].icon ?? '';
    return new Handlebars.SafeString(icon);
  });
}
