# Design

## Context

<<<<<<< Updated upstream
See [proposal.md](proposal.md) for motivation and [the spec delta](specs/babylon-render-resolution/spec.md) for user-visible behavior. The Babylon Lite 2D integration uses a DPR-sized canvas and SpriteRenderer. The installed Lite 1.32.0 declarations expose `createRenderTexture2D`, texture sampler options, `setSpriteRendererTarget`, and render-target copy/blit tasks. The WebGPU device exposes `maxTextureDimension2D`.
=======
See [proposal.md](proposal.md) for motivation and [the spec delta](specs/babylon-render-resolution/spec.md) for user-visible behavior. The active Babylon Lite integration uses a DPR-sized canvas backing buffer and a pure 2D SpriteRenderer. The pinned `@babylonjs/lite` 1.32.0 declarations expose `createRenderTexture2D`, texture min/mag sampler options, and `setSpriteRendererTarget`; they also document that a later registered SpriteRenderer can present an earlier renderer's texture. WebGPU device limits expose `maxTextureDimension2D`.
>>>>>>> Stashed changes

## Goals / Non-Goals

**Goals:**

<<<<<<< Updated upstream
- Keep logical world dimensions stable while changing the internal render target.
- Keep React as the owner of user settings and persistence; keep Babylon Lite as owner of GPU targets and presentation.
- Preserve nearest-neighbor sampling and the single-sample Pixel Perfect 2D policy.
=======
- Keep logical world dimensions stable while changing the intermediate render target.
- Keep React as the owner of user-facing settings and persistence; keep Babylon Lite as the owner of GPU targets and presentation.
- Preserve nearest-neighbor sampling and the existing no-MSAA Pixel Perfect 2D policy.
>>>>>>> Stashed changes
- Recompute target dimensions from the current canvas backing size after resize or DPR changes.

**Non-Goals:**

<<<<<<< Updated upstream
- Change renderers or add a non-WebGPU fallback.
- Change logical resolution, camera framing, or gameplay coordinates when cycling target sizes.
=======
- Change the Babylon renderer or add a non-WebGPU fallback.
- Change logical resolution, camera framing, or gameplay coordinates when the user cycles render targets.
>>>>>>> Stashed changes
- Add a runtime renderer/content-style picker or alter the separate 3D policy.

## Decisions

<<<<<<< Updated upstream
1. **Persist a preset identifier and derive dimensions at runtime.** React stores `quarter`, `half`, `native`, or `double`, not dimensions captured for one viewport. It passes the setting through the existing viewport-info context. A missing or invalid value selects Native.

   **Alternative considered:** Persist explicit dimensions. Rejected because they become stale when viewport size or DPR changes.

2. **Render to an internal texture, then present to the native canvas.** Set the scene SpriteRenderer's target to a selected-size render texture. Register a later presentation SpriteRenderer that samples this texture and covers the canvas backing dimensions. Set nearest minification and magnification on the render texture. Keep Lite responsible for canvas sizing; use computed backing dimensions only for internal targets and presentation geometry.

   **Alternative considered:** Change canvas backing dimensions to the selected render size. Rejected because Lite sizes the canvas from CSS dimensions and DPR, and this would conflate internal resolution with presentation size.

3. **Keep scene geometry in logical coordinates.** Render the unchanged camera/world view into the selected target. Rebuild or resize target resources and presentation geometry when the selection, viewport, or DPR changes, without changing world positions or camera bounds.

   **Alternative considered:** Use target pixel dimensions as scene coordinates. Rejected because a rendering setting would then change gameplay and framing.

4. **Expose the control in React and cycle the four presets.** Add a `(R)` button below the Babylon Lite title and bind R to the same cycle action. Show actual dimensions, append `(Native)` only for Native, and mirror the value in the Babylon Lite dialog. Add a validated preset property to the existing local-storage record without changing existing preference semantics.

   **Alternative considered:** Put the setting only in a dialog. Rejected because the user requested a visible and directly adjustable HUD value.

5. **Cap upscaled resolution to device texture limits.** Compute a uniform cap factor from the selected upscaled dimensions and `maxTextureDimension2D`, then floor both dimensions to positive integers. Preserve aspect ratio, keep the selected preset, and display actual dimensions. If allocation still fails for memory or another reason, show a clear content error without switching renderers.

   **Alternative considered:** Hide or disable an upscaled preset. Rejected because the four choices should remain available and show their actual dimensions.

## Risks / Trade-offs

- [A target may exceed available GPU memory even when dimensions meet WebGPU limits] → Catch allocation failures and show a clear in-content error; never change renderer.
- [Nearest-neighbor downscaling discards fine details] → This is intentional for `2DPixelPerfect` and will be documented.
- [Two SpriteRenderers add a presentation pass] → Keep presentation to one fullscreen sprite and verify lifecycle disposal on resize, preset changes, and StrictMode remount.
- [Odd native dimensions can make exact half ratios impossible] → Compute integer dimensions with one shared aspect-preserving scale and show the resulting actual dimensions.

## Migration Plan

Missing or invalid saved preset values resolve to Native. Existing saved fullscreen, orientation, and HUD settings retain their meanings. Rollback removes the preference and two-stage render path without changing Lite's canvas configuration.
=======
1. **Represent the selection as a preset, derive dimensions at runtime.** React state stores one stable preset identifier (`half`, `native`, or `double`), not a width/height captured from one viewport. React persists that identifier and passes it through the existing viewport-info context to the content integration. The content integration computes integer dimensions from the live backing size, preserving aspect ratio. This keeps the preference meaningful across viewport/DPR changes. A missing or invalid stored value selects `native`.

   **Alternative considered:** Persist explicit dimensions. Rejected because those dimensions would become stale when the browser size or DPR changes.

2. **Render the fixed logical view into an internal WebGPU texture, then present it.** Configure the scene SpriteRenderer with the selected-size render texture as its target. Register a later presentation SpriteRenderer whose atlas samples that texture and whose sprite covers the canvas backing dimensions. Set nearest minification and magnification on the render texture so both upscaling and downscaling retain hard pixel boundaries. Keep the existing DPR-aware canvas sizing owned by Lite; use the backing dimensions only to size the intermediate target and presentation sprite, never write DPR-scaled dimensions to the canvas manually.

   **Alternative considered:** Change the canvas backing dimensions to the selected render size. Rejected because Lite owns canvas sizing from CSS dimensions and DPR, and this would conflate the internal render target with the presentation surface.

3. **Keep game-space geometry independent from target dimensions.** Continue expressing scene content in logical coordinates and map the unchanged camera/view into the selected target. Render-target changes rebuild or resize the intermediate resource and update the presentation geometry; they do not alter sprite world positions or camera bounds.

   **Alternative considered:** Make the selected render dimensions the scene coordinate dimensions. Rejected because changing a quality/debug setting would also alter gameplay and framing.

4. **Expose a compact React control and cycle the three presets.** Add an accessible `(R)` button to the render-resolution line immediately below the Babylon Lite heading and bind the R keyboard shortcut to the same cycle action. Show actual dimensions and append `(Native)` only for the native preset. Keep the selection mirrored in the Babylon Lite settings dialog. Use the existing settings local-storage record, adding a validated preset field without changing the semantics of its existing fullscreen/orientation/HUD values.

   **Alternative considered:** Put GPU settings only in the existing dialog. Rejected because the requested resolution should be visible and directly adjustable from the HUD.

5. **Cap the double preset against WebGPU texture-size limits.** Compute a uniform cap factor from the doubled native dimensions and `maxTextureDimension2D`, floor the resulting dimensions to positive integers, and preserve aspect ratio. Continue using WebGPU and display the actual capped dimensions. If allocation still fails for device-memory or other reasons, show a clear Babylon content error; do not silently change renderer or selected preset.

   **Alternative considered:** Hide or disable the double preset when it exceeds a dimension limit. Rejected because the three choices should remain available and report the actual resolution.

## Risks / Trade-offs

- [A high-resolution render texture may exceed device memory even when dimensions are within WebGPU limits] → Catch allocation/render-target errors and show an actionable in-content error without switching renderers.
- [Nearest-neighbor reduction can discard fine details and produce aliasing] → This is intentional for `2DPixelPerfect`; keep the sampling rule explicit in the HUD documentation.
- [Two registered SpriteRenderers add a presentation pass] → Keep the pass limited to one fullscreen sprite and verify lifecycle disposal on resize, preset changes, and StrictMode remount.
- [Odd native dimensions can make half-size ratios non-exact] → Compute integral target dimensions with a shared aspect-preserving scale and report the actual dimensions.

## Migration Plan

No stored preference migration is required. Missing or invalid render-resolution values resolve to Native; existing saved fullscreen, orientation, and HUD settings retain their current meanings. Rollback removes the new preference field and the two-stage render path without changing the existing canvas configuration.
>>>>>>> Stashed changes
