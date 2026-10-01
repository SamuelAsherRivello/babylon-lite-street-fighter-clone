# Design

## Context

See `proposal.md` for motivation and `specs/` for observable requirements. The planning workspace is currently a non-Git directory containing only the saved prompt and OpenSpec setup; it has no app or README. The template repository's current default branch is `main`, the shared skills library's is `master`, and the multiplayer server's is `main`; use the current revisions and inspect their instructions before project edits. The multiplayer server README describes a reusable Colyseus service with a shared client, a game registry, game-isolated rooms, in-memory state, Vercel Hobby hosting, no durable identity, and possible session termination around five minutes.

## Goals / Non-Goals

**Goals:**

- Ship a complete local and online two-player game whose normal setup and local match can be followed from the game README.
- Keep one combat contract for local play and server-judged online play, with server authority for competitive outcomes.
- Release the server support before wiring the game client to its versioned shared package, then verify a public two-client match.

**Non-Goals:**

- Reproduce original ROM code, sprite sheets, music, logos, or exact stage art.
- Add ranked matchmaking, accounts, persistent profiles, long-term match history, or a production availability guarantee.
- Add a solo tournament campaign, additional legacy roster characters, or mechanics from later Street Fighter editions.

## Decisions

### Repository and delivery shape

Create the game from the current template through its GitHub template flow and work in its local checkout. Before generation, check whether the intended `SamuelAsherRivello/babylon-lite-street-fighter-clone` name is available; never overwrite a collision. Preserve this prompt and OpenSpec change when establishing the checkout. Read the generated `AGENTS.md` and template checklist before adapting files. Import shared skills as real files, resolve template/library overlaps without overwriting local changes, and record source revisions. Keep template layout, app shell, version source, corner UI roles, and Actions release/Pages workflows unless a documented need requires a change.

Use one end-to-end change for the requested complete deliverable, with Foundation, Multiplayer Setup, and Gameplay Polish as sequential implementation gates. This keeps the user's complete acceptance criteria in one contract while preserving the prompt's order: a playable local foundation first, shared service support and two-client integration second, and final content/polish and public verification last.

### One deterministic combat core

Represent each fighter's attacks as data: command pattern, startup/active/recovery frames, hit and hurt geometry, damage, hit/block stun, pushback, and allowed character states. Implement combat as a fixed-step deterministic rules module with explicit match phases, buffered directional history, bounded stage movement, facing, trades, and round resolution. Local versus runs the module directly. Online mode uses the same move definitions/rule module in the server and client build, packaged or exposed through the server release so duplicated move tables cannot drift. The server accepts bounded input frames and makes all final hit, health, timer, and winner decisions. Clients predict only immediate animation/movement feedback and reconcile to snapshots; cosmetic effects never decide gameplay.

The default round clock is 99 seconds and a match is first-to-two round wins. Resolve a simultaneous knockout as a draw; an equal-health timeout is also a draw. Start with same-keyboard mappings plus connected gamepads, and add a responsive touch layout for mobile. Store the third fighter's original name, silhouette, role, and commands as authored game content; do not copy another roster character.

### Narrow online room contract

Extend the existing shared service using its game registry, Colyseus room lifecycle, and shared client API. Add a namespaced `street-fighter-ii` game contract with a two-seat cap, fighter choice, ready/countdown, input messages, authoritative snapshots, round/match outcomes, leave, and rematch. Share an opaque room/invite code from the host to one opponent. Keep game state and messages isolated from drawing, Sumo, Garden, Gauntlet, and other registered games. Inspect the current admission and room-code implementation before choosing the precise API; add protocol support rather than emulating multiplayer locally if the existing API lacks private invite admission.

On disconnect, freeze that seat's input, keep the character vulnerable, and reserve its server-side identity for 15 seconds using short-lived recovery credentials. Rejoin only when the original room still exists; otherwise show that the match was lost. After expiry, resolve a forfeit and release the seat. Do not add persistent identity. Keep matches within the existing hosting window where practical and explain that backend restarts, Vercel process routing, or a function lifetime can interrupt a match. Do not promise concurrent-room scale or durable recovery that the in-memory service does not provide. Add admission/isolation, latency, disconnect, reconnect, and capacity checks to the server release's verification path.

### Rendering, input, and launch

Use Babylon Lite with WebGPU and the template's 2DPixelPerfect integration, not the full Babylon.js distribution. Choose a side-view logical resolution after comparing the template shell with the stage, fighter proportions, HUD, and narrow mobile layout. Keep simulation positions precise; apply pixel alignment in rendering only. Use nearest-neighbor textures, disabled mipmaps, clamp-to-edge, `msaaSamples: 1`, DPR-managed canvas backing, and letterboxing when needed. Keep React HUD at CSS resolution and prevent HUD controls from intercepting game inputs.

The README is the tested launch guide and top-level product entry: link the public game, provide verified clean-checkout install/dev/build/test commands from actual package scripts, and describe how to reach local two-player mode. Explain backend configuration and how two separate browser sessions create/join an online duel. A README setup test must start from a clean checkout; browser verification must include a full local match, a full two-client public match, controls, resize/mobile emulation, runtime errors, asset paths, and replay. Preserve the prompt in the README's collapsible Original AI Prompt block and identify any later follow-up separately.

### Original assets and references

Use the playable SNES reference and Street Fighter II overview for rules, move identity, selection, round timing, and presentation; use Capcom/Nintendo material and screenshot searches from the saved prompt to study silhouette, frame poses, palette, stage depth, and HUD hierarchy. Draw or generate new sprites, portraits, UI, stages, music, and effects and record their provenance. References guide behavior and art direction only; they are not asset sources.

## Risks / Trade-offs

- [Risk] The fighting game needs frame-sensitive combat while the shared service synchronizes at network cadence → Keep server outcomes authoritative, use fixed-step state and bounded inputs, tune input buffering/interpolation in two-client play, and test simulated latency and jitter before release.
- [Risk] The shared service uses ephemeral in-memory room state and can route clients across instances → Exercise invite creation/join through the real deployed endpoint; document the supported room/session limits and show a useful recovery state when a room is unavailable.
- [Risk] A best-of-three match can approach the backend's function lifetime → Keep breaks/countdowns short, finish early on KOs, and explicitly test/document interruptions near the hosting limit without changing the 99-second reference timer.
- [Risk] Three custom animated fighters plus a full arcade HUD can reduce mobile readability or blur under scaling → Review actual desktop and narrow-mobile browser captures and tune logical resolution and UI placement before polish is complete.
- [Risk] Repository creation, service release, or Pages deployment can be blocked by name collision, credentials, or workflow failure → Preserve the completed local work, never replace repositories or force-push, and report the exact release/deployment gate that remains unverified.

## Migration Plan

1. Confirm the game repository name, generate the template-based game repository, import skills, and complete the template checklist.
2. Implement and verify local combat, roster, rendering, and README launch in the Foundation gate.
3. Track the shared-server change in that repository's OpenSpec, implement and test the server room/protocol, then release and verify it before client integration.
4. Pin the released server client/package; complete online UI, room/reconnect behavior, authored assets, controls, and responsive presentation.
5. Run scoped checks and real-browser local/online play, complete documentation, release and deploy through checked-in workflows, verify the public match, then sync local checkouts and complete applicable OpenSpec finalization.

If a client release is not compatible or deployment fails, keep the last known-good release active and do not claim the online game complete. Roll back using the repositories' documented release/deploy workflows; preserve server compatibility for existing game consumers.
