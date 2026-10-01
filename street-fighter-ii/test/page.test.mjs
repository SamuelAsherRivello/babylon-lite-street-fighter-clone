import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import viteConfig from '../../vite.config.js';
import { defaultLayout, fitViewport, validateLayout } from '../src/ui/layout.js';

test('keeps the application and deployment roots aligned with the repository', () => {
  assert.equal(viteConfig.root, 'street-fighter-ii');
  assert.equal(viteConfig.base, '/babylon-lite-street-fighter-clone/');
});

test('fits the full arcade viewport at desktop and narrow aspect ratios', () => {
  assert.deepEqual(defaultLayout, { orientation: 'landscape', width: 4, height: 3, label: '4:3' });
  for (const [width,height] of [[1600,900],[400,900],[800,800],[160,100]]) {
    const fit = fitViewport(width,height,defaultLayout);
    assert.ok(fit.width <= width && fit.height <= height);
    assert.ok(Math.abs(fit.width / fit.height - 4/3) < 1e-9);
  }
  assert.throws(() => validateLayout({orientation:'portrait',width:16,height:9}), /orientation must match/);
});

test('preserves template corner roles and keeps keyboard controls in the game content', async () => {
  const [app, main, game, agents, sourceManifest] = await Promise.all([
    readFile(new URL('../src/ui/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/game/FightGame.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../../AGENTS.md', import.meta.url), 'utf8'),
    readFile(new URL('../../.agents/skills/SKILL-SOURCES.md', import.meta.url), 'utf8'),
  ]);
  for (const position of ['top_left','top_right','bottom_left','bottom_right']) assert.ok(app.includes(`<Corner position="${position}">`));
  assert.match(app, /noopener noreferrer/);
  assert.doesNotMatch(app, /Portrait|portrait_checkbox|key === "p"/);
  assert.match(main, /<StrictMode>/);
  assert.match(main, /FightGame/);
  assert.match(game, /<Content stageId=\{/);
  assert.match(game, /requestAnimationFrame\(frame\)/);
  assert.match(game, /sampleGameState\(frames, now - 90\)/);
  assert.match(game, /get\("mute"\) === "1"/);
  assert.match(game, /ArrowLeft/);
  assert.match(game, /pointercancel/);
  assert.match(agents, /four reusable `corner` instances/);
  assert.match(sourceManifest, /befef8e689341adf7b34ae89b9a665bc26ac1be8/);
});
