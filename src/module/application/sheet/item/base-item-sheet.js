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

    if (this.isEditable) {
      html.find('.traits, .tag-input').on('change', this.onTagAdd.bind(this));
      html.find('.traits .tag-delete').on('click', this.onTagDelete.bind(this));
    }
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
    const newTraits = (input.value ?? '').split(',').map((trait) => trait.trim());
    if (newTraits) {
      const traitList = this.item.system.traits;
      const allTraits = _.filter(_.sortedUniq(_.sortBy(_.concat(traitList, newTraits))), (trait) => !!trait);

      await this.item.update({
        'system.traits': allTraits,
      });

      const result = this.render(true);
      setTimeout(() => {
        $(result.form).find('.tag-input').focus();
      }, 50);
    }
  }
}
