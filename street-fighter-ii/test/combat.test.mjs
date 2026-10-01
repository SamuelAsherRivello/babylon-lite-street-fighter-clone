import test from "node:test";
import assert from "node:assert/strict";
import { createMatch, startMatch, stepMatch, resetRound } from "../src/game/combat.js";

const run = (match, one, two = {}, frames = 50) => { for (let i = 0; i < frames && match.phase === "fight"; i++) stepMatch(match, [one, two]); return match; };

test("light strike damages in range and block reduces damage", () => {
  const hit = startMatch(createMatch()); hit.players[0].x = 400; hit.players[1].x = 480;
  run(hit, { punch: "light" }, {}, 14);
  assert.equal(hit.players[1].health, 96);
  const blocked = startMatch(createMatch()); blocked.players[0].x = 400; blocked.players[1].x = 480;
  run(blocked, { punch: "light" }, { away: true }, 6);
  assert.equal(blocked.players[1].health, 99);
  assert.ok(blocked.players[1].blockStun > 0);
});

test("low attacks connect against crouchers while high attacks are evaded", () => {
  const match = startMatch(createMatch()); match.players[0].x = 400; match.players[1].x = 490;
  run(match, { punch: "light" }, { down: true }, 14);
  assert.equal(match.players[1].health, 100);
  const low = startMatch(createMatch()); low.players[0].x = 400; low.players[1].x = 490;
  run(low, { kick: "light" }, { down: true }, 15);
  assert.ok(low.players[1].health < 100);
  const jump = startMatch(createMatch()); jump.players[0].x = 400; jump.players[1].x = 490;
  for (let i = 0; i < 10; i++) stepMatch(jump, [{}, { jump: true }]);
  run(jump, { kick: "light" }, {}, 15);
  assert.equal(jump.players[1].health, 100, "low attacks pass below a high jump");
});

test("simultaneous knockouts draw and the round timer awards the healthier fighter", () => {
  const match = startMatch(createMatch({ fighters: ["ryu", "ryu"] })); match.players[0].health = 13; match.players[1].health = 13;
  match.players[0].x = 400; match.players[1].x = 480;
  run(match, { kick: "heavy" }, { kick: "heavy" }, 60);
  assert.equal(match.phase, "round-over"); assert.equal(match.roundWinner, "draw");
  const timeout = startMatch(createMatch({ roundSeconds: 0.02 })); timeout.players[0].health = 30; timeout.players[1].health = 20;
  stepMatch(timeout); stepMatch(timeout);
  assert.equal(timeout.roundWinner, "p1");
});

test("two round wins finish the match and reset starts a fresh match", () => {
  const match = startMatch(createMatch());
  match.players[0].health = 0; stepMatch(match);
  assert.equal(match.wins[1], 1); resetRound(match);
  match.players[0].health = 0; stepMatch(match);
  assert.equal(match.phase, "match-over"); assert.equal(match.winner, "p2");
  const rematch = resetRound(match);
  assert.equal(rematch.phase, "select"); assert.deepEqual(rematch.wins, [0, 0]);
});

test("round model clamps stage bounds and input history supports directional special move recognition", () => {
  const match = startMatch(createMatch()); match.players[0].x = 86;
  for (let i = 0; i < 30; i++) stepMatch(match, [{ away: true }, {}]);
  assert.ok(match.players[0].x >= 82);
  assert.ok(match.players[0].inputHistory.length < 12, "holding a direction does not fill the motion buffer with duplicates");
});

test("relative toward and away movement respects each fighter's facing", () => {
  const match = startMatch(createMatch({ fighters: ["ryu", "chunLi"] }));
  const left = match.players[0].x, right = match.players[1].x;
  stepMatch(match, [{ toward: true }, { toward: true }]);
  assert.ok(match.players[0].x > left);
  assert.ok(match.players[1].x < right);
});

test("directional specials require ordered commands and Chun-Li rapid kick lands four hits", () => {
  const ryu = startMatch(createMatch()); ryu.players[0].x = 400; ryu.players[1].x = 500;
  for (const input of [{ toward: true }, { down: true }, { down: true, toward: true, punch: "heavy" }, {}]) stepMatch(ryu, [input, {}]);
  assert.notEqual(ryu.players[0].attack?.type, "hadouken", "wrong command order is not accepted");
  for (const input of [{ down: true }, { down: true, toward: true }, { toward: true, punch: "heavy" }]) stepMatch(ryu, [input, {}]);
  assert.equal(ryu.players[0].attack?.type, "hadouken");
  run(ryu, {}, {}, 18);
  assert.ok(ryu.players[1].health < 100, "projectile special reaches a distant opponent");

  const chunLi = startMatch(createMatch({ fighters: ["chunLi", "ryu"] })); chunLi.players[0].x = 400; chunLi.players[1].x = 500;
  for (let i = 0; i < 3; i++) { stepMatch(chunLi, [{ kick: "light" }, {}]); stepMatch(chunLi, [{}, {}]); }
  assert.equal(chunLi.players[0].attack?.type, "hyakuretsu");
  run(chunLi, {}, {}, 28);
  assert.equal(chunLi.players[1].health, 83, "three distinct kicks activate the four-hit special after the first normal kick");
});

test("projectile specials travel across the stage and can be evaded by crouching", () => {
  const shot = startMatch(createMatch()); shot.players[0].x = 300; shot.players[1].x = 700;
  for (const input of [{ down: true }, { down: true, toward: true }, { toward: true, punch: "heavy" }]) stepMatch(shot, [input, {}]);
  assert.ok(shot.players[0].projectile, "Hadouken creates a visible projectile");
  const spawnX = shot.players[0].projectile.x;
  run(shot, {}, {}, 20);
  assert.ok(shot.players[0].projectile.x > spawnX, "projectile advances as the match steps");
  run(shot, {}, {}, 22);
  assert.ok(shot.players[1].health < 100, "a projectile hit deals damage when it crosses a standing opponent");

  const evaded = startMatch(createMatch()); evaded.players[0].x = 300; evaded.players[1].x = 700;
  for (const input of [{ down: true }, { down: true, toward: true }, { toward: true, punch: "heavy" }]) stepMatch(evaded, [input, { down: true }]);
  run(evaded, {}, { down: true }, 42);
  assert.equal(evaded.players[1].health, 100, "high projectiles pass over a crouching opponent");
});

test("every selectable fighter can win a round using the documented local attack inputs", () => {
  for (const fighter of ["ryu", "chunLi", "kaida"]) {
    const match = startMatch(createMatch({ fighters: [fighter, "ryu"] }));
    match.players[0].x = 400; match.players[1].x = 480;
    match.players[1].health = 13;
    for (let i = 0; i < 40 && match.phase === "fight"; i++) stepMatch(match, [{ kick: "heavy" }, {}]);
    assert.equal(match.phase, "round-over", `${fighter} should defeat a neutral opponent`);
    assert.equal(match.roundWinner, "p1", `${fighter} should win the round`);
  }
});

test("holding forward does not trigger Chun-Li's double-tap special", () => {
  const match = startMatch(createMatch({ fighters: ["chunLi", "ryu"] }));
  for (let i = 0; i < 30; i++) stepMatch(match, [{ toward: true, kick: "heavy" }, {}]);
  assert.notEqual(match.players[0].attack?.type, "lightningStep");
  stepMatch(match, [{}, {}]);
  stepMatch(match, [{ toward: true }, {}]);
  stepMatch(match, [{}, {}]);
  stepMatch(match, [{ toward: true }, {}]);
  stepMatch(match, [{ toward: true, kick: "heavy" }, {}]);
  assert.equal(match.players[0].attack?.type, "lightningStep", "two distinct toward taps followed by kick trigger Lightning Step");
});
