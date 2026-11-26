/**
 * Action handlers of the effects lists on actor and item sheets, called with the sheet as `this`. Each row carries
 * `data-effect-id`, naming an effect of the sheet's document.
 */

/**
 * The effect of the list row holding the element.
 * @param {foundry.applications.api.DocumentSheetV2} sheet
 * @param {HTMLElement} element
 * @returns {ActiveEffect|undefined}
 */
export function effectFromElement(sheet, element) {
  const effectId = element.closest('[data-effect-id]')?.dataset.effectId;
  return effectId ? sheet.document.effects.get(effectId) : undefined;
}

export function editEffect(event, target) {
  event.preventDefault();
  // Viewers get the effect editor in read-only mode.
  effectFromElement(this, target)?.sheet.render(true);
}

export async function deleteEffect(event, target) {
  event.preventDefault();
  if (!this.isEditable) return;
  await effectFromElement(this, target)?.delete();
}

export async function toggleEffect(event, target) {
  event.preventDefault();
  if (!this.isEditable) return;
  const effect = effectFromElement(this, target);
  if (effect) await effect.update({ disabled: !effect.disabled });
}
