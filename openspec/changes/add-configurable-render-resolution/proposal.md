# Proposal

## Why

<<<<<<< Updated upstream
The Babylon Lite 2D policy currently reports logical scale but has no independent, user-selectable render target resolution. A resolution selector will let users compare lower, native, and higher internal render resolutions while keeping game coordinates and camera framing stable.

## What Changes

- Add four runtime render-resolution presets relative to the native DPR-scaled canvas backing size: quarter, half, native, and double width and height.
- Keep the developer-configured logical scene dimensions, game coordinates, and camera view unchanged as the selected render target changes.
- Present the selected render target into the native backing buffer using nearest-neighbor sampling in both directions.
- Add a React HUD line immediately below the Babylon Lite title, formatted like `(R) RenderResolution: 1280x720 (Native)`. Clicking `(R)` or pressing R cycles through the choices. Show active pixel dimensions and mark the native choice.
- Make React own the selection, default to Native, persist the selected preset in local storage, and pass it to Babylon Lite. Recompute dimensions when viewport size or DPR changes.
- Keep all rendering on WebGPU. Cap the double-size target to supported WebGPU texture dimensions while preserving aspect ratio and show the actual capped dimensions.
- Document logical resolution, internal render resolution, canvas backing resolution, and CSS display size as separate concepts.
=======
The Babylon Lite 2D policy currently reports a logical scale but has no independent, user-selectable render target resolution. A small resolution selector will let developers and users compare lower, native, and higher internal render resolutions while keeping game coordinates and camera framing stable.

## What Changes

- Add a developer-editable logical resolution and a Babylon Lite internal render-resolution setting with three runtime choices derived from the native DPR-scaled canvas backing size: half width and height, native, and double width and height.
- Keep the logical scene dimensions, game coordinates, and camera view unchanged as the selected internal render target changes.
- Present the selected render target into the native backing buffer with nearest-neighbor sampling in both directions so pixel-art edges remain hard and intentionally jagged.
- Add a React HUD line immediately below the Babylon Lite title, formatted like `(R) RenderResolution: 1280x720 (Native)`. Clicking `(R)` or pressing R cycles through the three choices. Show the active pixel dimensions and mark the native choice.
- Make React own the selected preset, default it to Native, persist the preset in local storage, and pass the selected preset to Babylon Lite. Recompute its dimensions from the current native backing size when the viewport or DPR changes.
- Keep all rendering on WebGPU. If the double-size target exceeds the device's supported texture dimensions, cap it to the largest supported size while preserving aspect ratio and display the actual dimensions. Do not fall back to another renderer.
- Document the distinction between logical resolution, internal render resolution, canvas backing resolution, and CSS display size.
>>>>>>> Stashed changes

## Capabilities

### New Capabilities

<<<<<<< Updated upstream
- `babylon-render-resolution`: User-selectable Babylon Lite internal render resolution independent of logical scene dimensions.

### Modified Capabilities

None. This is additive to the existing Babylon Lite integration.
=======
- `babylon-render-resolution`: User-selectable Babylon Lite internal render resolution independent of the logical scene dimensions.

### Modified Capabilities

None. This is an additive runtime capability layered on the Babylon Lite integration tracked by the existing `add-babylon-lite-pixel-perfect` change.
>>>>>>> Stashed changes

## Impact

- React settings state, local-storage persistence, HUD control, and keyboard handling under `project-name/src/ui/`.
- Babylon Lite render-target allocation, resize handling, nearest-neighbor presentation, and lifecycle under `project-name/src/content/`.
<<<<<<< Updated upstream
- Integration guidance and focused tests under `project-name/documentation/` and `project-name/test/`.
- No new runtime dependency; use and verify the installed Babylon Lite 1.32.0 render-target APIs and WebGPU device limits.
=======
- Babylon Lite rendering guidance and focused configuration/resolution tests under `project-name/documentation/` and `project-name/test/`.
- No new runtime dependency. The implementation must use and verify the installed Babylon Lite 1.32.0 render-target APIs and WebGPU device limits.
>>>>>>> Stashed changes
