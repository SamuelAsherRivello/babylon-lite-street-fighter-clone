import assert from "node:assert/strict";
import test from "node:test";
import { interpolateGameState, sampleGameState } from "../src/game/presentation.js";

const state = (x, health = 100) => ({ phase: "fight", fighters: [{ x, y: 520, vx: 100, vy: 0, facing: 1, health, projectile: { x: x + 50, y: 450 } }] });

test("interpolates fighter positions while preserving authoritative combat fields", () => {
  const result = interpolateGameState(state(100), state(200, 75), 0.25);
  assert.equal(result.fighters[0].x, 125);
  assert.equal(result.fighters[0].health, 75);
  assert.equal(result.fighters[0].facing, 1);
  assert.equal(result.fighters[0].projectile.x, 175);
});

test("samples between timestamped snapshots and clamps outside the buffer", () => {
  const frames = [{ time: 100, state: state(100) }, { time: 150, state: state(200) }];
  assert.equal(sampleGameState(frames, 125).fighters[0].x, 150);
  assert.equal(sampleGameState(frames, 90), frames[0].state);
  assert.equal(sampleGameState(frames, 200), frames[1].state);
  assert.equal(sampleGameState([], 200), null);
});
