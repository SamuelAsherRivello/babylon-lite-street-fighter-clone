# AI Repository Guidance

## Repository purpose and scope

This repository is a reusable browser app/game template. When a user asks to
use it, first identify the requested mode:

1. **New GitHub repository:** Use GitHub's **Use this template** flow when
   authorized. The destination repository is a new project; do not push
   project-specific work to this template.
2. **Local project copy:** Copy the tracked template files into the explicitly
   named destination, excluding `.git` and its history. Do not create a
   destination the user did not identify.
3. **Reference only:** Inspect this repository as inspiration. Copy no files
   unless the user separately asks for a copy.

For either new-project mode, follow
[the template usage checklist](AGENTS_TEMPLATE_USAGE_CHECKLIST.md). Resolve
any mismatch between the requested mode and repository configuration before
copying or creating a destination. Do not treat reference-only use as permission
to copy.

## Repository and application layout

- The repository root is the npm project root and contains `.git`, package
  configuration, and repository metadata. Run Git, dependency, build, test,
  and run commands from this root unless the resulting project's inspected
  configuration says otherwise.
- `project-name/` is the Vite application root. Keep app source, tests, and
  assets there unless the chosen stack deliberately changes the layout.
- Project documentation assets belong in `project-name/documentation/`.
- Keep `project-name/` as the Vite root and synchronize the GitHub repository
  URL with the resulting project repository when this template baseline is
  retained.

## React code and styles

- Do not leave dead code or dead styles. Remove unused React components,
  imports, variables, CSS selectors, and custom properties when they are no
  longer used.
- When changing React UI, check that its JSX class names and IDs match the
  styles, and remove obsolete selectors left behind by the change.

## HTML template corner roles

The default HTML template uses four reusable `corner` instances inside
`ui_layer`. Preserve these roles when adapting the template:

- Upper left: project title.
- Upper right: project links.
- Lower right: project version.
- Lower left: project settings.

## OpenSpec setup

The template preserves `.agents/skills/.openspec-target` but does not bundle
generated OpenSpec skills. When the resulting project requires OpenSpec, follow
the authoritative setup and verification procedure in
[the template usage checklist](AGENTS_TEMPLATE_USAGE_CHECKLIST.md#openspec-setup-when-required).
Do not hand-edit generated OpenSpec skills.

## Pull request workflow

Do not create a pull request unless the user explicitly asks for one in the
current request. A push, commit, or completed template/OpenSpec workflow does
not imply approval to create a pull request.
