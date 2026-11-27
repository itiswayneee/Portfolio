import {
  PROFILE_CONFIG,
  SiteProfileConfig,
  SOCIAL_ACCOUNTS,
  SocialAccount,
} from '../data/profile.js';
import { generateProfileMetaTagsHtml } from './seo.js';

export const SITE_URL = 'https://itiswayneee.dpdns.org';

export interface UserSiteData {
  profile: SiteProfileConfig;
  socials: SocialAccount[];
  updatedAt: string;
}

export function slugifyHandle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/^-|-$/g, '');
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getSiteData(): UserSiteData {
  return {
    profile: PROFILE_CONFIG,
    socials: SOCIAL_ACCOUNTS,
    updatedAt: '2026-11-26T00:00:00.000Z',
  };
}

function toDateOnly(isoDate: string): string {
  return isoDate.split('T')[0] ?? isoDate;
}

export function generatePersonJsonLd(
  data: UserSiteData,
  baseUrl = SITE_URL
): Record<string, unknown> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const { profile, socials } = data;
  const cleanHandle = profile.alternateName.replace(/^@/, '');

  const resolvedImage = profile.avatarImage.startsWith('http')
    ? profile.avatarImage
    : `${cleanBase}${profile.avatarImage.startsWith('/') ? '' : '/'}${profile.avatarImage}`;

  return {
    '@type': 'Person',
    '@id': `${cleanBase}/#person`,
    name: profile.fullName,
    alternateName: cleanHandle,
    url: `${cleanBase}/`,
    description: `${profile.fullName}, known online as ${cleanHandle}. Official personal website and social media profiles.`,
    image: {
      '@type': 'ImageObject',
      url: resolvedImage,
      width: 800,
      height: 800,
    },
    sameAs: socials.map((s) => s.url),
  };
}

export function generateSchemaGraphJsonLd(
  data: UserSiteData,
  baseUrl = SITE_URL
): Record<string, unknown> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanHandle = data.profile.alternateName.replace(/^@/, '');
  const personNode = generatePersonJsonLd(data, cleanBase);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${cleanBase}/#website`,
        url: `${cleanBase}/`,
        name: data.profile.fullName,
        alternateName: cleanHandle,
        description: `Official website of ${data.profile.fullName}, also known as ${cleanHandle}.`,
      },
      {
        '@type': 'ProfilePage',
        '@id': `${cleanBase}/#profilepage`,
        url: `${cleanBase}/`,
        name: `${data.profile.fullName} (@${cleanHandle}) - Official Website`,
        isPartOf: {
          '@id': `${cleanBase}/#website`,
        },
        mainEntity: {
          '@id': `${cleanBase}/#person`,
        },
        dateModified: toDateOnly(data.updatedAt),
      },
      personNode,
    ],
  };
}

export function generateSeoHeadHtml(
  data: UserSiteData,
  baseUrl = SITE_URL
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const title = data.profile.fullName;
  const schema = generateSchemaGraphJsonLd(data, cleanBase);
  const jsonLdString = JSON.stringify(schema, null, 2).replace(/<\//g, '<\\/');
  const metaTagsHtml = generateProfileMetaTagsHtml(data.profile, {
    baseUrl: cleanBase,
    canonicalUrl: `${cleanBase}/`,
    socials: data.socials,
  });

  return [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(`${cleanBase}/`)}" />`,
    metaTagsHtml,
    `<script type="application/ld+json">\n${jsonLdString}\n</script>`,
  ].join('\n');
}
