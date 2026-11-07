# hahn3.com

Source for **William Hahn’s** professional website — <https://hahn3.com>.

Built with [Astro](https://astro.build) 7, TypeScript and Tailwind CSS 4. The output is a fully
static site (no backend, database, accounts, analytics, cookies or tracking) deployed to
**GitHub Pages** by GitHub Actions and served from the domain root.

## Quick start

Requires **Node.js 22.23.4+** (see `.nvmrc`) and npm.

```sh
npm install
npm run dev        # http://localhost:4321 with hot reload
```

| Command                | What it does                                                             |
| ---------------------- | ------------------------------------------------------------------------ |
| `npm run dev`          | Local dev server                                                         |
| `npm run build`        | Production build to `dist/` (generates AVIF/WebP/JPEG hero variants)     |
| `npm run preview`      | Serve the built `dist/` locally                                          |
| `npm run check`        | Type-check `.astro` and `.ts` files (`astro check`)                      |
| `npm run format`       | Format everything with Prettier                                          |
| `npm run format:check` | Verify formatting (used in CI)                                           |
| `npm run validate`     | Everything CI runs: format check → type-check → build → `verify-dist`    |
| `npm run art`          | Re-render the hero image and icons from the SVG sources in `art/`        |
| `npm run og`           | Re-render `public/og-image.jpg` (needs Playwright + Chromium; see below) |

## Project structure

```
art/                     Original vector artwork (hero + favicon) — the source of truth
public/                  Copied as-is: CNAME, robots.txt, favicons, OG image, manifest
scripts/
  render-art.mjs         art/*.svg → src/assets/hero-wing.jpg + public icons (sharp)
  capture-og.mjs         Builds the 1200×630 social card (Playwright)
  verify-dist.mjs        Post-build link/asset/metadata checks (runs in CI)
src/
  assets/hero-wing.jpg   Hero master image; Astro creates responsive variants at build
  data/site.ts           Identity, SEO text, navigation, owner-configured links
  data/content.ts        Expertise, About, Experience, Projects, Key Links copy
  lib/icons.ts           Small original icon set (no icon library)
  components/            Header, Footer, cards, buttons, links…
  components/sections/   Hero, Intro, About, Experience, Projects, Connect
  layouts/BaseLayout.astro  <head>: SEO, Open Graph, JSON-LD, fonts, CSP
  pages/index.astro      Single page composed from the sections
  pages/404.astro        Not-found page (GitHub Pages serves dist/404.html)
.github/workflows/deploy.yml  Build, validate and deploy to GitHub Pages
```

v1 is a single page with anchored sections (`/#about`, `/#experience`, …). Each section is a
self-contained component, so it can move to its own route later (e.g. `src/pages/about.astro`)
by rendering that component inside `BaseLayout` and updating `nav` in `src/data/site.ts`.

## Editing content

All copy lives in two files — components contain no hard-coded text beyond headings:

- **`src/data/site.ts`** — name, page title/description, hero headline and intro, current
  title/employer, education, navigation.
- **`src/data/content.ts`** — expertise cards, About narrative, current and earlier roles,
  capabilities, projects and key links.

Conventions:

- Every fact comes from `WILLIAM_HAHN_SITE_CONTEXT.md` (the owner’s editorial brief, kept out of
  this repository because it contains internal notes). Anything still awaiting confirmation
  is marked `TODO(owner)` in code and listed under [Open items](#open-items-owner-confirmation).
- Projects have `status: 'available' | 'in-development'` (grouped automatically), a `links`
  list (store pages, websites) and an optional `published: false` to keep a drafted entry off
  the site (the route-optimization project is drafted this way).
- Links without a confirmed URL are omitted automatically — there are no placeholder `#` links.

### Optional owner-supplied values

LinkedIn, GitHub and a public contact email are **not** in the code. Provide them at build time;
leave them unset and the related links simply don’t render.

| Variable               | Example                                 | Notes                                 |
| ---------------------- | --------------------------------------- | ------------------------------------- |
| `PUBLIC_LINKEDIN_URL`  | `https://www.linkedin.com/in/<handle>/` | Must be `https://` on linkedin.com    |
| `PUBLIC_GITHUB_URL`    | `https://github.com/<handle>`           | Must be `https://` on github.com      |
| `PUBLIC_CONTACT_EMAIL` | an approved public address              | Shown in Connect; never in plain HTML |

- **Locally:** copy `.env.example` to `.env` and fill in values.
- **In production:** GitHub → repo **Settings → Secrets and variables → Actions → Variables**
  → _New repository variable_. Use **variables**, not secrets — these values are published.
  Re-run the workflow (or push) after changing them.

Malformed values fail the build with a clear message rather than publishing a broken link. The
email address is stored reversed + base64-encoded and assembled in the browser, so it never
appears as plain text or a `mailto:` link in the HTML.

### Images and artwork

The hero image, favicons and social card are **original artwork** drawn as SVG in `art/`
(procedural clouds, vector wing) — no stock photography or third-party imagery, so there are no
licensing obligations. To change them:

```sh
npm run art   # art/hero-wing.svg → src/assets/hero-wing.jpg; art/favicon.svg → public/ icons
npm run og    # src/assets/hero-wing.jpg → public/og-image.jpg
```

`npm run og` uses Playwright, which is intentionally not a project dependency:
`npm i --no-save playwright && npx playwright install chromium && npm run og`.
Rendered outputs are committed, so CI never needs to regenerate them.

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` runs on every push and pull request to `main`:

1. `npm ci`, Prettier check, `astro check`
2. `astro build` (with the optional repository variables above)
3. `scripts/verify-dist.mjs` — fails the run if any internal link or asset doesn’t resolve at
   the domain root, an anchor has no target, metadata points off `https://hahn3.com`, an
   external link lacks `rel="noopener noreferrer"`, or `CNAME`/sitemap/robots are wrong
4. On `main` only: upload `dist/` and deploy with `actions/deploy-pages`

Pull requests get the full build and validation but never deploy.

### One-time setup

1. **Enable Pages via Actions:** repo **Settings → Pages → Build and deployment → Source:
   GitHub Actions**.
2. **Merge to `main`** (or run the workflow manually from the _Actions_ tab) and confirm the
   _Deploy to GitHub Pages_ run is green.
3. **Custom domain:** **Settings → Pages → Custom domain** → `hahn3.com` → _Save_.
   With Actions-based publishing GitHub uses this setting; `public/CNAME` is shipped in the
   artifact too, but the setting is what counts.
4. **DNS** at the registrar/DNS host for `hahn3.com` (remove any conflicting apex `A`/`AAAA`/
   `ALIAS` records and parking pages first):

   | Type    | Name  | Value                                                                                      |
   | ------- | ----- | ------------------------------------------------------------------------------------------ |
   | `A`     | `@`   | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`                 |
   | `AAAA`  | `@`   | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
   | `CNAME` | `www` | `whahn1983.github.io`                                                                      |

   GitHub then redirects `www.hahn3.com` → `hahn3.com`. If DNS is hosted on Cloudflare, set
   these records to **DNS only** (grey cloud) so GitHub can issue the TLS certificate.

5. **Verify the domain (recommended):** GitHub profile **Settings → Pages → Add a domain** and
   add the `TXT` record it shows (`_github-pages-challenge-whahn1983.hahn3.com`). This prevents
   anyone else from claiming the domain on GitHub Pages.
6. **HTTPS:** once the certificate is issued (minutes to ~24 h after DNS propagates), tick
   **Enforce HTTPS** in **Settings → Pages**.

> The site is built for the domain root (`site: https://hahn3.com`, no `base` path), so the
> temporary `https://whahn1983.github.io/Hahn3-Website/` URL will look unstyled until the
> custom domain is active. That is expected.

### Security notes

- A hash-based Content-Security-Policy is emitted as a `<meta>` tag by Astro
  (`security.csp` in `astro.config.mjs`). GitHub Pages can’t set custom response headers, so
  header-only protections (`frame-ancestors`, HSTS preload, etc.) are not available there.
- Fonts (Inter, SIL Open Font License 1.1, via Fontsource) are self-hosted; the site makes no
  third-party requests.
- Icons are original line drawings in `src/lib/icons.ts`; the GitHub mark (Primer Octicons, MIT)
  is rendered only when a GitHub profile URL is configured.

## Launch checklist

- [ ] William reviews all copy on a preview build (`npm run build && npm run preview`).
- [ ] Resolve the open items below (or accept the conservative defaults).
- [ ] Set repository variables for LinkedIn / GitHub / email if they should appear.
- [ ] Pages source set to **GitHub Actions**; first deployment from `main` is green.
- [ ] DNS records in place; custom domain `hahn3.com` saved; domain verified; **Enforce HTTPS** on.
- [ ] Check <https://hahn3.com>, `https://www.hahn3.com` (redirect), a bad URL (404 page), and
      the link preview (e.g. LinkedIn Post Inspector) for the social card.
- [ ] Optional: add the site to Google Search Console and submit `https://hahn3.com/sitemap-index.xml`.

## Open items (owner confirmation)

These are deliberately conservative on the live site until confirmed:

- **LinkedIn and GitHub profile URLs** — not provided; links hidden until variables are set.
- **Public contact method** — no email published; Connect points to H3 Consulting Partners.
- **Earlier roles** — NASA JSC (ISS SE&I), Sunoco / Energy Transfer and Booz Allen Hamilton are
  shown without titles, dates or ordering. Confirm employer of record, exact titles and
  chronology before adding a timeline; Booz Allen role details are not yet known.
- **NASA awards** — Spaceflight Awareness honor and program manager’s commendation are not shown
  until official names/wording are confirmed.
- **Education** — school and graduation year not shown (not confirmed).
- **IFATC Companion** — shown as an iOS and Android app, described at a high level; confirm
  which features are publicly shipped before listing them. Only the App Store link is published:
  add the Google Play URL to its `links` in `src/data/content.ts`.
- **PyCashFlow** — shown as a production Web and iOS app with no links; add its public website
  and App Store URLs to `links` when ready, and confirm the listed capabilities.
- **Route optimization project** — drafted but unpublished (`published: false`).
- **Current employer prominence** — Siemens Digital Industries Software is named in About,
  Experience and the JSON-LD `worksFor`; confirm that’s acceptable.
- **Headshot** — none used; the aviation artwork carries the visual identity.
