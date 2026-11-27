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
  platform: SocialPlatform;
  label: string;
  handle: string;
  url: string;
}

export interface SiteProfileConfig {
  fullName: string;
  alternateName: string;
  slug: string;
  avatarImage: string;
  shortBio: string;
  contactEmail: string;
  jobTitle?: string;
  affiliation?: string;
}

export const PROFILE_CONFIG: SiteProfileConfig = {
  fullName: 'Samwel Wayne',
  alternateName: 'itiswayneee',
  slug: 'itiswayneee',
  avatarImage: '/samwel-wayne.jpg',
  shortBio:
    'Official personal site for Samwel Wayne (@itiswayneee). Connect across Instagram, TikTok, YouTube, and GitHub.',
  contactEmail: 'hello@itiswayneee.dpdns.org',
};

export const SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    platform: 'instagram',
    label: 'Instagram',
    handle: '@itiswayneee',
    url: 'https://www.instagram.com/itiswayneee/',
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
];
