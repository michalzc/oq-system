import _ from 'lodash-es';

export class OQItemDirectory extends ItemDirectory {
  async _onDrop(event) {
    event.preventDefault();

    const rawData = event.dataTransfer.getData('text/plain');
    const data = rawData && JSON.parse(rawData);
    if (data && data.dragSource === CONFIG.OQ.SYSTEM_ID) {
      const folderId = this.findFolder(event);
      await Item.create(
        _.merge(data, {
          folder: folderId,
        }),
      );
    } else {
      return super._onDrop(event);
    }
  }

  findFolder(event) {
    const target = event.target.closest('.directory-item');
    const folder = target && target.closest('.folder');
    return folder && folder?.dataset?.folderId;
  }
}
