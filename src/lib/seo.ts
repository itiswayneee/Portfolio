import { SiteProfileConfig, SocialAccount } from '../data/profile';

export interface MetaTagDescriptor {
  name?: string;
  property?: string;
  content: string;
}

export interface GenerateMetaTagsOptions {
  baseUrl?: string;
  canonicalUrl?: string;
  socials?: SocialAccount[];
  twitterCard?: 'summary' | 'summary_large_image';
}

export function escapeMetaHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function resolveAbsoluteUrl(pathOrUrl: string, baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const trimmed = pathOrUrl.trim();
  if (!trimmed) {
    return cleanBase;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `${cleanBase}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

function extractTwitterHandle(socials: SocialAccount[]): string | undefined {
  const xAccount = socials.find((s) => s.platform === 'x');
  if (!xAccount) {
    return undefined;
  }
  const raw = xAccount.handle.trim().replace(/^@+/, '');
  return raw ? `@${raw}` : undefined;
}

export function generateProfileMetaTags(
  profile: SiteProfileConfig,
  options: GenerateMetaTagsOptions = {}
): MetaTagDescriptor[] {
  const cleanBase = (options.baseUrl ?? 'https://itiswayneee.dpdns.org').replace(/\/+$/, '');
  const canonicalUrl = options.canonicalUrl
    ? resolveAbsoluteUrl(options.canonicalUrl, cleanBase)
    : cleanBase;
  const imageUrl = resolveAbsoluteUrl(profile.avatarImage, cleanBase);
  const username = profile.alternateName.trim().replace(/^@+/, '');
  const title = profile.fullName.trim();
  const description = profile.shortBio.trim();
  const imageAlt = title;
  const socials = options.socials ?? [];
  const twitterHandle = extractTwitterHandle(socials);
  const cardType = options.twitterCard ?? 'summary';

  const nameParts = title.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

  const tags: MetaTagDescriptor[] = [
    { name: 'description', content: description },
    { name: 'author', content: title },
    { name: 'robots', content: 'index, follow' },

    { property: 'og:type', content: 'profile' },
    { property: 'og:site_name', content: title },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:alt', content: imageAlt },

    { name: 'twitter:card', content: cardType },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
    { name: 'twitter:image:alt', content: imageAlt },
  ];

  if (username) {
    tags.push({ property: 'profile:username', content: username });
  }
  if (firstName) {
    tags.push({ property: 'profile:first_name', content: firstName });
  }
  if (lastName) {
    tags.push({ property: 'profile:last_name', content: lastName });
  }
  if (twitterHandle) {
    tags.push({ name: 'twitter:site', content: twitterHandle });
    tags.push({ name: 'twitter:creator', content: twitterHandle });
  }

  return tags;
}

export function renderMetaTagsHtml(tags: MetaTagDescriptor[]): string {
  return tags
    .map((tag) => {
      const attr = tag.property
        ? `property="${escapeMetaHtml(tag.property)}"`
        : `name="${escapeMetaHtml(tag.name ?? '')}"`;
      return `<meta ${attr} content="${escapeMetaHtml(tag.content)}" />`;
    })
    .join('\n');
}

export function generateProfileMetaTagsHtml(
  profile: SiteProfileConfig,
  options: GenerateMetaTagsOptions = {}
): string {
  return renderMetaTagsHtml(generateProfileMetaTags(profile, options));
}

export function applyProfileMetaTagsToDocument(
  profile: SiteProfileConfig,
  options: GenerateMetaTagsOptions = {}
): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  const baseUrl = options.baseUrl ?? window.location.origin;
  const canonicalUrl =
    options.canonicalUrl ?? `${window.location.origin}${window.location.pathname}`;

  document.title = profile.fullName;

  let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = resolveAbsoluteUrl(canonicalUrl, baseUrl);

  const tags = generateProfileMetaTags(profile, {
    ...options,
    baseUrl,
    canonicalUrl,
  });

  for (const tag of tags) {
    const selector = tag.property
      ? `meta[property="${tag.property}"]`
      : `meta[name="${tag.name}"]`;
    let element = document.head.querySelector<HTMLMetaElement>(selector);
    if (!element) {
      element = document.createElement('meta');
      if (tag.property) {
        element.setAttribute('property', tag.property);
      } else if (tag.name) {
        element.setAttribute('name', tag.name);
      }
      document.head.appendChild(element);
    }
    element.content = tag.content;
  }
}

export function applyStructuredDataToDocument(schema: Record<string, unknown>): void {
  if (typeof document === 'undefined') {
    return;
  }

  let script = document.head.querySelector<HTMLScriptElement>(
    'script[type="application/ld+json"]'
  );
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema, null, 2);
}
