# Browser Game and App Template Thoughts

## Core browser structure

![Portrait viewport with browser gutters](Portrait%20viewport%20with%20labeled%20browser%20gutters.png)

```text
Browser Surface
├── Gutter
└── Viewport
    ├── Content Layer
    └── UI Layer
```

- **Browser Surface:** the full browser-sized React application.
- **Viewport:** the project area with a declared aspect ratio, such as landscape or portrait.
- **Gutter:** space outside the viewport. It may contain React elements, but it is not part of the project content area.
- **Content Layer:** React for ordinary apps, or a Babylon Lite canvas for games.
- **UI Layer:** React UI rendered above the content layer inside the viewport.

The UI layer and gutter may both be implemented with React, but they have different spatial meanings.

## Template configuration paths

### Framework

- React-only application.
- React plus Babylon Lite application.

### Orientation

- Landscape viewport.
- Portrait viewport.

The viewport should preserve its declared aspect ratio. The browser surface may have gutters on any side.

### Babylon content style

- 2D-style Babylon content: orthographic camera, sprites or flat geometry, controlled depth.
- 3D Babylon content: perspective or orthographic camera, ordinary 3D assets and camera movement.

Babylon Lite uses one WebGPU rendering pipeline. A 2D-style project is a scene and camera convention, not a separate engine mode.

### Rendering policy

- **Responsive smooth:** full-resolution or percentage-based rendering for ordinary apps and smooth 3D.
- **Pixel-perfect 2D:** fixed logical resolution, nearest texture filtering, integer positioning, and integer display scaling.
- **Performance-scaled 3D:** reduced or dynamic internal render resolution while the UI remains at the viewport resolution.

## Resolution vocabulary

Keep these concepts separate:

- **CSS viewport size:** the browser layout size in CSS pixels.
- **Logical resolution:** the game’s designed coordinate space.
- **Internal render resolution:** the resolution used to render the content.
- **Canvas backing resolution:** the physical pixel buffer, usually affected by device pixel ratio.
- **Display size:** the CSS size at which the result is shown.
- **Device pixel ratio:** a rendering-resolution concern, not a CSS-layout scaling factor.

React layout should use CSS pixels. Babylon Lite should handle the canvas’s device-pixel-ratio-aware backing resolution. The template should not compensate for Windows display scaling by applying `devicePixelRatio` to CSS dimensions.

## Grid-first pixel workflow

Some retro games should be designed from a grid upward rather than from the browser resolution downward.

Example:

```text
Tile size:          32 × 32 pixels
Grid:               10 × 10 tiles
Logical resolution: 320 × 320 pixels
```

For a portrait game, a better logical grid might be:

```text
Tile size:          32 × 32 pixels
Grid:               10 × 18 tiles
Logical resolution: 320 × 576 pixels
```

At runtime, calculate the largest whole-number multiplier that fits:

```text
integerScale = floor(
  min(
    viewportWidth / logicalWidth,
    viewportHeight / logicalHeight
  )
)
```

Then center the integer-scaled game surface in the viewport. Any remaining space becomes intentional grid letterboxing. Letterboxing may appear on all four sides.

Recommended settings:

```text
Tile size:          32 px
Grid dimensions:    10 × 18 tiles
Logical resolution: 320 × 576
Scaling mode:       Integer
Display scale:      Automatic
```

Use **Integer Scale** for this policy. It is clearer than “upscale” because the important rule is that the display multiplier must be a whole number.

## Pixel-perfect conventions

For pixel-perfect 2D content:

- Use an orthographic camera.
- Use nearest-neighbor texture sampling.
- Avoid unwanted mipmaps and linear filtering.
- Keep sprite positions and scale values aligned to the logical pixel grid.
- Avoid fractional camera movement when hard pixel edges matter.
- Avoid unwanted anti-aliasing for the pixel-art pass.
- Prefer integer display multipliers.
- Keep the game surface centered rather than stretching it to fill arbitrary aspect ratios.

Pixel rounding should be a selectable policy, not an automatic rule for every 3D project.

## DPI and resolution diagnostics

The template should include a development-only resolution diagnostic scene, enabled by a query parameter such as `?diagnostics=resolution`.

React and Babylon should each display:

- CSS viewport width and height.
- Canvas client width and height.
- Device pixel ratio.
- Canvas backing width and height.
- Logical resolution.
- Current integer or render scale.

The scene should also show:

- One-pixel horizontal and vertical lines.
- A checkerboard.
- A centered shape or crosshair.
- A known-size sprite or rectangle.
- Mouse-wheel movement or zoom using resolution-independent units.

Expected behavior: Windows scaling and browser/device pixel ratio may change the diagnostic numbers, but the project’s CSS layout, visual proportions, and input behavior should remain coherent.

## Open questions for tomorrow

- Should the template use one universal repository or separate React and React-plus-Babylon templates?
- Should the top-level term be **Browser Surface**, **App Surface**, or **Full-Browser React App**?
- Should the outer area consistently be called **Gutter**?
- Should leftover space inside the viewport be called **Grid Letterbox**?
- Should portrait and landscape use fixed standard aspect ratios, or should each project declare its own?
- Should the template expose a single rendering-policy choice or several independent settings?
- Should 2D pixel games declare tile size and grid dimensions as first-class configuration?
- Should smooth 3D use **Resolution Scale**, while pixel games use **Integer Scale**?
- Should Babylon Lite diagnostics be included by default but disabled in production builds?
- What is the safest Babylon Lite API for explicitly controlling texture filtering, mipmaps, anti-aliasing, and internal render resolution?
- Should the template include a performance-scaled 3D example in addition to the pixel-perfect 2D example?

## Provisional terminology

```text
Browser Surface
├── Gutter
└── Viewport
    ├── Content Layer
    │   ├── React
    │   └── Babylon Lite
    └── UI Layer
```

Rendering policies:

```text
Responsive Smooth
Pixel-Perfect 2D
Performance-Scaled 3D
```
