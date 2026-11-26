import React, { useMemo, useState } from 'react';
import { ArrowUpRight, GitFork, Search, Star } from 'lucide-react';
import { motion } from 'motion/react';
import {
  filterRepositories,
  formatShortUtcDate,
  GitHubRepoItem,
  RepoFilterKind,
} from '../lib/github';
import { SocialBrandIcon } from './SocialBrandIcon';

interface GitHubProjectsListProps {
  repos: GitHubRepoItem[];
  loading: boolean;
  error: string | null;
}

const FILTER_OPTIONS: Array<{ value: RepoFilterKind; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'sources', label: 'Original' },
  { value: 'forks', label: 'Forks' },
];

export function GitHubProjectsList({
  repos,
  loading,
  error,
}: GitHubProjectsListProps) {
  const [query, setQuery] = useState('');
  const [filterKind, setFilterKind] = useState<RepoFilterKind>('all');

  const filtered = useMemo(
    () => filterRepositories(repos, query, filterKind),
    [repos, query, filterKind]
  );

  if (loading && repos.length === 0) {
    return (
      <section aria-labelledby="gh-projects-heading" className="space-y-4">
        <div className="h-7 w-48 rounded-lg bg-black/[0.06] dark:bg-white/[0.08] animate-pulse" />
        <div className="ios-depth-card rounded-[24px] p-6 space-y-4 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-black/[0.04] dark:bg-white/[0.05]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error && repos.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="gh-projects-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            id="gh-projects-heading"
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f5f5f7]"
          >
            GitHub Projects
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Showing <span className="tabular-nums font-medium">{filtered.length}</span> of{' '}
            <span className="tabular-nums font-medium">{repos.length}</span> public repositories
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search repositories..."
              aria-label="Search GitHub projects"
              className="w-full min-h-[42px] pl-9 pr-3 py-2 text-sm rounded-xl bg-black/[0.04] dark:bg-white/[0.07] border border-black/[0.06] dark:border-white/[0.08] text-slate-900 dark:text-[#f5f5f7] placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#007AFF] dark:focus:ring-[#0A84FF]"
            />
          </div>

          <div
            role="group"
            aria-label="Filter repositories by origin"
            className="inline-flex items-center p-1 rounded-xl bg-black/[0.05] dark:bg-white/[0.07] border border-black/[0.05] dark:border-white/[0.08] self-start sm:self-auto shrink-0"
          >
            {FILTER_OPTIONS.map((opt) => {
              const active = filterKind === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFilterKind(opt.value)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 min-h-[34px] text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white dark:bg-[#2c2c34] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ios-depth-card rounded-[24px] p-8 text-center space-y-3">
          <p className="font-display text-base font-semibold text-slate-900 dark:text-[#f5f5f7]">
            No matching repositories
          </p>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Try clearing your search query or switching the repository filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setFilterKind('all');
            }}
            className="inline-flex items-center justify-center px-4 py-2 min-h-[40px] text-xs font-medium rounded-xl bg-black/[0.06] dark:bg-white/[0.09] text-slate-900 dark:text-white hover:bg-black/[0.1] dark:hover:bg-white/[0.14] transition-colors whitespace-nowrap"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="ios-depth-card rounded-[24px] overflow-hidden">
          <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
            {filtered.map((repo, idx) => (
              <motion.li
                key={repo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 32,
                  delay: idx * 0.03,
                }}
                className="px-5 sm:px-6 py-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-display text-base font-semibold text-slate-900 dark:text-[#f5f5f7] hover:text-[#007AFF] dark:hover:text-[#0A84FF] transition-colors"
                      >
                        <SocialBrandIcon platform="github" className="h-4 w-4 shrink-0" />
                        <span>{repo.name}</span>
                      </a>
                      <span className="text-xs text-slate-500 dark:text-zinc-400">
                        · {repo.fork ? 'Forked repository' : 'Original repository'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                      {repo.description ?? 'Public GitHub repository by @itiswayneee.'}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-500 dark:text-zinc-400 tabular-nums">
                      {repo.language && <span>{repo.language}</span>}
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" aria-hidden="true" />
                        {repo.stargazersCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
                        {repo.forksCount}
                      </span>
                      <span>Updated {formatShortUtcDate(repo.pushedAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {repo.homepage && (
                      <motion.a
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-medium rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-slate-900 dark:text-white hover:bg-black/[0.09] dark:hover:bg-white/[0.12] transition-colors whitespace-nowrap"
                      >
                        <span>Live Site</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </motion.a>
                    )}

                    <motion.a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileTap={{ scale: 0.97 }}
                      aria-label={`Open ${repo.name} repository on GitHub`}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-medium rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-slate-900 dark:text-white hover:bg-black/[0.09] dark:hover:bg-white/[0.12] transition-colors whitespace-nowrap"
                    >
                      <span>View Repo</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </motion.a>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
