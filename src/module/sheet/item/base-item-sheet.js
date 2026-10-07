import _ from 'lodash-es';

export class OQBaseItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ItemSheetV2,
) {
  static DEFAULT_OPTIONS = {
    // Keep the parchment palette until the sheets support both colour schemes.
    classes: ['oq', 'sheet', 'item', 'themed', 'theme-light'],
    position: { width: 640 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      deleteTrait: OQBaseItemSheet.onTagDelete,
    },
  };

  static PARTS = {
    sheet: {
      template: 'systems/oq/templates/item/item-sheet.hbs',
      scrollable: [''],
    },
  };

  #focusTraitInput = false;

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      { secrets: this.item.isOwner, relativeTo: this.item },
    );
    return Object.assign(context, {
      item: this.item,
      system: this.item.system,
      enrichedDescription,
    });
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    if (this.#focusTraitInput && this.isEditable) {
      this.element.querySelector('.tag-input')?.focus();
    }
    this.#focusTraitInput = false;
  }

  _onChangeForm(formConfig, event) {
    if (event.target.matches('.tag-input')) {
      if (this.isEditable) return this.onTagAdd(event);
      return;
    }
    return super._onChangeForm(formConfig, event);
  }

  static async onTagDelete(event, target) {
    event.preventDefault();
    if (!this.isEditable) return;
    const traitToDelete = target.dataset.tag;
    if (traitToDelete) {
      const traitList = this.item.system.traits;
      const newTraitList = _.without(traitList, traitToDelete);
      await this.item.update({
        'system.traits': newTraitList,
      });
    }
  }

  async onTagAdd(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    const input = event.target;
    const newTraits = (input.value ?? '').split(',').map((trait) => trait.trim());
    input.value = '';
    if (newTraits.some(Boolean)) {
      const traitList = this.item.system.traits;
      const allTraits = _.filter(_.sortedUniq(_.sortBy(_.concat(traitList, newTraits))), (trait) => !!trait);

      if (_.isEqual(traitList, allTraits)) return;
      this.#focusTraitInput = true;
      try {
        await this.item.update({ 'system.traits': allTraits });
      } catch (error) {
        this.#focusTraitInput = false;
        throw error;
      }
    }
  }
}
