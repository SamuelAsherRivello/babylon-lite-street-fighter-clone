export const contentConfig = Object.freeze({
  renderer: "babylon-lite",
  style: "2d",
});

export const pixelPerfectOptions = Object.freeze({
  engine: Object.freeze({ msaaSamples: 1 }),
  texture: Object.freeze({
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
    minFilter: "nearest",
    magFilter: "nearest",
    mipMaps: false,
  }),
});

export const logicalResolution = Object.freeze({ width: 960, height: 720 });
export const STAGES = Object.freeze([
  Object.freeze({ id: "dojo", name: "SUNSET DOJO" }),
  Object.freeze({ id: "harbor", name: "HARBOR MARKET" }),
  Object.freeze({ id: "snow", name: "SNOW TEMPLE" }),
]);
export const stageImageSizes = Object.freeze({
  dojo: Object.freeze({ width: 1448, height: 1086 }),
  harbor: Object.freeze({ width: 1497, height: 1051 }),
  snow: Object.freeze({ width: 1496, height: 1051 }),
});

export function getRenderingPolicy({ renderer, style }) {
  if (renderer !== "babylon-lite") return "renderer-specific";
  return style === "2d" ? "pixel-perfect" : style === "3d" ? "performance-scaled-3d" : "renderer-specific";
}
