#!/usr/bin/env node
/**
 * Rasterizes the original vector artwork in /art into the files the site uses.
 *
 *   art/hero-wing.svg -> src/assets/hero-wing.jpg  (high-quality master; Astro
 *                        generates the responsive AVIF/WebP/JPEG variants at build)
 *   art/favicon.svg   -> public/favicon.svg, public/favicon.ico (16+32),
 *                        public/apple-touch-icon.png (180), public/icon-512.png
 *
 * Run with `npm run art` after editing anything in /art. Outputs are committed so
 * CI never needs to re-render them.
 */
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...parts) => resolve(root, ...parts);

const HERO_WIDTH = 2560; // viewBox is 1600 units wide, so this renders at 1.6x.

async function renderHero() {
  const out = p('src/assets/hero-wing.jpg');
  await mkdir(dirname(out), { recursive: true });
  await sharp(p('art/hero-wing.svg'), { density: 72 * (HERO_WIDTH / 1600) })
    .resize(HERO_WIDTH)
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(out);
  return out;
}

function png(size) {
  // Render at 4x the target and downscale for crisp edges at small sizes.
  return sharp(p('art/favicon.svg'), { density: Math.max(72, (72 * size * 4) / 64) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Minimal ICO container holding PNG-encoded images (supported by all modern browsers). */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + images.length * 16;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function renderIcons() {
  await copyFile(p('art/favicon.svg'), p('public/favicon.svg'));
  const [i16, i32, i180, i512] = await Promise.all([png(16), png(32), png(180), png(512)]);
  await writeFile(
    p('public/favicon.ico'),
    buildIco([
      { size: 16, data: i16 },
      { size: 32, data: i32 },
    ]),
  );
  await writeFile(p('public/apple-touch-icon.png'), i180);
  await writeFile(p('public/icon-512.png'), i512);
}

const hero = await renderHero();
await renderIcons();
console.log(`Rendered ${hero} and icons in public/.`);
