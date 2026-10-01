# Tasks

## 1. Establish the Game Repository

- [x] 1.1 Confirm the intended repository name is available, generate the game repository from the current template, and preserve this OpenSpec change and saved prompt in its checkout; verify the remote, template files, and OpenSpec artifacts are present.
- [x] 1.2 Read the generated `AGENTS.md` and template usage checklist; inspect package scripts, Babylon Lite documentation, release/Pages workflows, and pixel-perfect helpers before selecting APIs; record the template revision and verify each documented command/path against the checkout.
- [x] 1.3 Import the current shared skills library into `.agents/skills` as real files, resolve overlaps with template skills without overwriting custom guidance, and record source revisions; verify the expected skills are present and conflicts are explicitly resolved.
- [x] 1.4 Inspect the shared server's `AGENTS.md`, game registry, room/client APIs, source, tests, release/deploy workflow, and current release; verify the baseline checks pass and record current admission, reconnect, room, version, and hosting behavior.

## 2. Foundation: Local Combat

- [x] 2.1 Define a deterministic fixed-step match model, fighter data, attack frame windows, hit/hurt geometry, blocking, trades, stage bounds, input history, and round transitions; add focused tests for hits, blocks, simultaneous attacks/knockouts, timeouts, and reset, and verify the game test command passes.
- [x] 2.2 Implement the side-view stage, selection flow, health/timer HUD, three-fighter roster, local two-player controls, move buffering, and complete best-of-three match/replay flow; verify each fighter can win a local match using only documented controls.
- [x] 2.3 Create and integrate newly authored fighter sprites, portraits, stage art, HUD, effects, music, and sound; document asset provenance and move lists in the project docs, and verify every selected fighter/stage loads without placeholders or missing assets.
- [x] 2.4 Integrate Babylon Lite WebGPU rendering and pixel-perfect resize behavior using measured logical/stage dimensions; verify crisp rendering, readable HUD, correct input mapping, no blank-canvas failure, and full-stage visibility at desktop and narrow-mobile sizes.
- [ ] 2.5 Document the local versus launch, setup commands from the actual package scripts, keyboard/gamepad/touch mappings, rules, browser requirements, and the original prompt in the README; from a clean checkout, follow those commands and complete a local match.

## 3. Multiplayer Setup: Shared Server

- [x] 3.1 Create a focused OpenSpec change in the shared server repository for the `street-fighter-ii` game key, two-seat room protocol, invite/join, authoritative combat, bounded input messages, recovery, and regressions; verify its proposal/spec/design/tasks are ready before server edits.
- [x] 3.2 Implement the isolated two-player room, private invite/join contract, fighter/ready/countdown state, authoritative fixed-step combat, result/rematch flow, disconnect reservation, and 15-second recovery; verify invalid input, capacity, game isolation, two-client state agreement, departure, and recovery tests pass.
- [ ] 3.3 Update the server registry, shared client/rules package exports as needed, API documentation, feature catalog, and live deployment checks; verify existing game tests still pass and the server release includes the versioned game contract and rules.
- [ ] 3.4 Run server type checks and local integration tests, including simulated latency/jitter and fresh process/room loss; commit and push only scoped server changes, run the existing Release workflow, and verify the tagged client artifact and deployed backend pass game-specific live checks before client integration.

## 4. Gameplay Polish: Online Client and Full Documentation

- [ ] 4.1 Pin the exact verified server/client release in the game lockfile and implement online host/join, shareable invite, fighter selection, ready state, connection errors, responsive local feedback, snapshot reconciliation/interpolation, reconnect, and rematch; verify two local browser clients complete a match against the released server API.
- [ ] 4.2 Complete responsive touch and gamepad behavior, pause/settings focus handling, mobile HUD layout, server recovery messaging, and README instructions for backend configuration, room sharing, public play, hosting limits, controls, move lists, screenshots, and asset provenance; run the documented README launch path from a clean checkout.
- [ ] 4.3 Run game rule tests, server/game regressions, production build, and release preflight; inspect production asset paths under the Pages subpath and verify the displayed version matches the repository source of truth.

## 5. Public Verification and Finalization

- [ ] 5.1 Use a real WebGPU browser to complete a local match and a public two-client online match; verify all three fighters and specials, attack/block outcomes, timer/round results, room invite, reconnect/disconnect handling, rematch, desktop and narrow-mobile layout, emulated touch input, asset loading, and console/runtime health.
- [ ] 5.2 Release and deploy the game with the checked-in GitHub Actions workflows; verify the public README game link opens the live build and two independent clients complete a match against the released backend; record browser/GPU/device limits and any unverified behavior.
- [ ] 5.3 Synchronize local game and server checkouts with release-generated commits, verify clean scoped status and local/remote alignment, complete the game and server OpenSpec finalization steps when their acceptance criteria pass, and report repository/release/demo links plus verification evidence.
