// @ts-check
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';

// Production origin. The site is served from the domain root via GitHub Pages with the
// custom domain hahn3.com, so no `base` path is configured.
const SITE_URL = 'https://hahn3.com';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    assets: '_astro',
    // Inline the (small) stylesheet so first paint doesn't wait on a CSS request.
    // Astro adds a CSP hash for the inlined <style>.
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  // No Markdown code blocks on this site; disabling Shiki keeps the build CSP-clean.
  markdown: {
    syntaxHighlight: false,
  },
  image: {
    // Generated variants are written into dist/_astro at build time (no runtime service).
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  env: {
    // Optional, owner-supplied public values. Leave unset to hide the related link.
    // Locally: copy .env.example to .env. In CI: set GitHub repository *variables*.
    schema: {
      PUBLIC_CONTACT_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
      }),
      PUBLIC_LINKEDIN_URL: envField.string({ context: 'server', access: 'public', optional: true }),
      PUBLIC_GITHUB_URL: envField.string({ context: 'server', access: 'public', optional: true }),
    },
  },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
        'upgrade-insecure-requests',
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
