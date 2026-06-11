// アプリアイコン(PNG)を依存ライブラリなしで生成するスクリプト
// 使い方: npm run icons
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

// ---------- PNGエンコード ----------
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(size, getPixel) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let off = 0;
  for (let y = 0; y < size; y++) {
    raw[off++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = getPixel(x, y);
      raw[off++] = r;
      raw[off++] = g;
      raw[off++] = b;
      raw[off++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- 描画（符号付き距離関数 + 1pxアンチエイリアス） ----------
function rr(x, y, cx, cy, hw, hh, r) {
  const dx = Math.abs(x - cx) - (hw - r);
  const dy = Math.abs(y - cy) - (hh - r);
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
}

const coverage = (d) => Math.min(1, Math.max(0, 0.5 - d));

function dumbbellSDF(x, y, s, k) {
  const c = s / 2;
  return Math.min(
    rr(x, y, c, c, 0.345 * s * k, 0.038 * s * k, 0.03 * s * k), // バー
    rr(x, y, c - 0.155 * s * k, c, 0.05 * s * k, 0.2 * s * k, 0.045 * s * k), // 内プレート
    rr(x, y, c + 0.155 * s * k, c, 0.05 * s * k, 0.2 * s * k, 0.045 * s * k),
    rr(x, y, c - 0.27 * s * k, c, 0.042 * s * k, 0.14 * s * k, 0.04 * s * k), // 外プレート
    rr(x, y, c + 0.27 * s * k, c, 0.042 * s * k, 0.14 * s * k, 0.04 * s * k),
  );
}

function makeIcon(size, { fullBleed = false, scale = 1 } = {}) {
  const s = size;
  return encodePNG(size, (px, py) => {
    const x = px + 0.5;
    const y = py + 0.5;
    const bgA = fullBleed ? 1 : coverage(rr(x, y, s / 2, s / 2, s / 2, s / 2, s * 0.18));
    if (bgA <= 0) return [0, 0, 0, 0];
    // emerald-400 → teal-600 の斜めグラデーション
    const t = (x + y) / (2 * s);
    let r = 52 + (13 - 52) * t;
    let g = 211 + (148 - 211) * t;
    let b = 153 + (136 - 153) * t;
    const w = coverage(dumbbellSDF(x, y, s, scale));
    r = Math.round(r + (255 - r) * w);
    g = Math.round(g + (255 - g) * w);
    b = Math.round(b + (255 - b) * w);
    return [r, g, b, Math.round(bgA * 255)];
  });
}

writeFileSync(join(outDir, 'icon-512.png'), makeIcon(512));
writeFileSync(join(outDir, 'icon-192.png'), makeIcon(192));
writeFileSync(join(outDir, 'icon-maskable-512.png'), makeIcon(512, { fullBleed: true, scale: 0.78 }));
writeFileSync(join(outDir, 'apple-touch-icon.png'), makeIcon(180, { fullBleed: true, scale: 0.92 }));
console.log(`✓ icons generated in ${outDir}`);
