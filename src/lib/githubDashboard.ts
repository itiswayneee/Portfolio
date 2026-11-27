import {
  buildContributionSummary,
  extractGitHubUsername,
  extractRecentCommits,
  GitHubDashboardPayload,
  normalizeGitHubRepos,
  RawGitHubEvent,
  RawGitHubRepoCommit,
} from './github.js';
import { getSiteData } from './seoEngine.js';

const CACHE_TTL_MS = 5 * 60 * 1000;
const REFRESH_COOLDOWN_MS = 15 * 1000;

let cached: { payload: GitHubDashboardPayload; fetchedMs: number } | null = null;

async function fetchGitHubJson<T>(url: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'itiswayneee-personal-site',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${url}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`GitHub API returned a non-JSON response for ${url}`);
  }
}

export async function getGitHubDashboard(
  options: { forceRefresh?: boolean; token?: string } = {}
): Promise<GitHubDashboardPayload> {
  const now = Date.now();
  if (
    cached &&
    ((!options.forceRefresh && now - cached.fetchedMs < CACHE_TTL_MS) ||
      (options.forceRefresh && now - cached.fetchedMs < REFRESH_COOLDOWN_MS))
  ) {
    return cached.payload;
  }

  const { profile, socials } = getSiteData();
  const username = extractGitHubUsername(socials, profile.alternateName);
  const fetchJson = <T>(url: string): Promise<T> =>
    fetchGitHubJson<T>(url, options.token);

  try {
    const [rawUser, rawRepos, rawEvents] = await Promise.all([
      fetchJson<Record<string, unknown>>(
        `https://api.github.com/users/${encodeURIComponent(username)}`
      ),
      fetchJson<Array<Record<string, unknown>>>(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=30`
      ),
      fetchJson<RawGitHubEvent[]>(
        `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=60`
      ),
    ]);

    const repos = normalizeGitHubRepos(rawRepos);

    const candidateRepoNames = new Set<string>();
    for (const ev of rawEvents) {
      if (ev.type === 'PushEvent' && ev.repo?.name) {
        candidateRepoNames.add(ev.repo.name);
      }
      if (candidateRepoNames.size >= 3) break;
    }
    for (const repo of repos) {
      if (repo.fullName) candidateRepoNames.add(repo.fullName);
      if (candidateRepoNames.size >= 6) break;
    }

    const targetRepos = Array.from(candidateRepoNames).slice(0, 6);
    const commitResults = await Promise.allSettled(
      targetRepos.map(async (fullName) => {
        const commits = await fetchJson<RawGitHubRepoCommit[]>(
          `https://api.github.com/repos/${fullName}/commits?per_page=15`
        );
        return { fullName, commits };
      })
    );

    const repoCommitsByRepo: Record<string, RawGitHubRepoCommit[]> = {};
    for (const result of commitResults) {
      if (result.status === 'fulfilled') {
        repoCommitsByRepo[result.value.fullName] = result.value.commits;
      }
    }

    const commits = extractRecentCommits(rawEvents, repoCommitsByRepo, 40);
    const summary = buildContributionSummary(rawEvents, commits, new Date(), 36);

    const payload: GitHubDashboardPayload = {
      username,
      user: {
        login: String(rawUser.login ?? username),
        name: typeof rawUser.name === 'string' ? rawUser.name : null,
        avatarUrl: String(rawUser.avatar_url ?? ''),
        htmlUrl: String(rawUser.html_url ?? `https://github.com/${username}`),
        bio: typeof rawUser.bio === 'string' ? rawUser.bio : null,
        publicRepos: Number(rawUser.public_repos ?? repos.length),
        followers: Number(rawUser.followers ?? 0),
        following: Number(rawUser.following ?? 0),
      },
      repos,
      commits,
      summary,
      fetchedAt: new Date().toISOString(),
    };

    cached = { payload, fetchedMs: now };
    return payload;
  } catch (error) {
    if (cached) {
      return cached.payload;
    }
    throw error;
  }
}
