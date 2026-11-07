/**
 * Page content: expertise, about narrative, experience, projects and links.
 * Sourced from WILLIAM_HAHN_SITE_CONTEXT.md. Items that still need owner confirmation
 * are marked with TODO(owner) comments and kept deliberately conservative.
 */
import type { IconName } from '../lib/icons';
import { owner } from './site';

/* --------------------------------- Expertise -------------------------------- */

export type Expertise = { title: string; description: string; icon: IconName };

export const expertise: Expertise[] = [
  {
    title: 'Aerospace',
    description: 'Aviation, flight operations, and space systems',
    icon: 'plane',
  },
  { title: 'Engineering', description: 'From concept to real-world systems', icon: 'gear' },
  {
    title: 'Industrial Software',
    description: 'Digital transformation for complex operations',
    icon: 'layers',
  },
  { title: 'Innovation', description: 'New ideas, products, and ventures', icon: 'rocket' },
];

/* ----------------------------------- About ---------------------------------- */

export const about = {
  title: 'Systems thinking, from the space station to the factory floor.',
  paragraphs: [
    'I’m an aerospace engineer by training and an engineering and technology leader by practice. The thread through my career is the same: understand complex systems well enough to make them work better, and help the people around them do the same.',
    'I spent about a decade in the NASA Johnson Space Center environment working on International Space Station systems engineering and integration—work that built a strong foundation in complex, safety-critical engineering systems. I’ve also worked in energy infrastructure, including pipeline integrity with Sunoco / Energy Transfer, translating engineering and operational requirements into real-world systems.',
    'Today I lead solutions consulting at Siemens Digital Industries Software, helping organizations apply industrial software, digital transformation, and data and AI to manufacturing operations, product lifecycle processes, and engineering.',
    'Alongside that work, I build things independently—through H3 Consulting Partners, my Texas-based consulting practice, and through software products of my own.',
  ],
  focus: [
    'Systems thinking',
    'Engineering leadership',
    'Industrial digitalization',
    'Data & AI',
    'Innovation & entrepreneurship',
  ],
};

/* -------------------------------- Experience -------------------------------- */

export type Role = {
  organization: string;
  /** Exact title where confirmed; otherwise a description of the work area. */
  role: string;
  summary: string;
  highlights?: string[];
};

export const currentRole: Role = {
  organization: 'Siemens Digital Industries Software',
  role: 'Director of Solutions Consulting',
  summary:
    'Leading presales solutions consulting teams and a Data & AI use-case function, and partnering across go-to-market teams on industrial software and digital transformation.',
  highlights: [
    'Industrial software for manufacturing operations, product lifecycle processes, and engineering',
    'Industry experience across life sciences, consumer packaged goods, energy, chemicals, and infrastructure',
    'Working across a portfolio that includes Teamcenter, Opcenter, Tecnomatix, Simcenter, Mendix, RapidMiner, and Dotmatics',
  ],
};

/**
 * Earlier experience, intentionally shown without dates or ordering claims.
 * TODO(owner): confirm employer of record, exact titles and chronology before adding a
 * dated timeline; confirm official award names (NASA Spaceflight Awareness honor and a
 * program manager's commendation) before displaying them.
 */
export const previousRoles: Role[] = [
  {
    organization: 'NASA Johnson Space Center',
    role: 'International Space Station systems engineering & integration',
    summary:
      'About a decade in the NASA JSC environment on ISS systems engineering and integration (SE&I), building a foundation in complex, safety-critical engineering systems.',
  },
  {
    organization: 'Sunoco / Energy Transfer',
    role: 'Pipeline integrity & energy infrastructure',
    summary:
      'Energy infrastructure work in pipeline integrity, translating engineering and operational requirements into real-world systems.',
  },
  {
    organization: 'Booz Allen Hamilton',
    // TODO(owner): add exact role once verified.
    role: 'Professional experience',
    summary: 'Earlier professional experience with the management and technology consulting firm.',
  },
];

export type Capability = { title: string; description: string };

export const capabilities: Capability[] = [
  {
    title: 'Systems engineering & integration',
    description: 'Complex, safety-critical systems—from requirements through integration.',
  },
  {
    title: 'Engineering & technology leadership',
    description: 'Leading solutions consulting teams and cross-functional go-to-market work.',
  },
  {
    title: 'Industrial digital transformation',
    description: 'Manufacturing operations, product lifecycle, and engineering software.',
  },
  {
    title: 'Enterprise software & solutions consulting',
    description: 'Presales solutions consulting for engineering and enterprise software.',
  },
  {
    title: 'Data & AI enablement',
    description: 'Identifying and shaping practical, high-value use cases.',
  },
  {
    title: 'Practical product building',
    description: 'Web and iOS applications, automation, and integrations.',
  },
];

/* --------------------------------- Projects --------------------------------- */

export type ProjectStatus = 'available' | 'in-development';

export type Project = {
  name: string;
  kind: string;
  status: ProjectStatus;
  description: string;
  tags?: string[];
  note?: string;
  link?: { label: string; href: string };
  /** Set to false to keep a drafted entry out of the published site. */
  published?: boolean;
};

export const projects: Project[] = [
  {
    name: 'H3 Consulting Partners',
    kind: 'Consulting business',
    status: 'available',
    description:
      'Independent advisory and technology services focused on practical automation, data-driven solutions, and industry expertise.',
    tags: ['Automation & custom applications', 'Data & AI enablement', 'Industry advisory'],
    note: 'An independent business, separate from my role at Siemens.',
    link: { label: 'Visit h3consultingpartners.com', href: 'https://h3consultingpartners.com' },
  },
  {
    name: 'IFATC Companion',
    kind: 'iOS app',
    status: 'available',
    // TODO(owner): confirm which features are publicly shipped before listing them.
    description:
      'A companion app for Infinite Flight, designed to bring a more immersive air-traffic-control radio experience to flight simulation.',
    tags: ['iOS', 'Flight simulation', 'Aviation'],
    note: 'Independent app; not affiliated with or endorsed by Infinite Flight.',
    link: {
      label: 'View on the App Store',
      href: 'https://apps.apple.com/us/app/ifatc-companion/id6785536132',
    },
  },
  {
    name: 'PyCashFlow',
    kind: 'Personal project',
    status: 'in-development',
    // TODO(owner): confirm status and whether a public landing page exists.
    description:
      'Personal finance cash-flow forecasting software, with web and iOS work exploring 12-month forecasts, a short-term cash view, scenario planning, and cash-balance warnings.',
    tags: ['Web', 'iOS', 'Forecasting'],
  },
  {
    name: 'Route optimization',
    kind: 'Engineering work',
    status: 'in-development',
    // TODO(owner): publish only if a broader technical portfolio is wanted.
    description:
      'Route optimization software for waste and recycling logistics, built in Python with optimization constraints.',
    tags: ['Python', 'Optimization', 'Logistics'],
    published: false,
  },
];

/* ----------------------------------- Links ---------------------------------- */

export type KeyLink = {
  label: string;
  description: string;
  href: string;
  icon: IconName;
};

const appStoreUrl = 'https://apps.apple.com/us/app/ifatc-companion/id6785536132';

/** Key links: entries without a confirmed URL are omitted automatically. */
export const keyLinks: KeyLink[] = [
  {
    label: 'H3 Consulting Partners',
    description: 'Independent advisory & technology services',
    href: 'https://h3consultingpartners.com',
    icon: 'briefcase',
  },
  ...(owner.linkedinUrl
    ? [
        {
          label: 'LinkedIn',
          description: 'Professional profile and experience',
          href: owner.linkedinUrl,
          icon: 'linkedin' as const,
        },
      ]
    : []),
  ...(owner.githubUrl
    ? [
        {
          label: 'GitHub',
          description: 'Code, tools, and personal projects',
          href: owner.githubUrl,
          icon: 'github' as const,
        },
      ]
    : []),
  {
    label: 'Published Apps',
    description: 'IFATC Companion on the App Store',
    href: appStoreUrl,
    icon: 'apps',
  },
];
