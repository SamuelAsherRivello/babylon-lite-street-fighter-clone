export function getScaleDisplayText(scale) {
  const validScale = Number.isFinite(scale) && scale > 0 ? scale : 0;
  const formattedScale = Number.isInteger(validScale)
    ? String(validScale)
    : validScale.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  const quality = validScale >= 1 && Number.isInteger(validScale) ? "Integer" : "Fractional";
  return `Scale: ${formattedScale}x ${quality}`;
}

export function getWorldEdgeBorderLayout(cssWidth, cssHeight, dpr) {
  const pixelRatio = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  const widthPx = Math.max(0, Math.floor(cssWidth * pixelRatio));
  const heightPx = Math.max(0, Math.floor(cssHeight * pixelRatio));
  const thicknessPx = 5 * pixelRatio;

  return [
    { positionPx: [widthPx / 2, thicknessPx / 2], sizePx: [widthPx, thicknessPx] },
    { positionPx: [widthPx / 2, heightPx - thicknessPx / 2], sizePx: [widthPx, thicknessPx] },
    { positionPx: [thicknessPx / 2, heightPx / 2], sizePx: [thicknessPx, heightPx] },
    { positionPx: [widthPx - thicknessPx / 2, heightPx / 2], sizePx: [thicknessPx, heightPx] },
  ];
}
