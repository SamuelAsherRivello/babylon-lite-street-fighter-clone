# Design

## Context

See proposal.md for the user-visible defect. `FightGame.jsx` selects a pose by index and renders it from one shared 8-column, 3-row background atlas. Inspection of `fighters-original.png` shows character artwork touching or crossing the assumed column boundaries, so the current CSS crop cannot reliably isolate some attack poses.

## Goals / Non-Goals

**Goals:**
- Give each fighter a correctly framed set of the eight gameplay poses.
- Keep pose indexing, fighter identity, facing, feet baseline, and pixel-art scaling consistent in local and online presentation.
- Make frame containment and visual verification repeatable.

**Non-Goals:**
- Change combat rules, attack timing, network state, controls, stages, or overall HUD layout.
- Claim six unique authored attack drawings when the game currently differentiates strengths through motion profiles.

## Decisions

- Use one transparent source atlas per fighter as a generation aid, then extract the largest connected full-body silhouette for each of its eight expected poses into individual transparent PNGs. Individual runtime images remove sprite-sheet cropping and neighboring-pose bleed entirely.
- Treat the existing sheet as a character/style reference only. Normalize each extracted pose into a 512-by-512 canvas, keep at least an 8px transparent perimeter, scale all poses for a fighter consistently, and place grounded poses on a shared baseline. Place the jump pose above the grounded baseline.
- Map the existing pose selection to the per-pose images. Character selection uses that fighter's idle image. Preserve nearest-neighbor pixel scaling, facing transforms, and existing strength-specific attack motion profiles.
- Keep generated source atlases and the extraction utility for reproducibility, and add a contact sheet of the final independent poses for visual review. Make the game and README reference only validated frame assets.

## Risks / Trade-offs

- Generated frames may vary in character design or scale across poses → inspect all 24 isolated images and iterate before integration; reject any cropped silhouettes, identity drift, or inconsistent grounded baseline.
- Extraction may discard disconnected costume detail or noise → inspect the 24-frame contact sheet and compare every pose against its source before integration.
- Per-pose assets add files and requests → retain static Vite imports so each image is cached by the browser and included in the production bundle.

## Migration Plan

Add the three source atlases and extraction utility, inspect all extracted frames, integrate direct image selection, verify gameplay at desktop and mobile playfield sizes, and update the README artwork reference. If visual QA fails, revise the assets before release. Publish only after local tests and a production build pass, then verify the deployed version.
