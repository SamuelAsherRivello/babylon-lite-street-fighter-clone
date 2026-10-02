# Tasks

## 1. Isolated fighter artwork

- [x] 1.1 Generate transparent source atlases for Ryu, Chun-Li, and Kaida and extract 24 standalone pose PNGs with consistent per-fighter scale, an 8px transparent edge, and aligned grounded baselines; inspect the contact sheet for complete silhouettes and identity consistency.
- [x] 1.2 Add a repeatable extraction utility, pose manifest, and focused asset checks that verify the 24 independent RGBA images, transparent perimeter, expected dimensions, connected silhouettes, and grounded baselines.

## 2. Rendering integration

- [x] 2.1 Replace the shared-sheet crop with direct per-pose image imports; verify idle, movement, crouch, jump, punch, kick, hit, and block select the correct complete pose for each fighter.
- [x] 2.2 Update the README artwork description and image reference to the validated fighter atlases; verify the links resolve to the final files.

## 3. Verification and release

- [x] 3.1 Run `npm test` and `npm run build` from the repository root; verify both pass.
- [x] 3.2 Inspect live gameplay at desktop and narrow viewport sizes for all three fighters, grounded foot alignment, facing, and every pose; publish the version and verify the deployed `version.txt` and public playtest.
