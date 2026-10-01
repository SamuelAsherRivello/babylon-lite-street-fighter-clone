# online-duels

## Purpose

Defines fair two-player online matches, from room invitation and fighter readiness through server-judged rounds, recovery, rematch, and isolation from other games on the shared service.

## Requirements

### Requirement: Create and join a two-player duel
The online game MUST let a player create a private duel invitation and let a second player join it, with clear connecting, waiting, full, and error states. A room MUST admit no more than two active players and MUST remain isolated from all other game rooms.

#### Scenario: Invite an opponent
- **WHEN** a host creates an online room
- **THEN** the game displays a shareable join code or link that admits one opponent to that duel

### Requirement: Ready and start a match
Online players MUST select fighters independently and confirm readiness before a synchronized countdown starts. A match MUST NOT start with an empty seat or an unconfirmed selection.

#### Scenario: Start when both players are ready
- **WHEN** both connected players have selected fighters and marked ready
- **THEN** the server starts the same round and timer for both clients

### Requirement: Authoritative online combat
The server MUST own and validate online match phase, player input, legal movement, facing, attack timing, hit/block resolution, health, timer, round and match outcomes, and rematch transition. Clients MUST NOT submit health changes or decide competitive hits.

#### Scenario: Reject an invalid action
- **WHEN** a client sends an action that is malformed, out of bounds, impossible in the current phase, or exceeds input limits
- **THEN** the server rejects or safely ignores it without corrupting shared match state

### Requirement: Synchronize online presentation
Both clients MUST receive consistent fighter, health, timer, round, and match state. Local control feedback MUST remain responsive while remote fighter presentation is smoothed without overriding server-judged outcomes.

#### Scenario: Exchange attacks from two clients
- **WHEN** both players move, block, and attack during a live round
- **THEN** both clients converge on the same authoritative positions, health, hit results, timer, and round outcome

### Requirement: Recover a temporarily disconnected player
The service MUST reserve a disconnected player's seat and match identity for up to 15 seconds, reject a different client from claiming that seat during the window, and let the original player rejoin when the server process and match still exist. After the window expires, the match MUST resolve by a documented disconnect rule.

#### Scenario: Rejoin before timeout
- **WHEN** a player reconnects with valid room recovery credentials within 15 seconds
- **THEN** the player resumes the reserved seat and the current match state without restoring client-authoritative data

#### Scenario: Recovery window expires
- **WHEN** the player does not rejoin within 15 seconds
- **THEN** the match resolves using the documented forfeit or disconnect outcome and releases the seat

### Requirement: Rematch and return to lobby
After a match, connected players MUST be able to request a rematch or leave for selection/lobby. A single player's settings, focus loss, or local UI pause MUST NOT pause or reset the shared match for the opponent.

#### Scenario: Rematch after match result
- **WHEN** both players request a rematch
- **THEN** the room resets round state and begins a new fighter-ready flow without retaining health or round wins from the prior match

### Requirement: Expose connection and hosting limits
The game MUST communicate connection loss and recovery status and document that in-memory hosted matches may end when the backend process restarts or its hosting window expires. It MUST NOT claim persistent identity, match history, or uninterrupted service.

#### Scenario: Backend session ends
- **WHEN** the backend becomes unavailable or loses the in-memory room
- **THEN** clients show a recoverable failure state and explain that the interrupted match cannot be restored if its server state no longer exists
