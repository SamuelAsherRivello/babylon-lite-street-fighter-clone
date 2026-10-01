# Layout and future game integration

The starter implements a React browser surface, centered ratio-preserving viewport, Babylon Lite 2D content, external gutters, and UI corners. The default content is a WebGPU-rendered pixel-art showcase. Resize the browser and use Fullscreen to review the default landscape 16:9 layout: the darker charcoal area is the gutter and the lighter charcoal area is the viewport. Portrait is unchecked by default; check it to switch to the portrait ratio. This choice resets on a fresh page load.

## Implemented configuration

Edit `project-name/src/ui/layout.js` for defaults. Positive finite `width` and `height` define a ratio, not a resolution. They must match `orientation`: portrait width < height, landscape width > height, square width = height. `gutterBackground` sets the outside background. Invalid configuration displays an actionable alert.

`App` accepts `layout`, `content` (React elements), and `gutters` with optional `top`, `bottom`, `left`, and `right` React elements. Supply these in `project-name/src/main.jsx`. Content fills the viewport and scrolls internally under the UI. Gutters occupy residual space only, scroll internally, and collapse to zero without shrinking the viewport. Corners keep title, links, settings, and version roles; bounded scroll regions and adaptive insets keep controls reachable at small sizes.

The page structure allows the complete HUD to remain inside the viewport and visible during fullscreen. Gutters are not visible in fullscreen. Custom UI in a gutter is acceptable only as secondary UI; all primary UI must be implemented in React within the viewport.

The corner spacing is controlled by the `--viewport-padding` CSS variable in `project-name/src/ui/style.css` (10px by default). The responsive inset caps this value on very small viewports.

```jsx
<App
  layout={{ orientation: "portrait", width: 9, height: 16, gutterBackground: "#f0f0f0" }}
  content={<main>Your responsive app content</main>}
  gutters={{ left: <aside>Optional gutter content</aside> }}
/>
```

## Implemented renderer policies and lifecycle

Edit `project-name/src/content/babylon/config.js` to change the developer-selected renderer and content style. It defaults to Babylon Lite + 2D; no runtime mode picker is added. The Babylon Lite 2D selection uses Pixel Perfect. Selecting 3D does not apply that 2D preset; it directs the developer to the separate Performance-scaled 3D policy below. This template does not include a 3D showcase scene.

## Keyboard input ownership

The React UI layer must not assign shortcuts or otherwise capture **WASD, the four Arrow keys, Spacebar, or Enter**. Keep these keys available for the content layer, which may use them for game controls when needed. Choose other keys for React UI shortcuts and display their assigned keys in the UI.

“Pixel Perfect” is this template's name for a configuration that keeps authored pixels sharp; it is not a Babylon Lite mode or API. The 2D preset is implemented in `project-name/src/content/` using Babylon Lite 1.32.0's native SpriteRenderer APIs.

| Policy | Behavior |
| --- | --- |
| Responsive smooth | Future option: match viewport CSS presentation size and choose backing resolution and filtering for smooth content. |
| Pixel Perfect (Babylon Lite + 2D default) | Implemented: use a 320x180 logical stage with centered integer logical-to-CSS scaling when it fits; sample the imported 32x32 tile with nearest minification and magnification; disable mipmaps and MSAA; keep the canvas backing DPR-aware. |
| Performance-scaled 3D | Separate policy: choose perspective or orthographic projection; use fixed or dynamic internal resolution scaling with explicit bounds and a performance target. Keep UI at independent CSS resolution. Do not apply the Pixel Perfect 2D defaults automatically. |

The included Pixel Perfect showcase has a white background and an original 32x32 PNG at `project-name/src/content/babylon/images/concentric-squares-32.png`, made from concentric black and gray squares. Its native texels contain only hard black/gray boundaries; rotation reveals deliberate stair-step edges. Babylon Lite renders the centered sprite at exactly 32x32 backing-store pixels so each authored texel stays at native size; DPR affects its centered position and canvas backing store, not the sprite dimensions. The tile rotates slowly around its visual center. A React UI label sits in the lower-center target area: `(B) Babylon Lite` uses the existing corner-title style, while `Scale: <current scale>x Integer|Fractional` and `Mode: 2DPixelPerfect` use corner-body. The label begins just left of viewport center and uses the supplied `#e0694b` accent. Clicking `(B)` or pressing B opens a React dialog repeating the same settings. While open, four 5-CSS-pixel `#e0694b` Babylon Lite sprites outline the content-world edges; closing the dialog or pressing Escape removes the outline. The Babylon Lite render loop, including sprite animation processing, pauses while any Config, Stats, or Babylon Lite dialog is open and resumes when all are closed. Resize/DPR changes update the border's backing-pixel geometry.

Babylon Lite owns canvas backing sizing: its surface sets the buffer to `clientWidth/clientHeight × devicePixelRatio` (clamped only if explicitly configured). The integration leaves the default full DPR enabled and never writes DPR-scaled values into `canvas.width` or `canvas.height`. Sprite positions and sizes are expressed in backing-store pixels, so the integration converts measured CSS dimensions and the current DPR into Lite's pixel coordinates; it does not apply DPR a second time to the canvas.

For Pixel Perfect, use Babylon Lite's `loadTexture2D` with `minFilter: "nearest"`, `magFilter: "nearest"`, `mipMaps: false`, and clamp-to-edge addressing. Create the engine with `msaaSamples: 1`; Babylon Lite's pure-2D SpriteRenderer also renders its swapchain pass at one sample. The canvas uses CSS `image-rendering: pixelated` to avoid browser smoothing if it is resampled. DPR is applied once to the backing buffer. The guarantee is crisp logical-to-CSS presentation, not universal physical-pixel alignment: fractional DPR and browser compositing can affect physical display alignment. If integer scaling cannot fit, the stage uses a positive fractional fit and suspends strict pixel-alignment guarantees. A 3D project follows its own quality and performance policy instead of inheriting the Pixel Perfect defaults.

Babylon Lite requires WebGPU. If WebGPU is unavailable or engine initialization fails, the content layer shows a clear message that the Babylon Lite experience requires WebGPU; the surrounding React app remains mounted and usable. The integration uses Lite-native settings and APIs rather than Babylon.js constants. Pin and check the installed Lite version's declarations when changing engine options. Content configuration, renderer setup, the showcase asset, and lifecycle code belong under `project-name/src/content/`; reusable React UI remains under `project-name/src/ui/`.

Document overrides beside presets, including incompatibilities. Texture filtering, mipmaps, camera projection, canvas backing sizing, and anti-aliasing are renderer decisions that must implement the selected policy.

`Content.jsx` owns asynchronous engine setup and cleanup. It loads the tile texture, creates the nearest-sampled tile and world-edge sprite layers, registers the renderer, and calls `startEngine`; Babylon Lite owns the render loop and automatically tracks canvas client size and DPR. A ResizeObserver updates the centered sprite and edge sprites in backing pixels when the viewport changes. React dialog state controls whether the world-edge sprites are visible. DPR-change listeners are removed on cleanup. Renderer disposal releases its resources and caller-owned atlases/textures before the engine is disposed. StrictMode remounts cancel initialization safely and clean up stale listeners and bindings. Camera, filtering, mipmap, and MSAA options must be verified against the pinned Lite release.

## Five resolution terms

| Term | Meaning |
| --- | --- |
| CSS size | Layout dimensions in CSS pixels; never multiply by DPR. |
| Logical resolution | Designed game coordinate dimensions, independent of display density. |
| Internal render resolution | Renderer output target, possibly reduced for performance. |
| Canvas backing resolution | Actual canvas buffer width and height. |
| Display size | CSS rectangle presenting the output. |

Define the mapping among these sizes. DPR informs backing decisions once; if the engine applies DPR, do not multiply it again. Reduced internal output can be composited into a larger backing buffer or use a reduced backing buffer directly; state which mapping is used. React UI retains CSS resolution regardless of logical or reduced game rendering dimensions.

## Integer scaling and letterboxing

Declare positive finite logical dimensions or derive them as tile width/height times grid columns/rows. Tile/grid values must be positive and grid counts integral. If explicit and derived dimensions are both supplied, require agreement.

Automatic integer scale is `floor(min(Vw/Lw,Vh/Lh))`. When it is at least 1, center display size `Lw*scale,Lh*scale` without stretching using an internal letterbox background. Explicit scales must be positive integers; an oversized request must use a documented fallback or actionable error.

Example: 32x32 logical-pixel tiles in a 10x18 grid yield 320x576 logical resolution. A 640x1152 CSS viewport fits scale 2. An 800x1200 viewport also fits scale 2, with centered 640x1152 display and internal letterboxing of 80 CSS pixels per side and 24 above/below.

When the automatic integer result is zero, the proposed default is positive fractional fit `min(Vw/Lw,Vh/Lh)` with pixel-perfect guarantees suspended. For 160x288 available space and 320x576 logical content, scale is 0.5 and display is 160x288. Never produce a zero-size surface for positive available space. Consumers may explicitly override with 1x clipping or scrolling, documenting visibility/input trade-offs.

Browser gutters are outside the viewport; game letterboxing is inside it. Pixel alignment concerns camera origin, sprite vertices, and presentation origin. Integer scaling guarantees concern logical-to-CSS pixels. Physical display guarantees additionally depend on DPR, backing mapping, filtering, and compositing; fractional DPR prevents a universal physical pixel promise.

## Implemented and future development diagnostics

The showcase label is an implemented visual diagnostic for the active scale: it explicitly marks integer and fractional sizing. Opening its React dialog outlines the Babylon Lite content-world boundary in `#e0694b`. A full diagnostics panel may additionally report CSS/client size, DPR, logical/internal/backing/display dimensions, and scale bounds. Validate pointer conversion independently of reduced render resolution and exercise resize, fullscreen, zoom, fractional DPR, and fallback.

## Local verification

Run `npm ci`, `npm test`, and `npm run build` from the repository root. Start `npm run dev` and open Vite's URL. The focused test suite covers the layout contract; separate existing skill-test failures may still be reported by the full suite.
## Conceptual layout and parameter tree

Content extends beneath the UI; diagram spacing is illustrative. Shared and App parameters are implemented; Game parameters are future responsibilities.

```text
+------------------------------------------------------------+
|                      BROWSER SURFACE                       |
|                           GUTTER                           |
|              +------------------------------+              |
|              |           VIEWPORT           |              |
|              | Title                  Links |              |
|              |                              |              |
|    GUTTER    |        CONTENT LAYER         |    GUTTER    |
|              |     React app content or     |              |
|              |     optional game canvas     |              |
|              |                              |              |
|              | Settings             Version |              |
|              +------------------------------+              |
|                           GUTTER                           |
+------------------------------------------------------------+
```

```text
Template
|
+-- Shared
|   +-- Viewport orientation: portrait / landscape / square
|   +-- Project-defined aspect ratio: width:height
|   +-- Gutter background and optional React content
|   +-- React UI layer with the four corner roles
|
+-- App
|   +-- React content
|   +-- Responsive layout within the viewport
|
+-- Game
    +-- Optional game canvas integration point
    +-- Optional renderer: Babylon Lite (WebGPU required)
    +-- Content style: 2D / 3D
    +-- Rendering policy
    |   +-- Responsive smooth
    |   +-- Pixel Perfect (default for Babylon Lite + 2D)
    |   |   +-- Logical resolution: width x height
    |   |   +-- Optional tile size and grid dimensions
    |   |   +-- Derive logical resolution from tile grid
    |   |   +-- Integer display scale: automatic / explicit
    |   |   +-- Small-viewport fallback policy
    |   |   +-- DPR-aware backing resolution (apply DPR once)
    |   |   +-- Pixel alignment and no anti-aliasing/smoothing
    |   |   +-- Internal letterbox background
    |   +-- Performance-scaled 3D
    |       +-- Fixed or dynamic render resolution scale
    |       +-- Dynamic scale limits
    +-- Integration guidance in comments
    |   +-- Orthographic / perspective camera conventions
    |   +-- Texture filtering and mipmaps
    |   +-- Anti-aliasing
    |   +-- Device-pixel-ratio-aware canvas sizing
    +-- Development resolution diagnostics guidance
```

