import _ from 'lodash-es';

export class OQBaseItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ItemSheetV2,
) {
  static DEFAULT_OPTIONS = {
    // Keep the parchment palette until the sheets support both colour schemes.
    classes: ['oq', 'sheet', 'item', 'themed', 'theme-light'],
    position: { width: 640 },
    window: {
      resizable: true,
      controls: [
        {
          icon: 'fa-solid fa-user-plus',
          label: 'OQ.Labels.DefaultForNewActors',
          action: 'configureNewActor',
          visible: OQBaseItemSheet.canConfigureNewActor,
        },
      ],
    },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      deleteTrait: OQBaseItemSheet.onTagDelete,
      configureNewActor: OQBaseItemSheet.onConfigureNewActor,
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

  /**
   * `flags.oq.newActor` only matters for items that can end up in the default items compendium, so items of actors
   * don't offer it. Called with the sheet as `this`.
   * @returns {boolean}
   */
  static canConfigureNewActor() {
    return game.user.isGM && this.isEditable && !this.item.parent;
  }

  /**
   * Asks which actor types get the item when created, see `getDefaultItemsForActor`.
   */
  static async onConfigureNewActor() {
    if (!OQBaseItemSheet.canConfigureNewActor.call(this)) return;
    const actorTypes = game.documentTypes.Actor.filter((type) => type !== CONST.BASE_DOCUMENT_TYPE);
    const selectedTypes = this.item.getFlag(CONFIG.OQ.SYSTEM_ID, 'newActor') ?? [];
    const { createCheckboxInput, createFormGroup } = foundry.applications.fields;
    const checkboxes = actorTypes.map(
      (type) =>
        createFormGroup({
          label: CONFIG.Actor.typeLabels[type] ?? type,
          localize: true,
          input: createCheckboxInput({ name: type, value: selectedTypes.includes(type) }),
        }).outerHTML,
    );
    const hint = `<p class="hint">${game.i18n.localize('OQ.Hints.DefaultForNewActors')}</p>`;

    const result = await foundry.applications.api.DialogV2.input({
      window: { title: `${game.i18n.localize('OQ.Labels.DefaultForNewActors')}: ${this.item.name}` },
      content: hint + checkboxes.join(''),
    });
    if (!result) return;

    const newActorTypes = actorTypes.filter((type) => result[type]);
    if (newActorTypes.length) await this.item.setFlag(CONFIG.OQ.SYSTEM_ID, 'newActor', newActorTypes);
    else await this.item.unsetFlag(CONFIG.OQ.SYSTEM_ID, 'newActor');
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
