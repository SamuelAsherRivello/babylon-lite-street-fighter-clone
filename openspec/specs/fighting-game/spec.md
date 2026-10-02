# fighting-game

## Purpose

Defines the playable local arcade fighting experience, including the three selectable fighters, responsive combat rules, match outcomes, and presentation needed for a complete replayable game.

## Requirements

### Requirement: Fighter selection
The game MUST let each player select Ryu, Chun-Li, or the original third fighter before a local or online match. Both players may select the same fighter.

#### Scenario: Select fighters
- **WHEN** both players confirm a fighter
- **THEN** the match loads with the chosen fighters and displays their names and move lists

### Requirement: Distinct playable move sets
Each fighter MUST provide light, medium, and heavy punches and kicks plus at least three distinct special moves with directional commands, readable animations, and unique combat timings. Ryu MUST include Hadouken, Shoryuken, and Tatsumaki Senpukyaku; Chun-Li MUST include Hyakuretsukyaku and Spinning Bird Kick; the original fighter MUST have a distinct documented identity and moves.

#### Scenario: Execute a special move
- **WHEN** a player enters a selected fighter's valid special command and attack input within the input buffer
- **THEN** the game performs that fighter's move with its configured startup, hit, recovery, range, and reaction

### Requirement: Arcade combat
The game MUST resolve movement, facing, blocking, attacks, hit and hurt overlap, trades, hit-stun, block-stun, knockback, stage bounds, and airborne states consistently. A defender blocking in the correct direction MUST avoid full hit damage and receive the configured block response.

#### Scenario: Attack connects or is blocked
- **WHEN** an active attack overlaps a valid opponent hurtbox
- **THEN** the combat rules apply the move's hit or block outcome once and prevent repeated damage from the same attack window

### Requirement: Local two-player match
The game MUST be playable locally by two people using keyboard or gamepads, with an optional touch layout for supported two-player device use. Controls MUST include movement, jump, crouch, back-to-block, and three strengths each of punches and kicks, with safe input release after focus loss or cancellation.

#### Scenario: Play locally
- **WHEN** players select local versus and press their mapped controls
- **THEN** both fighters respond independently and the local match can be completed without a network connection

### Requirement: Round and match outcomes
The game MUST start timed 99-second rounds, award the round to the first fighter to deplete the opponent's health, resolve timeouts by remaining health, treat equal-health timeouts as a draw, and end a match when a fighter wins two rounds. It MUST offer replay and return-to-selection after a match.

#### Scenario: Complete a best-of-three match
- **WHEN** a fighter wins two rounds or all rounds finish in a draw
- **THEN** the match result is shown and players can rematch or return to fighter selection

### Requirement: Readable arcade presentation
The game MUST present a side-view stage, both fighters, health bars, timer, round/result state, and move feedback without obscuring play. Pixel-authored art MUST remain crisp and the complete stage and essential HUD MUST fit supported desktop and narrow mobile layouts.

#### Scenario: Resize the playfield
- **WHEN** the browser resizes, enters fullscreen, or uses a narrow viewport
- **THEN** both fighters and essential HUD remain visible without stretching the playfield or requiring page scrolling to play

### Requirement: Original presentation assets
The game MUST use newly authored fighter sprites, portraits, stages, interface art, music, and sound effects. Named reference characters may retain their requested names and move identities, but their art and audio MUST NOT be extracted from the ROM or copied from reference images.

#### Scenario: Load the roster and stages
- **WHEN** the player opens selection and starts a match
- **THEN** original game assets are loaded and the selected fighter and stage are represented consistently

### Requirement: Isolated fighter animation poses
Every fighter pose displayed during gameplay MUST show a complete, isolated character without cropped or detached artwork from another pose. Grounded poses MUST keep the character's feet aligned to a consistent floor anchor.

#### Scenario: Perform an attack with any fighter
- **WHEN** Ryu, Chun-Li, or Kaida performs a punch or kick at any strength
- **THEN** the full attack pose is visible without limbs clipped at frame boundaries or stray character fragments elsewhere in the arena

#### Scenario: Change between gameplay poses
- **WHEN** a fighter transitions among idle, movement, crouch, jump, hit, and block poses
- **THEN** only the selected complete pose is visible and every grounded pose remains aligned to the same floor baseline
