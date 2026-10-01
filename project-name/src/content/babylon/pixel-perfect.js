import { logicalResolution, showcaseTileSize } from "./config.js";

export function getLogicalToCssScale(cssWidth, cssHeight, resolution = logicalResolution) {
  if (![cssWidth, cssHeight, resolution.width, resolution.height].every(Number.isFinite)
    || cssWidth <= 0 || cssHeight <= 0 || resolution.width <= 0 || resolution.height <= 0) {
    return 0;
  }

  const fit = Math.min(cssWidth / resolution.width, cssHeight / resolution.height);
  return fit >= 1 ? Math.floor(fit) : fit;
}

export function getShowcaseSpriteLayout(cssWidth, cssHeight, dpr, resolution = logicalResolution) {
  const scale = getLogicalToCssScale(cssWidth, cssHeight, resolution);
  const pixelRatio = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  const backingWidth = Math.floor(cssWidth * pixelRatio);
  const backingHeight = Math.floor(cssHeight * pixelRatio);

  return {
    scale,
    positionPx: [backingWidth / 2, backingHeight / 2],
    sizePx: [showcaseTileSize, showcaseTileSize],
  };
}
