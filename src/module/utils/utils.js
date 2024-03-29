import _ from 'lodash-es';

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
