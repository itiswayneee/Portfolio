import { SocialAccount } from '../data/profile.js';

export interface GitHubUserSummary {
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
}

export interface GitHubRepoItem {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  fork: boolean;
  pushedAt: string;
  updatedAt: string;
  topics: string[];
}

export interface GitHubCommitActivity {
  sha: string;
  shortSha: string;
  message: string;
  repoFullName: string;
  date: string;
  url: string;
  authorLogin: string | null;
}

export interface ContributionDayCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubContributionSummary {
  totalActivity: number;
  recentCommitsCount: number;
  pushEventsCount: number;
  activeDaysCount: number;
  weeks: ContributionDayCell[][];
}

export interface GitHubDashboardPayload {
  username: string;
  user: GitHubUserSummary;
  repos: GitHubRepoItem[];
  commits: GitHubCommitActivity[];
  summary: GitHubContributionSummary;
  fetchedAt: string;
}

export interface RawGitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo?: { name?: string };
  payload?: {
    head?: string;
    ref?: string;
    commits?: Array<{
      sha?: string;
      message?: string;
    }>;
  };
}

export interface RawGitHubRepoCommit {
  sha: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: {
      date?: string;
    };
  };
  author?: {
    login?: string;
  } | null;
}

export type RepoFilterKind = 'all' | 'sources' | 'forks';

export function extractGitHubUsername(
  socials: SocialAccount[],
  fallback = 'itiswayneee'
): string {
  const gh = socials.find((s) => s.platform === 'github');
  if (!gh) {
    return fallback.replace(/^@+/, '');
  }
  try {
    const parsed = new URL(gh.url);
    const firstSegment = parsed.pathname.split('/').filter(Boolean)[0];
    if (firstSegment) {
      return firstSegment;
    }
  } catch {}
  return gh.handle.replace(/^@+/, '') || fallback.replace(/^@+/, '');
}

export function normalizeGitHubRepos(rawRepos: Array<Record<string, unknown>>): GitHubRepoItem[] {
  return rawRepos
    .map((repo) => ({
      id: Number(repo.id ?? 0),
      name: String(repo.name ?? ''),
      fullName: String(repo.full_name ?? ''),
      description: typeof repo.description === 'string' && repo.description.trim()
        ? repo.description.trim()
        : null,
      htmlUrl: String(repo.html_url ?? ''),
      homepage: typeof repo.homepage === 'string' && repo.homepage.trim()
        ? repo.homepage.trim()
        : null,
      language: typeof repo.language === 'string' && repo.language.trim()
        ? repo.language.trim()
        : null,
      stargazersCount: Number(repo.stargazers_count ?? 0),
      forksCount: Number(repo.forks_count ?? 0),
      fork: Boolean(repo.fork),
      pushedAt: String(repo.pushed_at ?? repo.updated_at ?? ''),
      updatedAt: String(repo.updated_at ?? repo.pushed_at ?? ''),
      topics: Array.isArray(repo.topics)
        ? repo.topics.filter((t): t is string => typeof t === 'string')
        : [],
    }))
    .filter((r) => r.name.length > 0 && r.htmlUrl.length > 0)
    .sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt));
}

export function extractRecentCommits(
  events: RawGitHubEvent[],
  repoCommitsByRepo: Record<string, RawGitHubRepoCommit[]>,
  limit = 8
): GitHubCommitActivity[] {
  const bySha = new Map<string, GitHubCommitActivity>();

  for (const [repoFullName, commits] of Object.entries(repoCommitsByRepo)) {
    for (const c of commits) {
      if (!c.sha) continue;
      const firstLine = (c.commit?.message ?? 'Commit').split('\n')[0].trim() || 'Commit';
      const date = c.commit?.author?.date ?? '';
      if (!date) continue;
      bySha.set(c.sha, {
        sha: c.sha,
        shortSha: c.sha.slice(0, 7),
        message: firstLine,
        repoFullName,
        date,
        url: c.html_url ?? `https://github.com/${repoFullName}/commit/${c.sha}`,
        authorLogin: c.author?.login ?? null,
      });
    }
  }

  for (const ev of events) {
    if (ev.type !== 'PushEvent') continue;
    const repoFullName = ev.repo?.name ?? '';
    if (!repoFullName) continue;

    if (Array.isArray(ev.payload?.commits) && ev.payload.commits.length > 0) {
      for (const c of ev.payload.commits) {
        if (!c.sha || bySha.has(c.sha)) continue;
        const firstLine = (c.message ?? 'Push commit').split('\n')[0].trim() || 'Push commit';
        bySha.set(c.sha, {
          sha: c.sha,
          shortSha: c.sha.slice(0, 7),
          message: firstLine,
          repoFullName,
          date: ev.created_at,
          url: `https://github.com/${repoFullName}/commit/${c.sha}`,
          authorLogin: null,
        });
      }
    } else if (ev.payload?.head && !bySha.has(ev.payload.head)) {
      const sha = ev.payload.head;
      const branch = ev.payload.ref?.replace('refs/heads/', '') || 'main';
      bySha.set(sha, {
        sha,
        shortSha: sha.slice(0, 7),
        message: `Pushed changes to ${branch}`,
        repoFullName,
        date: ev.created_at,
        url: `https://github.com/${repoFullName}/commit/${sha}`,
        authorLogin: null,
      });
    }
  }

  return Array.from(bySha.values())
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, limit);
}

function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function scoreLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (maxCount <= 1) return 2;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function buildContributionSummary(
  events: RawGitHubEvent[],
  commits: GitHubCommitActivity[],
  referenceDate = new Date(),
  weeksCount = 12
): GitHubContributionSummary {
  const dailyCounts = new Map<string, number>();
  const pushEvents = events.filter((e) => e.type === 'PushEvent');

  for (const ev of events) {
    if (!ev.created_at) continue;
    const key = ev.created_at.slice(0, 10);
    dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
  }

  for (const commit of commits) {
    if (!commit.date) continue;
    const key = commit.date.slice(0, 10);
    if (!dailyCounts.has(key)) {
      dailyCounts.set(key, 1);
    }
  }

  const totalDays = weeksCount * 7;
  const endUtc = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate()
    )
  );
  const endDayOfWeek = endUtc.getUTCDay();
  const daysToSaturday = 6 - endDayOfWeek;
  const gridEnd = new Date(endUtc.getTime() + daysToSaturday * 86400000);
  const gridStart = new Date(gridEnd.getTime() - (totalDays - 1) * 86400000);

  let maxCount = 0;
  let totalActivity = 0;
  let activeDaysCount = 0;

  const rawCells: Array<{ date: string; count: number }> = [];
  for (let i = 0; i < totalDays; i++) {
    const day = new Date(gridStart.getTime() + i * 86400000);
    const key = toUtcDateKey(day);
    const count = day.getTime() > endUtc.getTime() ? 0 : (dailyCounts.get(key) ?? 0);
    if (count > maxCount) maxCount = count;
    if (count > 0) {
      totalActivity += count;
      activeDaysCount += 1;
    }
    rawCells.push({ date: key, count });
  }

  const weeks: ContributionDayCell[][] = [];
  for (let w = 0; w < weeksCount; w++) {
    const weekSlice = rawCells.slice(w * 7, w * 7 + 7).map((cell) => ({
      date: cell.date,
      count: cell.count,
      level: scoreLevel(cell.count, maxCount),
    }));
    weeks.push(weekSlice);
  }

  return {
    totalActivity,
    recentCommitsCount: commits.length,
    pushEventsCount: pushEvents.length,
    activeDaysCount,
    weeks,
  };
}

export function filterRepositories(
  repos: GitHubRepoItem[],
  query: string,
  filterKind: RepoFilterKind
): GitHubRepoItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return repos.filter((repo) => {
    if (filterKind === 'sources' && repo.fork) return false;
    if (filterKind === 'forks' && !repo.fork) return false;

    if (!normalizedQuery) return true;

    const haystacks = [
      repo.name,
      repo.description ?? '',
      repo.language ?? '',
      ...repo.topics,
    ];
    return haystacks.some((item) => item.toLowerCase().includes(normalizedQuery));
  });
}

export function formatShortUtcDate(isoString: string): string {
  const parsed = Date.parse(isoString);
  if (Number.isNaN(parsed)) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(parsed));
}
