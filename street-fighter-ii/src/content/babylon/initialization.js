export function getInitializationMessage(webGpuAvailable, error) {
  const reason = String(error?.message ?? error ?? "");
  if (!webGpuAvailable || /webgpu|adapter|gpu/i.test(reason)) {
    return "Babylon Lite requires WebGPU. Enable WebGPU or use a compatible browser and device.";
  }
  return "Babylon Lite could not initialize this content. Check the browser console for details.";
}
