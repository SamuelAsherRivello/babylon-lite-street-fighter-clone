import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";
import test from "node:test";

const manifestUrl = new URL("../documentation/art/fighter-pose-manifest.json", import.meta.url);
const expectedFighters = ["ryu", "chunLi", "kaida"];
const expectedPoses = ["idle", "walk", "crouch", "jump", "punch", "kick", "hit", "block"];

function paeth(left, above, upperLeft) {
  const prediction = left + above - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const aboveDistance = Math.abs(prediction - above);
  const upperLeftDistance = Math.abs(prediction - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

function decodeRgbaPng(bytes) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(bytes.subarray(0, 8).equals(signature), "frame is a PNG");
  let width, height, bitDepth, colorType, interlace;
  const imageData = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") imageData.push(data);
    offset += length + 12;
    if (type === "IEND") break;
  }
  assert.equal(bitDepth, 8);
  assert.equal(colorType, 6, "frame keeps an RGBA alpha channel");
  assert.equal(interlace, 0, "frame uses a supported non-interlaced PNG layout");
  const rowBytes = width * 4;
  const inflated = inflateSync(Buffer.concat(imageData));
  const pixels = Buffer.alloc(rowBytes * height);
  let previous = Buffer.alloc(rowBytes);
  for (let y = 0; y < height; y += 1) {
    const scanline = y * (rowBytes + 1);
    const filter = inflated[scanline];
    const row = Buffer.alloc(rowBytes);
    for (let index = 0; index < rowBytes; index += 1) {
      const raw = inflated[scanline + 1 + index];
      const left = index >= 4 ? row[index - 4] : 0;
      const above = previous[index];
      const upperLeft = index >= 4 ? previous[index - 4] : 0;
      const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above : filter === 3 ? Math.floor((left + above) / 2) : filter === 4 ? paeth(left, above, upperLeft) : null;
      assert.notEqual(predictor, null, `supported PNG filter ${filter}`);
      row[index] = (raw + predictor) & 0xff;
    }
    row.copy(pixels, y * rowBytes);
    previous = row;
  }
  return { width, height, pixels };
}

function countOpaqueComponents(pixels, width, height) {
  const visited = new Uint8Array(width * height);
  const pending = new Uint32Array(width * height);
  let components = 0;
  for (let start = 0; start < visited.length; start += 1) {
    if (visited[start] || pixels[start * 4 + 3] === 0) continue;
    components += 1;
    let head = 0, tail = 1;
    pending[0] = start;
    visited[start] = 1;
    while (head < tail) {
      const index = pending[head++];
      const x = index % width;
      const y = Math.floor(index / width);
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nextX = x + dx, nextY = y + dy;
          if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) continue;
          const next = nextY * width + nextX;
          if (visited[next] || pixels[next * 4 + 3] === 0) continue;
          visited[next] = 1;
          pending[tail++] = next;
        }
      }
    }
  }
  return components;
}

test("all fighter poses are isolated RGBA images with safe bounds and aligned grounded feet", async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
  assert.equal(manifest.frameSize, 512);
  assert.equal(manifest.groundBaselineY, 504);
  assert.deepEqual(Object.keys(manifest.fighters), expectedFighters);
  assert.deepEqual(manifest.poses, expectedPoses);

  for (const fighter of expectedFighters) {
    assert.deepEqual(Object.keys(manifest.fighters[fighter]), expectedPoses);
    for (const pose of expectedPoses) {
      const assetPath = manifest.fighters[fighter][pose];
      assert.match(assetPath, /^fighter-poses\/[a-zA-Z-]+\.png$/);
      const { width, height, pixels } = decodeRgbaPng(await readFile(new URL(`../documentation/art/${assetPath}`, import.meta.url)));
      assert.equal(width, 512, `${fighter} ${pose} width`);
      assert.equal(height, 512, `${fighter} ${pose} height`);

      let left = width, top = height, right = 0, bottom = 0;
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (pixels[(y * width + x) * 4 + 3] === 0) continue;
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x + 1);
          bottom = Math.max(bottom, y + 1);
        }
      }
      assert.ok(right > left && bottom > top, `${fighter} ${pose} has visible art`);
      assert.ok(left >= 8 && top >= 8 && right <= 504, `${fighter} ${pose} has an 8px transparent perimeter`);
      assert.equal(bottom, 504, `${fighter} ${pose} uses the shared floor anchor`);
      assert.equal(countOpaqueComponents(pixels, width, height), 1, `${fighter} ${pose} contains one connected fighter silhouette`);
    }
  }
});
