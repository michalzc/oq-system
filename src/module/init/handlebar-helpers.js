import { logError } from '../utils.js';

export function registerHelpers() {
  Handlebars.registerHelper('choosePartial', function (name, context) {
    var partial = Handlebars.partials[name];
    if (!partial) {
      logError('Unknown partial: ', name);
      return '';
    }
    return new Handlebars.SafeString(partial(context));
  });
}
