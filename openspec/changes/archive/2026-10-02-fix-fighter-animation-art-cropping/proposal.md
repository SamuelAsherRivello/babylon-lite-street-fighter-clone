# Proposal

## Why

The published v0.0.8 game still shows detached or cropped limbs during fighter animations, despite idle poses rendering correctly. This breaks animation readability in active matches and requires an asset/rendering correction verified across all selectable fighters and attack poses.

## What Changes

- Replace or reframe the fighter animation artwork so every displayed pose is a complete, isolated image with consistent foot anchoring.
- Update the fighter renderer to use the corrected pose bounds without neighboring pose fragments or cropped limbs.
- Verify idle, movement, jump, punch, kick, hit, and block presentation for Ryu, Chun-Li, and Kaida at desktop and narrow viewport sizes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `fighting-game`: Fighter poses must remain complete and visually isolated throughout gameplay animation, including attacks.

## Impact

Affected files are the fighter artwork in `street-fighter-ii/documentation/art/`, pose selection and fighter rendering in `street-fighter-ii/src/game/FightGame.jsx`, and associated styling in `street-fighter-ii/src/ui/style.css`. The change may add a small asset preparation script or frame metadata if needed. Combat simulation and multiplayer state are unchanged.
