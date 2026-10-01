# Layout and future game integration

The starter implements a React browser surface, centered ratio-preserving viewport, app content, external gutters, and UI corners. No game renderer is installed. Resize the browser and use Fullscreen to review the default landscape 16:9 layout: the darker charcoal area is the gutter and the lighter charcoal area is the viewport. Portrait is unchecked by default; check it to switch to the portrait ratio. This choice resets on a fresh page load.

## Implemented configuration

Edit `project-name/src/layout.js` for defaults. Positive finite `width` and `height` define a ratio, not a resolution. They must match `orientation`: portrait width < height, landscape width > height, square width = height. `gutterBackground` sets the outside background. Invalid configuration displays an actionable alert.

`App` accepts `layout`, `content` (React elements), and `gutters` with optional `top`, `bottom`, `left`, and `right` React elements. Supply these in `project-name/src/main.jsx`. Content fills the viewport and scrolls internally under the UI. Gutters occupy residual space only, scroll internally, and collapse to zero without shrinking the viewport. Corners keep title, links, settings, and version roles; bounded scroll regions and adaptive insets keep controls reachable at small sizes.

The corner spacing is controlled by the `--viewport-padding` CSS variable in `project-name/src/style.css` (20px by default). The responsive inset caps this value on very small viewports.

```jsx
<App
  layout={{ orientation: "portrait", width: 9, height: 16, gutterBackground: "#f0f0f0" }}
  content={<main>Your responsive app content</main>}
  gutters={{ left: <aside>Optional gutter content</aside> }}
/>
```

## Future renderer policies and lifecycle

## Keyboard input ownership

The React UI layer must not assign shortcuts or otherwise capture **WASD, the four Arrow keys, Spacebar, or Enter**. Keep these keys available for the content layer, which may use them for game controls when needed. Choose other keys for React UI shortcuts and display their assigned keys in the UI.

Rendering-policy presets with optional overrides are proposed consumer defaults, not confirmed installed features:

| Policy | Future integration responsibilities |
| --- | --- |
| Responsive smooth | Match viewport CSS presentation size; select backing resolution and filtering for smooth content. |
| Pixel-perfect 2D | Usually orthographic camera in logical units; align sprites/camera to the grid, use nearest filtering, and decide whether mipmaps and anti-aliasing blur the intended pixel grid. |
| Performance-scaled 3D | Choose perspective or orthographic projection; use fixed or dynamic internal resolution scaling with explicit minimum/maximum bounds and a performance target. Keep UI at independent CSS resolution. |

Document overrides beside presets, including incompatibilities. Smooth filtering or fractional display scale suspends strict logical-to-CSS pixel guarantees. Camera projection, texture filtering, mipmaps, and anti-aliasing are renderer decisions.

The comment in `BrowserSurface.jsx` identifies where a future Babylon Lite component could mount its canvas. Initialize on mount, observe the container for resize, and dispose the renderer, resources, observers, and subscriptions on cleanup. StrictMode remounts require repeatable setup and cleanup. Select APIs only after confirming the actual engine version. The starter adds no engine dependency, calls, imports, or engine example.

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

## Future development diagnostics

A renderer integration should report CSS/client size, DPR, logical/internal/backing/display dimensions, active integer/render scale, and scale bounds. Inspect one-pixel lines, a checkerboard, centered crosshair, and a known-size sprite. Validate wheel/pointer conversion independently of reduced render resolution. Exercise resize, fullscreen, zoom, fractional DPR, and fallback. This starter implements no engine diagnostics, scene, or diagnostic switch.

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
    +-- Content style: 2D / 3D
    +-- Rendering policy
    |   +-- Responsive smooth
    |   +-- Pixel-perfect 2D
    |   |   +-- Logical resolution: width x height
    |   |   +-- Optional tile size and grid dimensions
    |   |   +-- Derive logical resolution from tile grid
    |   |   +-- Integer display scale: automatic / explicit
    |   |   +-- Small-viewport fallback policy
    |   |   +-- Pixel alignment
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
