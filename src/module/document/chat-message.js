import { themedIconPath } from '../utils/utils.js';

/**
 * Chat cards keep the images they were rendered with. Migrating the content before it is rendered keeps the browser
 * from requesting the legacy system icon paths at all.
 */
export class OQChatMessage extends foundry.documents.ChatMessage {
  static migrateData(source, options) {
    if (source.content) source.content = themedIconPath(source.content);
    return super.migrateData(source, options);
  }
}
