import {
  PROFILE_CONFIG,
  SiteProfileConfig,
  SOCIAL_ACCOUNTS,
  SocialAccount,
} from '../data/profile';
import { generateProfileMetaTagsHtml } from './seo';

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

export function generatePersonJsonLd(
  data: UserSiteData,
  baseUrl = 'https://itiswayneee.dev'
): Record<string, unknown> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const { profile, socials } = data;
  const cleanHandle = profile.alternateName.replace(/^@/, '');
  const slug = slugifyHandle(profile.slug || cleanHandle) || 'itiswayneee';

  const resolvedImage = profile.avatarImage.startsWith('http')
    ? profile.avatarImage
    : `${cleanBase}${profile.avatarImage.startsWith('/') ? '' : '/'}${profile.avatarImage}`;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${cleanBase}/#person`,
    name: profile.fullName,
    alternateName: cleanHandle,
    identifier: cleanHandle,
    url: cleanBase,
    mainEntityOfPage: `${cleanBase}/u/${slug}`,
    image: {
      '@type': 'ImageObject',
      '@id': `${cleanBase}/#avatar`,
      url: resolvedImage,
      contentUrl: resolvedImage,
      width: 800,
      height: 800,
      caption: `${profile.fullName} (@${cleanHandle})`,
    },
    description: profile.shortBio,
    email: `mailto:${profile.contactEmail}`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'personal',
      email: profile.contactEmail,
      url: cleanBase,
    },
    sameAs: socials.map((s) => s.url),
  };

  if (profile.jobTitle?.trim()) {
    schema.jobTitle = profile.jobTitle.trim();
  }
  if (profile.affiliation?.trim()) {
    schema.affiliation = {
      '@type': 'Organization',
      name: profile.affiliation.trim(),
    };
  }

  return schema;
}

export function generateSchemaGraphJsonLd(
  data: UserSiteData,
  baseUrl = 'https://itiswayneee.dev'
): Record<string, unknown> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanHandle = data.profile.alternateName.replace(/^@/, '');
  const personWithContext = generatePersonJsonLd(data, cleanBase);
  const { '@context': _ignoredContext, ...personNode } = personWithContext;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${cleanBase}/#website`,
        url: cleanBase,
        name: data.profile.fullName,
        alternateName: cleanHandle,
        description: data.profile.shortBio,
        publisher: {
          '@id': `${cleanBase}/#person`,
        },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${cleanBase}/#profilepage`,
        url: cleanBase,
        name: data.profile.fullName,
        dateModified: data.updatedAt,
        isPartOf: {
          '@id': `${cleanBase}/#website`,
        },
        about: {
          '@id': `${cleanBase}/#person`,
        },
        mainEntity: {
          '@id': `${cleanBase}/#person`,
        },
      },
      personNode,
    ],
  };
}

export function generateSeoHeadHtml(
  data: UserSiteData,
  baseUrl = 'https://itiswayneee.dev'
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const title = data.profile.fullName;
  const schema = generateSchemaGraphJsonLd(data, cleanBase);
  const jsonLdString = JSON.stringify(schema, null, 2).replace(/<\//g, '<\\/');
  const metaTagsHtml = generateProfileMetaTagsHtml(data.profile, {
    baseUrl: cleanBase,
    canonicalUrl: cleanBase,
    socials: data.socials,
  });

  return [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(cleanBase)}" />`,
    metaTagsHtml,
    `<script type="application/ld+json">\n${jsonLdString}\n</script>`,
  ].join('\n');
}
