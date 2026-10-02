# Spec Delta

## ADDED Requirements

### Requirement: Isolated fighter animation poses
Every fighter pose displayed during gameplay MUST show a complete, isolated character without cropped or detached artwork from another pose. Grounded poses MUST keep the character's feet aligned to a consistent floor anchor.

#### Scenario: Perform an attack with any fighter
- **WHEN** Ryu, Chun-Li, or Kaida performs a punch or kick at any strength
- **THEN** the full attack pose is visible without limbs clipped at frame boundaries or stray character fragments elsewhere in the arena

#### Scenario: Change between gameplay poses
- **WHEN** a fighter transitions among idle, movement, crouch, jump, hit, and block poses
- **THEN** only the selected complete pose is visible and every grounded pose remains aligned to the same floor baseline
