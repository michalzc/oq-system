import _ from 'lodash-es';
import { currentMessageMode } from '../utils/chat.js';
import { renderTemplate } from '../utils/utils.js';

/**
 * Shows a roll dialog with Roll and Cancel buttons and waits for it to close. The content template also gets
 * `rootId`, for unique field ids, and the message modes for its visibility selector. The dialog focuses the
 * template's `autofocus` field, which comes before the default button, and its value is selected. The confirm button
 * is disabled while a field breaks its constraints (`min`, `max`, `step`, `required`), because the dialog buttons
 * submit without the browser's form validation.
 * @param {object} config
 * @param {string} config.title     The window title
 * @param {string} config.template  The content template
 * @param {object} config.context   The content template context
 * @param {object} [config.button]  The label and icon of the confirm button, Roll by default
 * @returns {Promise<object|null>}  The form data, or null if the dialog was cancelled or closed
 */
export async function openRollDialog({ title, template, context, button = {} }) {
  const content = document.createElement('div');
  content.innerHTML = await renderTemplate(template, {
    ...context,
    rootId: foundry.utils.randomID(),
    messageModes: _.mapValues(CONFIG.ChatMessage.modes, (mode) => mode.label),
    messageMode: currentMessageMode(),
  });

  const result = await foundry.applications.api.DialogV2.wait({
    // Keep the parchment palette until the dialogs support both colour schemes.
    classes: ['oq', 'oq-dialog', 'roll', 'themed', 'theme-light'],
    window: { title },
    position: { width: 400 },
    content,
    buttons: [
      {
        action: 'roll',
        label: button.label ?? 'OQ.Dialog.Roll',
        icon: button.icon ?? 'fas fa-dice',
        default: true,
        callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
      },
      { action: 'cancel', label: 'OQ.Dialog.Cancel', icon: 'fas fa-cancel' },
    ],
    render: (event, dialog) => {
      dialog.element.querySelector('.dialog-content [autofocus]')?.select();
      guardFormValidity(dialog.element.querySelector('form'), dialog.element.querySelector('[data-action="roll"]'));
    },
  });
  return result === 'cancel' ? null : result;
}

/**
 * Keeps the confirm button disabled while the form is invalid and shows why next to the offending field.
 * @param {HTMLFormElement} form
 * @param {HTMLButtonElement} confirmButton
 */
function guardFormValidity(form, confirmButton) {
  if (!form || !confirmButton) return;
  form.addEventListener('input', (event) => {
    confirmButton.disabled = !form.checkValidity();
    if (!event.target.checkValidity?.()) event.target.reportValidity();
  });
}
