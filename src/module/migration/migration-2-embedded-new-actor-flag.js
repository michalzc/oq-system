/**
 * Items in actors drop `flags.oq.newActor`, the mark of the items copied into new actors (#121). Copies made before
 * `OQBaseItem#_preCreate` cleared it kept the mark, so dragging one from an actor to the sidebar created another
 * default item. Items outside actors, in the world and in compendia, keep it.
 */
export const embeddedNewActorFlagMigration = {
  version: 2,
  name: 'Default item mark of items in actors',
  handlers: {
    // Embedded in an actor, or in the delta of an unlinked token.
    Item: (source, { parent, remove }) =>
      parent && source.flags?.oq?.newActor !== undefined ? { flags: { oq: { newActor: remove() } } } : {},
  },
};
