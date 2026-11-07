#!/usr/bin/env node
/**
 * Generates public/og-image.jpg (1200×630 social preview card) from the hero artwork,
 * using the site's own font. Needs a Playwright Chromium install, which is *not* a
 * project dependency, e.g.:  npx -y playwright@latest install chromium && npm run og
 * The output is committed, so this only needs re-running when the card should change.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Inline assets as data URIs: pages loaded via setContent() cannot read file:// URLs.
const dataUri = (path, type) =>
  `data:${type};base64,${readFileSync(resolve(root, path)).toString('base64')}`;
const font = dataUri(
  'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  'font/woff2',
);
const hero = dataUri('src/assets/hero-wing.jpg', 'image/jpeg');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error(
    'Playwright is not installed. Run: npm i --no-save playwright && npx playwright install chromium',
  );
  process.exit(1);
}

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: Inter; font-weight: 100 900;
    src: url('${font}') format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; font-family: Inter, sans-serif; color: #fff; background: #081426; }
  .card { position: relative; width: 100%; height: 100%; overflow: hidden; }
  .card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 62% 30%; }
  .shade { position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(8,20,38,.92) 0%, rgba(8,20,38,.7) 38%, rgba(8,20,38,.05) 70%),
                linear-gradient(180deg, rgba(8,20,38,0) 60%, rgba(8,20,38,.75) 100%); }
  .content { position: absolute; inset: 0; padding: 64px 72px; display: flex; flex-direction: column; }
  .mark { font-weight: 700; font-size: 40px; letter-spacing: -0.02em; }
  .mark span, .domain span { color: #2684ed; }
  .eyebrow { margin-top: auto; font-size: 18px; font-weight: 600; letter-spacing: .32em; color: #e2e8f0; }
  .eyebrow i { font-style: normal; color: #5aa7ff; margin: 0 14px; }
  h1 { margin-top: 18px; font-size: 104px; line-height: 1; font-weight: 800; letter-spacing: -0.03em; }
  p { margin-top: 22px; font-size: 30px; line-height: 1.35; color: #e2e8f0; max-width: 640px; }
  .domain { margin-top: 36px; font-size: 22px; font-weight: 600; color: #cbd5e1; }
</style></head><body><div class="card">
  <img src="${hero}" alt="">
  <div class="shade"></div>
  <div class="content">
    <div class="mark">Hahn<span>3</span></div>
    <div class="eyebrow">ENGINEERING<i>·</i>TECHNOLOGY<i>·</i>AEROSPACE</div>
    <h1>William Hahn</h1>
    <p>Engineering &amp; technology executive, aerospace engineer, and innovation leader.</p>
    <div class="domain">hahn3.com</div>
  </div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const out = resolve(root, 'public/og-image.jpg');
await page.screenshot({ path: out, type: 'jpeg', quality: 86 });
await browser.close();
console.log(`Wrote ${out}`);
