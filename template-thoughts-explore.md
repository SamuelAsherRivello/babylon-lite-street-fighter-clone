Copy this into the other chat:

```text
$openspec-propose update-template-layout

Create planning artifacts only for updating this repository’s browser app/game template. Inspect the actual repository, existing OpenSpec specs, AGENTS.md, and template usage checklist before drafting. Do not implement code.

Purpose:
Use one reusable React template for either an app or a game. Include comments in the code explaining where a game project could integrate Babylon Lite. Do not add Babylon Lite dependencies, imports, renderer code, or an engine example.

Page structure:
- Browser Surface: the full browser-sized React application.
- Gutter: space outside the viewport; may contain React elements.
- Viewport: centered project area preserving a project-defined aspect ratio.
- Content Layer: React content for an app; integration location for an optional game canvas.
- UI Layer: React overlays above content, inside the viewport.

Preserve four reusable UI corner roles:
- Upper left: project title.
- Upper right: project links.
- Lower left: project settings.
- Lower right: project version.

Include this conceptual mockup in design.md. Content extends beneath the UI; the diagram’s spacing is illustrative.

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

Organize usage parameters as follows:

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

Distinguish implemented React layout configuration from game-renderer
settings documented for future integration. Avoid inactive controls that
imply a renderer is installed.

Resolution conventions:
- React layout uses CSS pixels.
- Device pixel ratio must not multiply CSS layout dimensions.
- Separate CSS size, logical resolution, internal render resolution,
  canvas backing resolution, and display size.
- Logical resolution, tile grids, and render scaling are game concerns.
- Browser gutters are outside the viewport.
- Game letterboxing is inside the viewport.
- Integer-scaled game content is centered rather than stretched.
- Automatic integer scaling must handle screens smaller than the logical
  resolution; never produce a zero-size surface.
- Clarify whether pixel-perfect guarantees concern logical, CSS, or physical
  display pixels.
- Keep React UI resolution independent of reduced game render resolution.

Scope boundaries:
- Keep the repository root as the npm project root.
- Keep application implementation under project-name/.
- Preserve existing title, links, settings, and version behavior where possible.
- Do not generate or modify OpenSpec skills as part of this layout change.
- Do not create a pull request.
- Do not implement Babylon-specific diagnostics or rendering behavior without
  a renderer; describe those integration responsibilities in comments/docs.

Use rendering-policy presets with optional overrides as a proposed default,
not an already confirmed implementation decision. Ground defaults in the
existing repository and record minor assumptions. Ask about any material
ambiguity before creating artifacts.

Create the proposal, delta specs, design (including the mockup and parameter
tree), and actionable tasks required by the configured schema. Validate the
planning artifacts and stop when they are ready for review.
```
