const LEGACY_THEMED_ICONS = /(systems\/oq\/assets\/icons\/)(?!cultist\.svg)([\w-]+\.svg)/g;

/**
 * Moves paths of recolorable system icons from the old `assets/icons/` location to `assets/icons/themed/`, in a single
 * path or in every path found in HTML content. Any other path, including the NPC portrait which stays in place, is left
 * unchanged.
 * @param {string} text
 * @returns {string}
 */
export const themedIconPath = (text) => text.replace(LEGACY_THEMED_ICONS, '$1themed/$2');

/** Item types whose `system` fields were renamed in 0.6.0. Their data models still rename the keys on load. */
const RENAMED_FIELDS_TYPES = ['skill', 'weapon', 'equipment'];

/** Adds `{[key]: migrated value}` to the changes when the string at `key` holds a legacy icon path. */
function migratePath(changes, key, value) {
  if (typeof value !== 'string') return changes;
  const migrated = themedIconPath(value);
  if (migrated !== value) changes[key] = migrated;
  return changes;
}

/**
 * Icons moved to `assets/icons/themed/` (#152), and the legacy keys of the 0.6.0 field renames are dropped from the
 * database: skill `group` and `customGroupName`, weapon `weaponType` and equipment `consumable`.
 */
export const themedIconsMigration = {
  version: 1,
  name: 'Themed icons and 0.6.0 field renames',
  handlers: {
    Actor: (source) => {
      const changes = migratePath({}, 'img', source.img);
      return migratePath(changes, 'prototypeToken.texture.src', source.prototypeToken?.texture?.src);
    },
    // Loaded items already carry the renamed fields, so writing their whole `system` back drops the legacy keys.
    Item: (source, { replace }) => {
      const changes = migratePath({}, 'img', source.img);
      if (RENAMED_FIELDS_TYPES.includes(source.type)) changes.system = replace(source.system);
      return changes;
    },
    // Unlinked tokens keep their own image in the actor delta, set only when it overrides the base actor.
    Token: (source) => {
      const changes = migratePath({}, 'texture.src', source.texture?.src);
      return migratePath(changes, 'delta.img', source.delta?.img);
    },
    ChatMessage: (source) => migratePath({}, 'content', source.content),
    Macro: (source) => migratePath({}, 'img', source.img),
    JournalEntryPage: (source) => {
      const changes = migratePath({}, 'src', source.src);
      return migratePath(changes, 'text.content', source.text?.content);
    },
  },
};
