import _ from 'lodash-es';

export class OQBaseItemSheet extends ItemSheet {
  static get defaultOptions() {
    return _.merge(super.defaultOptions, {
      width: 640,
      classes: ['oq', 'sheet', 'item'],
      template: 'systems/oq/templates/item/item-sheet.hbs',
    });
  }

  async getData(options) {
    const data = super.getData(options);
    const system = this.item.system;
    const enrichedDescription = await TextEditor.enrichHTML(system.description, { async: true });
    return _.merge(data, {
      system,
      enrichedDescription,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.traits, .tag-input').on('change', this.onTagAdd.bind(this));
    html.find('.traits .tag-delete').on('click', this.onTagDelete.bind(this));
  }

  async onTagDelete(event) {
    event.preventDefault();
    const traitToDelete = event.currentTarget.dataset.tag;
    if (traitToDelete) {
      const traitList = this.item.system.traits;
      const newTraitList = _.without(traitList, traitToDelete);
      await this.item.update({
        'system.traits': newTraitList,
      });
      this.render(true);
    }
  }

  async onTagAdd(event) {
    event.preventDefault();
    const input = event.currentTarget;
    const newTrait = input.value;
    const traitList = this.item.system.traits;
    if (newTrait && !_.includes(traitList, newTrait)) {
      traitList.push(newTrait);
      await this.item.update({
        'system.traits': traitList,
      });

      const result = this.render(true);
      setTimeout(() => {
        $(result.form).find('.tag-input').focus();
      }, 50);
    }
  }
}
