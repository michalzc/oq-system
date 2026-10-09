/**
 * Recolors system icons from `assets/icons/themed/` to the NPC palette, through CSS `filter: url(#oq-npc-icon)`.
 *
 * The icons are drawn with exactly two colors: the #600000 background and the #dededc glyph. The matrix keeps the glyph
 * (and black) in place and shifts the background by (target - source) / source.r per unit of `R - G`, which is 0 for
 * greys and source.r for the background. Being linear, it maps the anti-aliased edges between them exactly too:
 * #600000 -> #30405e, #dededc -> #dededc.
 */
const NPC_ICON_MATRIX = [
  [0.5, 0.5, 0, 0, 0],
  [0.6667, 0.3333, 0, 0, 0],
  [0.9792, -0.9792, 1, 0, 0],
  [0, 0, 0, 1, 0],
];

/** Chromium does not support filters from external files or data URIs, so the definition must live in the document. */
export function registerIconFilters() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `<filter id="oq-npc-icon" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix" values="${NPC_ICON_MATRIX.flat().join(' ')}"/>
  </filter>`;
  document.body.append(svg);
}
