/**
 * Site-wide settings and identity. Every claim here comes from
 * WILLIAM_HAHN_SITE_CONTEXT.md (confirmed facts only). Edit copy here, not in components.
 */
import { PUBLIC_CONTACT_EMAIL, PUBLIC_GITHUB_URL, PUBLIC_LINKEDIN_URL } from 'astro:env/server';

export const site = {
  url: 'https://hahn3.com',
  name: 'William Hahn',
  /** Shown in the browser tab and search results. */
  title: 'William Hahn — Engineering & Technology Executive · Aerospace Engineer',
  description:
    'William Hahn is an engineering and technology executive and aerospace engineer working across industrial software, digital transformation, data and AI, and practical product building.',
  locale: 'en_US',
  themeColor: '#081426',
  ogImage: {
    path: '/og-image.jpg',
    width: 1200,
    height: 630,
    alt: 'William Hahn — Engineering, technology and aerospace. An aircraft wing above clouds at sunset.',
  },
} as const;

export const profile = {
  name: 'William Hahn',
  eyebrow: ['Engineering', 'Technology', 'Aerospace'],
  headline:
    'Engineering & technology executive, aerospace engineer, and innovation leader with a passion for turning complex ideas into practical, high-impact solutions.',
  /** Short first-person bio used on the home intro. */
  intro:
    'I work at the intersection of aerospace, engineering, and technology—building teams, products, and solutions that turn complex challenges into practical results.',
  currentTitle: 'Director of Solutions Consulting',
  currentEmployer: 'Siemens Digital Industries Software',
  /** School and graduation year intentionally omitted (not confirmed). */
  education: 'Bachelor of Science, Aerospace Engineering',
  knowsAbout: [
    'Aerospace engineering',
    'Systems engineering and integration',
    'Industrial software',
    'Digital transformation',
    'Data and AI',
    'Engineering leadership',
  ],
} as const;

export type NavItem = { label: string; href: string; id: string };

/** Section anchors. Root-relative so they also work from the 404 page. */
export const nav: NavItem[] = [
  { label: 'Home', href: '/#home', id: 'home' },
  { label: 'About', href: '/#about', id: 'about' },
  { label: 'Experience', href: '/#experience', id: 'experience' },
  { label: 'Projects', href: '/#projects', id: 'projects' },
  { label: 'Connect', href: '/#connect', id: 'connect' },
];

/* -------------------------------------------------------------------------- */
/* Owner-supplied public profiles and contact address                          */
/* -------------------------------------------------------------------------- */

function optionalUrl(name: string, value: string | undefined, allowedHosts: string[]) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`${name} must be an absolute URL, received "${trimmed}".`);
  }
  if (url.protocol !== 'https:' || !allowedHosts.includes(url.hostname)) {
    throw new Error(`${name} must be an https:// URL on ${allowedHosts.join(' or ')}.`);
  }
  return url.toString();
}

function optionalEmail(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error(`PUBLIC_CONTACT_EMAIL is not a valid address: "${trimmed}".`);
  }
  return trimmed;
}

/**
 * Owner-confirmed values. Build-time variables (PUBLIC_LINKEDIN_URL, PUBLIC_GITHUB_URL,
 * PUBLIC_CONTACT_EMAIL — e.g. GitHub repository variables) override them when set.
 */
const confirmed = {
  linkedinUrl: 'https://www.linkedin.com/in/william-hahn-iii/',
  githubUrl: 'https://github.com/whahn1983',
  // Stored in parts so the address never appears verbatim in source or HTML; the page
  // assembles it in the browser (see components/ContactEmail.astro).
  contactEmail: ['bill', 'hahn3.com'].join('@'),
};

export const owner = {
  linkedinUrl: optionalUrl('PUBLIC_LINKEDIN_URL', PUBLIC_LINKEDIN_URL || confirmed.linkedinUrl, [
    'linkedin.com',
    'www.linkedin.com',
  ]),
  githubUrl: optionalUrl('PUBLIC_GITHUB_URL', PUBLIC_GITHUB_URL || confirmed.githubUrl, [
    'github.com',
  ]),
  contactEmail: optionalEmail(PUBLIC_CONTACT_EMAIL || confirmed.contactEmail),
} as const;
