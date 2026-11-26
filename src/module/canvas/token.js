/** Resources whose token bar shows temporary points. MP joins once its HUD input spends temporary MP first. */
const TEMPORARY_POINT_BAR_RESOURCES = ['hp'];

/** Bar attributes with temporary points, by the resource holding them. */
const TEMPORARY_POINT_BARS = Object.fromEntries(TEMPORARY_POINT_BAR_RESOURCES.map((key) => [`attributes.${key}`, key]));

/** Fill of the canvas marker for temporary points: `@temporary-points-hud-color` of the token HUD's "+N". */
const TEMPORARY_MARKER_COLOR = 0x8fe05a;

/**
 * The available temporary points of the resource a token bar shows, 0 when the bar shows none.
 * @param {TokenDocument} tokenDocument
 * @param {string} barKey `bar1` or `bar2`
 * @returns {number}
 */
function barTemporaryPoints(tokenDocument, barKey) {
  const resource = TEMPORARY_POINT_BARS[tokenDocument[barKey]?.attribute];
  return (resource && tokenDocument.actor?.system.attributes[resource]?.temporary) || 0;
}

/**
 * Tokens of OpenQuest actors. A bar of a resource with temporary points gets a round marker at its right end, so a
 * buffered creature stands out even at full ordinary points; the bar itself still shows ordinary current / maximum.
 */
export class OQToken extends foundry.canvas.placeables.Token {
  /** @override */
  _drawBar(index, bar, data) {
    super._drawBar(index, bar, data);
    if (!barTemporaryPoints(this.document, index === 0 ? 'bar1' : 'bar2')) return;
    // The same sizes as core's bar.
    const { width } = this.document.getSize();
    const s = canvas.dimensions.uiScale;
    const bh = 8 * (this.document.height >= 2 ? 1.5 : 1) * s;
    bar.lineStyle(s, 0x000000, 1.0);
    bar
      .beginFill(TEMPORARY_MARKER_COLOR, 1.0)
      .drawCircle(width, bh / 2, bh * 0.6)
      .endFill();
  }
}

/**
 * Redraws the bars of an actor's tokens when its pools change. Core redraws a bar only when its value changes, so a
 * change of pools alone would leave the marker stale. Runs for synthetic token actors too.
 * @param {Actor} actor
 * @param {object} changed
 */
export function refreshTemporaryPointBars(actor, changed) {
  const poolsChanged = TEMPORARY_POINT_BAR_RESOURCES.some((key) =>
    foundry.utils.hasProperty(changed, `system.attributes.${key}.pools`),
  );
  if (!poolsChanged || !canvas.ready) return;
  for (const token of actor.getDependentTokens({ scenes: canvas.scene })) {
    if (token.rendered) token.object.renderFlags.set({ refreshBars: true });
  }
}

/**
 * Shows "+N" next to a token HUD bar input whose resource has temporary points.
 * @param {foundry.applications.hud.TokenHUD} hud
 * @param {HTMLElement} html
 */
export function showTemporaryPointsOnHud(hud, html) {
  for (const barKey of ['bar1', 'bar2']) {
    const temporary = barTemporaryPoints(hud.document, barKey);
    const input = html.querySelector(`.attribute.${barKey} input`);
    if (!temporary || !input) continue;
    const marker = document.createElement('span');
    marker.className = 'oq-temporary-points';
    marker.textContent = `+${temporary}`;
    input.after(marker);
  }
}
