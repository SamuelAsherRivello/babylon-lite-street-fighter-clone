# AI Repository Guidance

## Repository purpose and scope

This repository is the Street Fighter II inspired browser fighting game
`babylon-lite-street-fighter-clone`. The game is implemented in
`street-fighter-ii/`; the repository root owns npm configuration, OpenSpec,
GitHub workflows, and documentation. The separately maintained Colyseus
server is in the sibling `../server` checkout. Do not treat this project as a
blank reusable template or restore the `project-name/` demo app.

The project follows the updated source template's game integration, rendering,
audio, and OpenSpec standards. See
[the inherited template checklist](AGENTS_TEMPLATE_USAGE_CHECKLIST.md) for
the source workflow and [the OpenSpec specs](openspec/specs/) for accepted
guidance. Apply template creation steps only when a user explicitly asks to
create a separate project from this repository.

This game uses a fixed 4:3 landscape viewport. Keep its orientation controls,
shortcut, and saved override removed. Do not add a second orientation or a
square layout.

When adapting the starter into a game, treat the Babylon showcase as a renderer
example and replace it with the requested game. Babylon Lite is WebGPU-only;
games using it must show a clear unsupported-browser message and must not add a
fallback renderer. Implement the scene and renderer setup required by the game,
including for 3D. Every 2D game uses the Pixel Perfect rendering policy, while
each game chooses its own logical resolution and render scale.

The viewport is the priority location for primary game content and must remain
usable in windowed and fullscreen modes. The template gutter layout is
required, but adding secondary material there (such as design elements,
instructions, or backstory) is optional. Games have full freedom to choose
whether and how their content scrolls.

Game audio is optional; music is not recommended. If a game includes sound,
recommend 4 to 10 event-based sound effects and provide both an in-game mute
toggle and a documented URL argument that mutes all sound for silent AI
testing. Human players may enable sound in the normal experience.

## Repository and application layout

- The repository root is the npm project root and contains `.git`, package
  configuration, and repository metadata. Run Git, dependency, build, test,
  and run commands from this root unless the resulting project's inspected
  configuration says otherwise.
- `street-fighter-ii/` is the Vite application root. Keep game source, tests,
  and canonical art assets there.
- Project documentation assets belong in `street-fighter-ii/documentation/`.
- The GitHub Pages workflow publishes `street-fighter-ii/dist/` under the
  repository's Pages base path.

## React code and styles

- Do not leave dead code or dead styles. Remove unused React components,
  imports, variables, CSS selectors, and custom properties when they are no
  longer used.
- When changing React UI, check that its JSX class names and IDs match the
  styles, and remove obsolete selectors left behind by the change.
- The page structure supports keeping the full HUD visible inside the viewport
  during fullscreen. Gutters are not visible in fullscreen, so custom gutter UI
  may be added only as secondary UI. Keep all primary UI in React and within
  the viewport.

## HTML template corner roles

The default HTML template uses four reusable `corner` instances inside
`ui_layer`. Preserve these roles when adapting the template:

- Upper left: project title.
- Upper right: project links.
- Lower right: project version.
- Lower left: project settings.

Format content in each corner using either the menu title style or the menu
body style. Represent boolean settings with checkboxes.

## OpenSpec setup

This project uses OpenSpec CLI 1.13.1 and repository-local generated skills.
Keep `.agents/skills/.openspec-target` and its generated skill files aligned
with the updated source template. Do not hand-edit generated OpenSpec skills;
regenerate them with the pinned CLI if they need changes. Follow the setup and
verification procedure in
[the checklist](AGENTS_TEMPLATE_USAGE_CHECKLIST.md#openspec-setup-when-required).

## Pull request workflow

Do not create a pull request unless the user explicitly asks for one in the
current request. A push, commit, or completed template/OpenSpec workflow does
not imply approval to create a pull request.
