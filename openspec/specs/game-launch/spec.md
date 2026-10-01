# game-launch

## Purpose

Ensures a new player or developer can find, start, and play the complete game from the repository README, including local two-player play and the steps needed to use online rooms.

## Requirements

### Requirement: Launch from the README
The root README MUST provide verified prerequisites and exact commands that start the game from a clean checkout, identify the local URL, and explain how to reach fighter select and local versus play without hidden setup steps.

#### Scenario: Start from a clean checkout
- **WHEN** a developer follows the README setup and launch instructions
- **THEN** the local game opens at the documented URL and can complete a two-player match

### Requirement: Explain online play setup
The README MUST explain how to configure or reach the supported multiplayer backend, create and share an online duel invitation, join from a second browser, and understand connection and reconnection behavior.

#### Scenario: Play online using README instructions
- **WHEN** two players follow the documented online setup and open the game independently
- **THEN** one can host a duel and the other can join and complete a match

### Requirement: Document controls and fighters
The README MUST list local and online controls, Ryu and Chun-Li move commands, the original fighter's identity and move commands, match rules, browser/WebGPU requirements, original-asset provenance, and known hosting limits.

#### Scenario: Find move instructions
- **WHEN** a player opens the README before launching
- **THEN** all three fighters' core attacks and special inputs and the round/match rules are described

### Requirement: Provide a public playable release
The released README MUST link to the deployed game and relevant source/server releases. The public build MUST load its assets under the GitHub Pages subpath and connect to the verified production server without requiring local configuration or secrets.

#### Scenario: Open the published game
- **WHEN** a player opens the README's public game link
- **THEN** the game loads with public asset paths, connects to the production backend, and offers playable local or online mode
