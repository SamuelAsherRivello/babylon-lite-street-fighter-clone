import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { contentConfig, getRenderingPolicy, logicalResolution, pixelPerfectOptions, stageImageSizes, STAGES } from '../src/content/babylon/config.js';
import { getInitializationMessage } from '../src/content/babylon/initialization.js';
import { getRenderResolutionDimensions } from '../src/content/babylon/render-resolution.js';

test('selects Babylon Lite 2D with the template pixel sampling settings', () => {
  assert.equal(getRenderingPolicy(contentConfig), 'pixel-perfect');
  assert.deepEqual(logicalResolution, {width:960,height:720});
  assert.equal(pixelPerfectOptions.engine.msaaSamples, 1);
  assert.equal(pixelPerfectOptions.texture.minFilter, 'nearest');
  assert.equal(pixelPerfectOptions.texture.magFilter, 'nearest');
  assert.equal(pixelPerfectOptions.texture.mipMaps, false);
  assert.equal(pixelPerfectOptions.texture.addressModeU, 'clamp-to-edge');
});

test('keeps render resolution positive and caps upscaling to the adapter limit', () => {
  assert.deepEqual(getRenderResolutionDimensions(1600,1200,'quarter'), {preset:'quarter',width:400,height:300,scale:.25});
  const capped = getRenderResolutionDimensions(1600,1200,'double',2048);
  assert.ok(capped.width <= 2048 && capped.height <= 2048);
  assert.deepEqual(getRenderResolutionDimensions(0,0), {preset:'native',width:0,height:0,scale:0});
});

test('shows a useful WebGPU fallback and initializes the real authored stage texture', async () => {
  assert.match(getInitializationMessage(false, new Error('unsupported')), /requires WebGPU/);
  assert.match(getInitializationMessage(true, new Error('decode failed')), /could not initialize/);
  assert.deepEqual(stageImageSizes.dojo, {width:1448,height:1086});
  assert.deepEqual(STAGES.map((stage) => stage.id), ['dojo','harbor','snow']);
  for (const stage of STAGES) {
    const file = stage.id === 'dojo' ? 'dojo-sunset-original.png' : stage.id === 'harbor' ? 'harbor-market-original.png' : 'snow-temple-original.png';
    assert.ok((await stat(new URL(`../documentation/art/${file}`, import.meta.url))).size > 100_000);
  }
  const artPath = new URL('../documentation/art/dojo-sunset-original.png', import.meta.url);
  assert.ok((await stat(artPath)).size > 100_000);
  const source = await readFile(new URL('../src/content/Content.jsx', import.meta.url), 'utf8');
  assert.match(source, /createEngine\(canvas, pixelPerfectOptions\.engine\)/);
  assert.match(source, /loadTexture2D\(engine, stageUrl, pixelPerfectOptions\.texture\)/);
  assert.match(source, /\[stageUrl, stageImageSize\]/);
  assert.match(source, /await startEngine\(engine\)/);
  assert.match(source, /disposeEngine\(engine\)/);
});
