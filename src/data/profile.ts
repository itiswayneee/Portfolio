export type SocialPlatform =
  | 'instagram'
  | 'x'
  | 'tiktok'
  | 'youtube'
  | 'github'
  | 'linkedin'
  | 'threads'
  | 'facebook'
  | 'snapchat'
  | 'spotify'
  | 'discord'
  | 'twitch'
  | 'medium'
  | 'substack'
  | 'google-scholar'
  | 'orcid'
  | 'website';

export interface SocialAccount {
  /** Platform identifier (determines the brand icon shown). */
  platform: SocialPlatform;
  /** Display name shown on the card. */
  label: string;
  /** Username or short handle displayed below the label. */
  handle: string;
  /** Full public URL (also included in Google Person Schema sameAs). */
  url: string;
}

export interface SiteProfileConfig {
  fullName: string;
  alternateName: string;
  slug: string;
  /** Replace '/avatar-placeholder.png' with your real headshot (.png/.jpg) in /public (e.g. '/wayne.jpg'). */
  avatarImage: string;
  shortBio: string;
  contactEmail: string;
  /** Optional fields used in Google Schema.org Person structured data when filled in. */
  jobTitle?: string;
  affiliation?: string;
}

export const PROFILE_CONFIG: SiteProfileConfig = {
  fullName: 'Samwel Wayne',
  alternateName: 'itiswayneee',
  slug: 'itiswayneee',
  avatarImage: '/avatar-placeholder.png',
  shortBio:
    'Official personal site for Samwel Wayne (@itiswayneee). Connect across Instagram, X, TikTok, YouTube, GitHub, and LinkedIn.',
  contactEmail: 'hello@itiswayneee.dpdns.org',
};

/**
 * Add, reorder, or remove your social accounts below.
 * Supported platform icons:
 * 'instagram' | 'x' | 'tiktok' | 'youtube' | 'github' | 'linkedin' |
 * 'threads' | 'facebook' | 'snapchat' | 'spotify' | 'discord' | 'twitch' |
 * 'medium' | 'substack' | 'google-scholar' | 'orcid' | 'website'
 */
export const SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    platform: 'instagram',
    label: 'Instagram',
    handle: '@itiswayneee',
    url: 'https://www.instagram.com/itiswayneee',
  },
  {
    platform: 'x',
    label: 'X',
    handle: '@itiswayneee',
    url: 'https://x.com/itiswayneee',
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    handle: '@itiswayneee',
    url: 'https://www.tiktok.com/@itiswayneee',
  },
  {
    platform: 'youtube',
    label: 'YouTube',
    handle: '@itiswayneee',
    url: 'https://www.youtube.com/@itiswayneee',
  },
  {
    platform: 'github',
    label: 'GitHub',
    handle: '@itiswayneee',
    url: 'https://github.com/itiswayneee',
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    handle: '@itiswayneee',
    url: 'https://www.linkedin.com/in/itiswayneee',
  },
];
