import { themedIconPath } from '../utils/utils.js';

/** Placed tokens keep their own copy of the image, so legacy system icon paths are migrated here as well. */
export class OQTokenDocument extends foundry.documents.TokenDocument {
  static migrateData(source, options) {
    if (source.texture?.src) source.texture.src = themedIconPath(source.texture.src);
    return super.migrateData(source, options);
  }
}
