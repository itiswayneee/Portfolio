import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildContributionSummary,
  extractGitHubUsername,
  extractRecentCommits,
  filterRepositories,
  GitHubRepoItem,
  normalizeGitHubRepos,
  RawGitHubEvent,
} from './github';

test('extractGitHubUsername extracts login from github social entry', () => {
  const username = extractGitHubUsername([
    {
      platform: 'github',
      label: 'GitHub',
      handle: '@itiswayneee',
      url: 'https://github.com/itiswayneee',
    },
  ]);
  assert.equal(username, 'itiswayneee');
});

test('normalizeGitHubRepos sorts repositories by pushedAt descending and trims descriptions', () => {
  const repos = normalizeGitHubRepos([
    {
      id: 1,
      name: 'older-repo',
      full_name: 'itiswayneee/older-repo',
      description: '  Old description  ',
      html_url: 'https://github.com/itiswayneee/older-repo',
      language: 'HTML',
      stargazers_count: 1,
      forks_count: 0,
      fork: false,
      pushed_at: '2026-04-15T03:22:53Z',
    },
    {
      id: 2,
      name: 'newer-repo',
      full_name: 'itiswayneee/newer-repo',
      description: null,
      html_url: 'https://github.com/itiswayneee/newer-repo',
      language: 'TypeScript',
      stargazers_count: 4,
      forks_count: 1,
      fork: true,
      pushed_at: '2026-11-21T09:26:35Z',
    },
  ]);

  assert.equal(repos.length, 2);
  assert.equal(repos[0].name, 'newer-repo');
  assert.equal(repos[0].fork, true);
  assert.equal(repos[1].description, 'Old description');
});

test('extractRecentCommits merges repo commits and PushEvent fallbacks without duplicate SHAs', () => {
  const events: RawGitHubEvent[] = [
    {
      id: '101',
      type: 'PushEvent',
      created_at: '2026-11-21T09:26:23Z',
      repo: { name: 'itiswayneee/itiswayneee' },
      payload: { head: 'f99a34e147b9e53847a2ff3ea5f8dafbe365df82', ref: 'refs/heads/main' },
    },
    {
      id: '102',
      type: 'PushEvent',
      created_at: '2026-11-13T01:38:53Z',
      repo: { name: 'Wayne-Inc/StreamFlix' },
      payload: { head: 'abc1234567890', ref: 'refs/heads/main' },
    },
  ];

  const commits = extractRecentCommits(events, {
    'itiswayneee/itiswayneee': [
      {
        sha: 'f99a34e147b9e53847a2ff3ea5f8dafbe365df82',
        html_url: 'https://github.com/itiswayneee/itiswayneee/commit/f99a34e147b9e53847a2ff3ea5f8dafbe365df82',
        commit: {
          message: 'Update README.md\n\nExtra details',
          author: { date: '2026-11-21T09:26:22Z' },
        },
        author: { login: 'itiswayneee' },
      },
    ],
  });

  assert.equal(commits.length, 2);
  assert.equal(commits[0].shortSha, 'f99a34e');
  assert.equal(commits[0].message, 'Update README.md');
  assert.equal(commits[1].repoFullName, 'Wayne-Inc/StreamFlix');
  assert.equal(commits[1].message, 'Pushed changes to main');
});

test('buildContributionSummary aggregates 12-week grid and active day metrics', () => {
  const events: RawGitHubEvent[] = [
    {
      id: '1',
      type: 'PushEvent',
      created_at: '2026-11-21T09:26:23Z',
      repo: { name: 'itiswayneee/itiswayneee' },
    },
    {
      id: '2',
      type: 'PushEvent',
      created_at: '2026-11-21T12:00:00Z',
      repo: { name: 'itiswayneee/itiswayneee' },
    },
    {
      id: '3',
      type: 'WatchEvent',
      created_at: '2026-11-20T06:46:51Z',
      repo: { name: 'itiswayneee/tournament-maker' },
    },
  ];

  const summary = buildContributionSummary(
    events,
    [
      {
        sha: 'f99a34e',
        shortSha: 'f99a34e',
        message: 'Update README.md',
        repoFullName: 'itiswayneee/itiswayneee',
        date: '2026-11-21T09:26:22Z',
        url: 'https://github.com/itiswayneee/itiswayneee/commit/f99a34e',
        authorLogin: 'itiswayneee',
      },
    ],
    new Date('2026-11-26T00:00:00Z'),
    12
  );

  assert.equal(summary.weeks.length, 12);
  assert.equal(summary.weeks[0].length, 7);
  assert.equal(summary.pushEventsCount, 2);
  assert.equal(summary.recentCommitsCount, 1);
  assert.equal(summary.activeDaysCount, 2);
  assert.equal(summary.totalActivity, 3);
});

test('filterRepositories filters by query and source/fork type', () => {
  const repos: GitHubRepoItem[] = [
    {
      id: 1,
      name: 'tournament-maker',
      fullName: 'itiswayneee/tournament-maker',
      description: 'Create and simulate football tournaments',
      htmlUrl: 'https://github.com/itiswayneee/tournament-maker',
      homepage: null,
      language: null,
      stargazersCount: 1,
      forksCount: 0,
      fork: false,
      pushedAt: '2026-11-07T13:51:01Z',
      updatedAt: '2026-11-07T13:51:01Z',
      topics: [],
    },
    {
      id: 2,
      name: 'StreamFlix',
      fullName: 'itiswayneee/StreamFlix',
      description: 'Streaming platform built with TypeScript',
      htmlUrl: 'https://github.com/itiswayneee/StreamFlix',
      homepage: null,
      language: 'TypeScript',
      stargazersCount: 1,
      forksCount: 0,
      fork: true,
      pushedAt: '2026-11-15T03:20:47Z',
      updatedAt: '2026-11-15T03:20:47Z',
      topics: [],
    },
  ];

  assert.equal(filterRepositories(repos, '', 'sources').length, 1);
  assert.equal(filterRepositories(repos, '', 'forks').length, 1);
  assert.equal(filterRepositories(repos, 'typescript', 'all')[0].name, 'StreamFlix');
  assert.equal(filterRepositories(repos, 'nonexistent', 'all').length, 0);
});
