# Proposal

## Why

The current workspace is only a saved game prompt: it has no application, README, or Git checkout, so there is no playable game or reproducible way to launch one. This change turns the prompt into a complete, original-art 1v1 fighting game with local play, online matches, documented startup, and a verified public build.

## What Changes

- Establish the game project from the required Babylon Lite repository template and shared skills library, preserving the saved prompt in the README's collapsible Original AI Prompt section.
- Add a side-view arcade fighting game with local two-player mode, character select for Ryu, Chun-Li, and one original fighter, six attack strengths, directional special moves, blocking, hit reactions, a 99-second round clock, and best-of-three match flow.
- Extend the shared Colyseus service with isolated, server-authoritative 1v1 rooms, invite/join flow, ready state, combat synchronization, and bounded reconnect handling; pin and document the released shared client in the game.
- Add responsive keyboard, gamepad, and touch controls, original pixel-art fighters/stages/UI and original audio, with a documented pixel-perfect rendering setup.
- Make the game straightforward to run from its README. Document the prerequisites, exact local launch steps, how to open two players, controls, production URL, server connection/recovery behavior, and browser requirements.
- Verify combat rules, multiplayer integration with two independent clients, production build, deployed game, and public end-to-end match. Release through the repositories' existing workflows and record incomplete checks honestly if an external deployment or browser limitation blocks them.

## Capabilities

### New Capabilities

- `fighting-game`: Fighter selection and the complete local arcade match loop for the three specified fighters.
- `online-duels`: Two-seat online rooms with server-owned competitive match outcomes and reliable client synchronization.
- `game-launch`: A usable README launch path and clear local/production setup and recovery guidance.

### Modified Capabilities

None. The initialized project has no existing OpenSpec specs.

## Impact

- The current workspace is not a Git repository and contains no game code. Implementation must first establish the game checkout from the required template (and confirm the intended repository name is available) before adapting its `AGENTS.md`, template checklist, workflows, scripts, and README.
- Game client: Babylon Lite/WebGPU, responsive React UI, local combat simulation, controls, original assets, and the GitHub Pages build.
- Shared service: `SamuelAsherRivello/rmc-colyseus-multiplayer-server`, including the game registry, room/state/messages, shared client only if needed, tests, documentation, release, and deployment. Preserve other games and protocols.
- The published server currently describes in-memory rooms on Vercel Hobby, one process not guaranteed across requests, and sessions that can be interrupted around five minutes. The design must keep matches short, test real room admission and connectivity, and document these hosting limits; it must not claim durable matches or persistent identity.
- References: the playable SNES version at `https://www.retrogames.cz/play_304-SNES.php` and the Street Fighter II overview at `https://en.wikipedia.org/wiki/Street_Fighter_II` guide game behavior; Capcom and Nintendo history pages and the screenshot searches in the saved prompt guide art direction only. Create original art, music, and sound; do not extract ROM/code or copy game assets, logos, or exact stage compositions.
- Use one end-to-end OpenSpec change for the requested finished deliverable, with the work sequenced into Foundation, Multiplayer Setup, and Gameplay Polish implementation gates from the saved prompt. Complete the same-game public verification before marking the change done.
