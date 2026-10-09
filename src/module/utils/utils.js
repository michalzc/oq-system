import _ from 'lodash-es';

/**
 * `foundry.applications.handlebars.renderTemplate`, resolved at call time so modules using it can be imported in tests,
 * where the `foundry` global doesn't exist.
 */
export const renderTemplate = (...args) => foundry.applications.handlebars.renderTemplate(...args);

/**
 * Number as string with sign. In case of 0 it returns empty string.
 * @param {number} num
 * @returns {string} string representation with sing
 */
export function signedNumberOrEmpty(num) {
  if (!num) return '';
  else return num > 0 ? `+${num}` : `${num}`;
}

export const minMaxValue = (value) => inRangeValue(0, 100, value);

export const inRangeValue = (minimum, maximum, value) => Math.max(minimum, Math.min(maximum, value));

export const mostSignificantModifier = (left, right) =>
  Math.abs(left) === Math.abs(right) ? 0 : Math.abs(left) > Math.abs(right) ? left : right;

export const makeSlug = (name) => name.slugify().replace(/\(/g, '').replace(/\)/g, '');

export function flattenItemsFromFolder(folder) {
  return _.concat(
    folder.contents ?? [],
    _.flatMap(
      _.map(folder.children ?? [], (f) => f.folder),
      flattenItemsFromFolder,
    ),
  );
}

export async function asyncFlattenItemsFromFolder(folder) {
  const content = flattenItemsFromFolder(folder) ?? [];
  const retrieved = await Promise.all(content.map((elem) => (elem.uuid ? fromUuid(elem.uuid) : elem)));
  return _.map(retrieved, (item) => (item.toObject ? item.toObject(true) : item));
}

export function formatString(format, ...values) {
  return values.reduce((acc, value, index) => acc.replace(`{${index}}`, value), format);
}

/**
 * Copies of the characteristics with `label` and `abbr` localization keys, for rendering only.
 */
export const withCharacteristicLabels = (characteristics) =>
  withLabels(characteristics, 'OQ.Labels.CharacteristicsNames');

/**
 * Copies of the attributes with `label` and `abbr` localization keys, for rendering only.
 */
export const withAttributeLabels = (attributes) => withLabels(attributes, 'OQ.Labels.AttributesNames');

function withLabels(values, localizationPrefix) {
  return _.mapValues(values, (value, key) => ({
    ...value,
    label: `${localizationPrefix}.${key}.label`,
    abbr: `${localizationPrefix}.${key}.abbr`,
  }));
}

/**
 * Moves a legacy field to its new key in `migrateData` source. Legacy keys stay in the database until the document is
 * rewritten, so the new key wins once it is set - otherwise every load would overwrite later edits.
 */
export function renameLegacyField(source, oldKey, newKey, convert = (value) => value) {
  if (!(oldKey in source)) return;
  const value = source[oldKey];
  if (source[newKey] === undefined && value != null) source[newKey] = convert(value);
  delete source[oldKey];
}

const LEGACY_THEMED_ICON = /(systems\/oq\/assets\/icons\/)(?!cultist\.svg)([^/]+\.svg)$/;

/**
 * Moves a path of a recolorable system icon from the old `assets/icons/` location to `assets/icons/themed/`. Any other
 * path, including the NPC portrait which stays in place, is returned unchanged.
 * @param {string} path
 * @returns {string}
 */
export const themedIconPath = (path) => path.replace(LEGACY_THEMED_ICON, '$1themed/$2');
