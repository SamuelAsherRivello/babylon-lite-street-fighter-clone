import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import test from 'node:test';
import { contentConfig, getRenderingPolicy, logicalResolution, pixelPerfectOptions } from '../src/content/babylon/config.js';
import { getInitializationMessage } from '../src/content/babylon/initialization.js';
import { getLogicalToCssScale, getShowcaseSpriteLayout } from '../src/content/babylon/pixel-perfect.js';
import { getScaleDisplayText, getWorldEdgeBorderLayout } from '../src/content/babylon/showcase-overlay.js';

test('defaults to Babylon Lite 2D and does not apply the pixel preset to 3D', () => {
  assert.deepEqual(contentConfig, { renderer: 'babylon-lite', style: '2d' });
  assert.equal(getRenderingPolicy(contentConfig), 'pixel-perfect');
  assert.equal(getRenderingPolicy({ renderer: 'babylon-lite', style: '3d' }), 'performance-scaled-3d');
  assert.equal(getRenderingPolicy({ renderer: 'other', style: '2d' }), 'renderer-specific');
  assert.deepEqual(pixelPerfectOptions.engine, { msaaSamples: 1 });
  assert.deepEqual(pixelPerfectOptions.texture, {
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
    minFilter: 'nearest',
    magFilter: 'nearest',
    mipMaps: false,
  });
});

test('uses integer logical-to-CSS scale when it fits and a positive fractional fallback below 1x', () => {
  assert.equal(getLogicalToCssScale(1280, 720), 4);
  assert.equal(getLogicalToCssScale(1000, 700), 3);
  assert.equal(getLogicalToCssScale(160, 90), 0.5);
  assert.equal(getLogicalToCssScale(0, 90), 0);
  assert.equal(getLogicalToCssScale(320, 180, { width: 0, height: 180 }), 0);
});

test('maps the centered showcase sprite to Lite backing-store pixels once for DPR', () => {
  assert.deepEqual(getShowcaseSpriteLayout(1280, 720, 2), {
    scale: 4,
    positionPx: [1280, 720],
    sizePx: [32, 32],
  });
  const fractionalDpr = getShowcaseSpriteLayout(160, 90, 1.25);
  assert.equal(fractionalDpr.scale, 0.5);
  assert.deepEqual(fractionalDpr.positionPx, [100, 56]);
  assert.deepEqual(fractionalDpr.sizePx, [32, 32]);
  assert.equal(logicalResolution.width / logicalResolution.height, 16 / 9);
});

test('formats the requested React viewport label and lays out a DPR-aware Babylon edge border', () => {
  assert.equal(getScaleDisplayText(2), 'Scale: 2x Integer');
  assert.equal(getScaleDisplayText(4), 'Scale: 4x Integer');
  assert.equal(getScaleDisplayText(0.5), 'Scale: 0.5x Fractional');

  const edges = getWorldEdgeBorderLayout(739, 416, 2.25);
  assert.equal(edges.length, 4);
  assert.deepEqual(edges[0], { positionPx: [831, 5.625], sizePx: [1662, 11.25] });
  assert.deepEqual(edges[1], { positionPx: [831, 930.375], sizePx: [1662, 11.25] });
  assert.deepEqual(edges[2], { positionPx: [5.625, 468], sizePx: [11.25, 936] });
  assert.deepEqual(edges[3], { positionPx: [1656.375, 468], sizePx: [11.25, 936] });
});

test('uses the requested corner title/body styles and ties the Lite border to the React dialog', async () => {
  const [app, styles, content] = await Promise.all([
    readFile(new URL('../src/ui/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/style.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/content/Content.jsx', import.meta.url), 'utf8'),
  ]);

  assert.match(app, /className="corner-title">/);
  assert.match(app, /aria-label="Open Babylon Lite settings">\(B\)<\/button> Babylon Lite/);
  assert.match(app, /className="corner-body">\{getScaleDisplayText/);
  assert.match(app, /Mode: 2DPixelPerfect/);
  assert.match(app, /key === "b"/);
  assert.match(app, /event\.key === "Escape"/);
  assert.match(app, /sceneBorderVisible: activeDialog === "babylon"/);
  assert.match(app, /processingPaused: activeDialog !== null/);
  assert.match(app, /activeDialog === "babylon" \? <div className="dialog_options babylon_settings"/);
  assert.match(app, /className=\{activeDialog === "babylon" \? "babylon_settings_dialog"/);
  assert.match(styles, /left: 50%/);
  assert.match(styles, /bottom: 9px/);
  assert.match(styles, /transform: translateX\(-50%\)/);
  assert.match(styles, /text-align: left/);
  assert.match(styles, /color: #e0694b/);
  assert.match(styles, /\.babylon_settings_dialog \.dialog_header h2,\s*\.babylon_settings_dialog \.dialog_close \{\s*color: #e0694b/);
  assert.match(styles, /\.babylon_viewport_info \.corner-title,\s*\.babylon_viewport_info \.corner-body \{\s*color: inherit/);
  assert.match(content, /visible: sceneBorderVisibleRef\.current/);
  assert.match(content, /const EDGE_ACCENT = \[224 \/ 255, 105 \/ 255, 75 \/ 255, 1\]/);
  assert.match(content, /borderSpritesRef\.current\.forEach\(\(border\) => updateSprite2D\(border, \{ visible: sceneBorderVisible \}\)\)/);
});

test('produces a clear WebGPU fallback and uses the engine-owned frame lifecycle', async () => {
  assert.match(getInitializationMessage(false, new Error('unsupported')), /requires WebGPU/);
  assert.match(getInitializationMessage(true, new Error('WebGPU adapter not available')), /requires WebGPU/);
  assert.match(getInitializationMessage(true, new Error('texture decode failed')), /could not initialize/);

  const [content, main] = await Promise.all([
    readFile(new URL('../src/content/Content.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.jsx', import.meta.url), 'utf8'),
  ]);
  assert.match(main, /<StrictMode>/);
  for (const expression of [
    /cancelled = false/,
    /cancelled = true/,
    /resizeObserver\?\.disconnect\(\)/,
    /window\.removeEventListener\("resize"/,
    /removeDprQuery\(\)/,
    /disposeSpriteRenderer\(renderer\)/,
    /disposeSpriteAtlas\(overlayAtlas\)/,
    /releaseTexture\(texture\)/,
    /disposeEngine\(engine\)/,
    /disposeSpriteAnimationBinding\(animationBinding\)/,
  ]) assert.match(content, expression);
  assert.match(content, /await createEngine\(canvas, pixelPerfectOptions\.engine\)/);
  assert.match(content, /await startEngine\(engine\)/);
  assert.match(content, /createSpriteAtlasFromFrames\(engine/);
  assert.match(content, /sceneBorderVisibleRef\.current/);
  assert.match(content, /getWorldEdgeBorderLayout\(/);
});

test('imports an original 32x32 hard-edged PNG with only black and gray pixels', async () => {
  const png = await readFile(new URL('../src/content/babylon/images/concentric-squares-32.png', import.meta.url));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

  let offset = 8;
  const idat = [];
  let width;
  let height;
  while (offset < png.length) {
    const size = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + size);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idat.push(data);
    }
    offset += size + 12;
    if (type === 'IEND') break;
  }

  assert.equal(width, 32);
  assert.equal(height, 32);
  const decoded = inflateSync(Buffer.concat(idat));
  const shades = new Set();
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    assert.equal(decoded[rowStart], 0, 'asset rows use the exact, non-smoothed PNG filter');
    for (let x = 0; x < width; x++) {
      const pixel = rowStart + 1 + x * 4;
      assert.equal(decoded[pixel], decoded[pixel + 1]);
      assert.equal(decoded[pixel], decoded[pixel + 2]);
      assert.equal(decoded[pixel + 3], 255);
      shades.add(decoded[pixel]);
    }
  }
  assert.deepEqual([...shades].sort((a, b) => a - b), [0, 64, 128, 192]);
});
