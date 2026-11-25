/**
 * Pure effect logic over plain effect data: no Foundry calls, so it is tested in plain Node.
 *
 * An effect is read as its plain fields: `name`, `img`, `disabled`, `description` (the rules text) and `system`
 * (`sourceName`, `changes`). Effect documents and their `toObject()` copies both fit.
 */

function displayValue(value) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

/**
 * What the effects list and the effect editor show for one effect.
 * @param {object} effect plain effect data
 * @returns {{name: string, img: string, sourceName: string, rulesText: string, state: 'enabled'|'disabled',
 *   enabled: boolean, otherChanges: Array<{key: string, type: string, value: string}>}}
 */
export function effectListEntry(effect) {
  const changes = effect.system?.changes ?? [];
  const enabled = !effect.disabled;
  return {
    name: effect.name,
    img: effect.img,
    sourceName: effect.system?.sourceName ?? '',
    rulesText: effect.description ?? '',
    state: enabled ? 'enabled' : 'disabled',
    enabled,
    // No OpenQuest change target exists yet, so every stored change was made by a macro or module and keeps core
    // behaviour.
    otherChanges: changes.map(({ key, type, value }) => ({ key, type, value: displayValue(value) })),
  };
}
