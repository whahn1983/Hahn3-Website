#!/usr/bin/env node
/**
 * Post-build checks for the static output in dist/ (run in CI before deploying):
 *  - required files exist (CNAME, robots, sitemap, 404, icons, OG image)
 *  - every root-relative href/src/srcset and CSS url() resolves to a file in dist/
 *  - in-page anchors point at ids that exist; no empty or "#" links
 *  - all internal URLs are root-relative (site is served from the domain root)
 *  - canonical / Open Graph URLs use https://hahn3.com
 *  - external links open safely (rel="noopener noreferrer")
 *  - no HTML comments, plain-text contact email, or "John Hahn" leak into output
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://hahn3.com';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const errors = [];
const fail = (msg) => errors.push(msg);

if (!existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
const files = walk(dist);
const rel = (file) => relative(dist, file);

/* ------------------------------ Required files ------------------------------ */
for (const required of [
  'index.html',
  '404.html',
  'CNAME',
  'robots.txt',
  'sitemap-index.xml',
  'favicon.ico',
  'favicon.svg',
  'apple-touch-icon.png',
  'og-image.jpg',
  'site.webmanifest',
]) {
  if (!existsSync(join(dist, required))) fail(`Missing dist/${required}`);
}
if (existsSync(join(dist, 'CNAME'))) {
  const cname = readFileSync(join(dist, 'CNAME'), 'utf8').trim();
  if (cname !== 'hahn3.com') fail(`CNAME should be "hahn3.com", found "${cname}"`);
}
const robots = existsSync(join(dist, 'robots.txt'))
  ? readFileSync(join(dist, 'robots.txt'), 'utf8')
  : '';
if (!robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`)) fail('robots.txt missing sitemap URL');

const sitemapXml = files
  .filter((f) => /sitemap-\d+\.xml$/.test(f))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');
if (!sitemapXml.includes(`<loc>${SITE}/</loc>`)) fail('Sitemap does not list the home page');
if (sitemapXml.includes('404')) fail('Sitemap should not list the 404 page');

/* ------------------------------- URL resolving ------------------------------ */
function resolvesToFile(pathname) {
  const clean = decodeURIComponent(pathname.split(/[?#]/)[0]);
  const target = join(dist, clean);
  if (!target.startsWith(dist)) return false;
  if (existsSync(target) && statSync(target).isFile()) return true;
  return existsSync(join(target, 'index.html'));
}

const ids = new Map(); // page -> Set(ids)
const htmlFiles = files.filter((f) => f.endsWith('.html'));
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  ids.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
const indexIds = ids.get(join(dist, 'index.html')) ?? new Set();

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const name = rel(file);

  if (/<!--/.test(html)) fail(`${name}: contains an HTML comment (use {/* */} in .astro files)`);
  if (/John Hahn/i.test(html)) fail(`${name}: contains "John Hahn"`);
  if (/\sstyle="/.test(html)) fail(`${name}: inline style attribute would be blocked by the CSP`);

  const email = process.env.PUBLIC_CONTACT_EMAIL?.trim();
  if (email && html.includes(email)) fail(`${name}: contact email appears in plain text`);
  if (/href="mailto:/i.test(html))
    fail(`${name}: plain mailto: link found (should be assembled client-side)`);

  // Canonical & social URLs (pages marked noindex, like 404, carry no canonical)
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!noindex && !canonical?.startsWith(`${SITE}/`)) fail(`${name}: canonical is "${canonical}"`);
  if (noindex && canonical) fail(`${name}: noindex page should not declare a canonical URL`);
  for (const [, prop, value] of html.matchAll(
    /<meta (?:property|name)="(og:url|og:image|twitter:image)" content="([^"]+)"/g,
  )) {
    if (!value.startsWith(`${SITE}/`)) fail(`${name}: ${prop} is not on ${SITE}: ${value}`);
    else if (!resolvesToFile(new URL(value).pathname))
      fail(`${name}: ${prop} target missing: ${value}`);
  }
  if (/<a\b[^>]*href="https:\/\/hahn3\.com/.test(html)) {
    fail(`${name}: links to ${SITE} should be root-relative`);
  }

  // Collect every URL-bearing attribute.
  const urls = [];
  for (const [, attr, value] of html.matchAll(
    /\s(href|src|srcset|imagesrcset|content)="([^"]*)"/g,
  )) {
    if (attr === 'content') continue;
    if (attr === 'srcset' || attr === 'imagesrcset') {
      for (const part of value.split(',')) urls.push({ attr, url: part.trim().split(/\s+/)[0] });
    } else urls.push({ attr, url: value });
  }

  for (const { attr, url } of urls) {
    if (attr === 'href' && (url === '' || url === '#')) {
      fail(`${name}: empty or "#" link`);
      continue;
    }
    if (/^(https?:)?\/\//.test(url)) continue;
    if (/^(mailto:|tel:|data:)/.test(url)) continue;
    if (url.startsWith('#')) {
      if (!ids.get(file).has(url.slice(1))) fail(`${name}: in-page anchor ${url} has no target`);
      continue;
    }
    if (!url.startsWith('/')) {
      fail(`${name}: relative URL "${url}" (use root-relative paths for the domain root)`);
      continue;
    }
    const [path, hash] = url.split('#');
    if (!resolvesToFile(path || '/')) fail(`${name}: ${attr}="${url}" does not resolve in dist/`);
    if (hash && (path === '/' || path === '') && !indexIds.has(hash)) {
      fail(`${name}: anchor ${url} has no matching id on the home page`);
    }
  }

  // External links must open safely.
  for (const [tag] of html.matchAll(/<a\b[^>]*href="https?:\/\/[^"]*"[^>]*>/g)) {
    if (!/rel="[^"]*noopener[^"]*"/.test(tag) || !/rel="[^"]*noreferrer[^"]*"/.test(tag)) {
      fail(`${name}: external link without rel="noopener noreferrer": ${tag}`);
    }
  }
}

/* ------------------------------ CSS references ------------------------------ */
for (const file of files.filter((f) => f.endsWith('.css'))) {
  const css = readFileSync(file, 'utf8');
  for (const [, raw] of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    if (raw.startsWith('data:') || raw.startsWith('#')) continue;
    if (!raw.startsWith('/')) {
      fail(`${rel(file)}: relative CSS url(${raw})`);
      continue;
    }
    if (!resolvesToFile(raw)) fail(`${rel(file)}: url(${raw}) does not resolve`);
  }
}

if (errors.length) {
  console.error(`verify-dist: ${errors.length} problem(s)\n - ${errors.join('\n - ')}`);
  process.exit(1);
}
console.log(
  `verify-dist: OK — ${htmlFiles.length} pages, ${files.length} files, all internal links and assets resolve at the domain root.`,
);
