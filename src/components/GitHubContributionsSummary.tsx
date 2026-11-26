import React from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { GitHubDashboardPayload } from '../lib/github';
import { SocialBrandIcon } from './SocialBrandIcon';

interface GitHubContributionsSummaryProps {
  username: string;
  data: GitHubDashboardPayload | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
}

const LEVEL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-black/[0.06] dark:bg-white/[0.07]',
  1: 'bg-emerald-500/30 dark:bg-emerald-400/25',
  2: 'bg-emerald-500/55 dark:bg-emerald-400/45',
  3: 'bg-emerald-500/80 dark:bg-emerald-400/70',
  4: 'bg-emerald-600 dark:bg-emerald-400',
};

export function GitHubContributionsSummary({
  username,
  data,
  loading,
  refreshing,
  error,
  onRefresh,
}: GitHubContributionsSummaryProps) {
  if (loading && !data) {
    return (
      <section aria-labelledby="gh-contrib-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1
              id="gh-contrib-heading"
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#f5f5f7]"
            >
              Projects &amp; GitHub Activity
            </h1>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Loading public activity for @{username}
            </p>
          </div>
        </div>
        <div className="ios-depth-card rounded-[24px] p-6 space-y-5 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-black/[0.05] dark:bg-white/[0.06]"
              />
            ))}
          </div>
          <div className="h-28 rounded-xl bg-black/[0.04] dark:bg-white/[0.05]" />
        </div>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section aria-labelledby="gh-contrib-heading" className="space-y-4">
        <div>
          <h1
            id="gh-contrib-heading"
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#f5f5f7]"
          >
            Projects &amp; GitHub Activity
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            @{username} on GitHub
          </p>
        </div>

        <div className="ios-depth-card rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-display text-base font-semibold text-slate-900 dark:text-[#f5f5f7]">
              Unable to load live GitHub activity
            </p>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="ios-depth-button inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-xs font-medium rounded-xl bg-[#007AFF] dark:bg-[#0A84FF] text-white hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const { summary, user } = data;
  const metrics = [
    { label: 'Public Repos', value: user.publicRepos },
    { label: 'Recent Commits', value: summary.recentCommitsCount },
    { label: 'Push Events', value: summary.pushEventsCount },
    { label: 'Active Days', value: summary.activeDaysCount },
  ];

  return (
    <section aria-labelledby="gh-contrib-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1
            id="gh-contrib-heading"
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#f5f5f7] text-balance"
          >
            GitHub Contributions
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            @{user.login} · Public commit and push activity over the last {summary.weeks.length} weeks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh GitHub activity"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-medium rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-slate-900 dark:text-white hover:bg-black/[0.09] dark:hover:bg-white/[0.12] transition-colors whitespace-nowrap disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing' : 'Refresh'}</span>
          </motion.button>

          <motion.a
            href={user.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.97 }}
            className="ios-depth-button inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-medium rounded-xl bg-[#007AFF] dark:bg-[#0A84FF] text-white hover:opacity-95 transition-opacity whitespace-nowrap"
          >
            <SocialBrandIcon platform="github" className="h-3.5 w-3.5" />
            <span>GitHub Profile</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </motion.a>
        </div>
      </div>

      <div className="ios-depth-card rounded-[24px] overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-black/[0.06] dark:border-white/[0.07]">
          {metrics.map((item, idx) => (
            <div
              key={item.label}
              className={`px-5 py-4 space-y-1 border-black/[0.06] dark:border-white/[0.07] ${
                idx % 2 === 1 ? 'border-l sm:border-l' : idx > 0 ? 'sm:border-l' : ''
              } ${idx >= 2 ? 'border-t sm:border-t-0' : ''}`}
            >
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {item.label}
              </p>
              <p className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f5f5f7] tabular-nums">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="p-5 sm:p-6 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span>
              <span className="font-mono font-medium text-slate-900 dark:text-zinc-200 tabular-nums">
                {summary.totalActivity}
              </span>{' '}
              public contributions logged in the {summary.weeks.length}-week window
            </span>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span>Less</span>
              {([0, 1, 2, 3, 4] as const).map((level) => (
                <span
                  key={level}
                  className={`h-2.5 w-2.5 rounded-[2px] ${LEVEL_CLASSES[level]}`}
                />
              ))}
              <span>More</span>
            </div>
          </div>

          <div
            className="flex items-center gap-2.5 overflow-x-auto py-1"
            role="img"
            aria-label={`${summary.weeks.length}-week GitHub contribution grid showing ${summary.totalActivity} events across ${summary.activeDaysCount} active days`}
          >
            <div
              aria-hidden="true"
              className="hidden sm:grid grid-rows-7 gap-1.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500 select-none pr-1 shrink-0"
            >
              <span className="h-3.5" />
              <span className="h-3.5 flex items-center">Mon</span>
              <span className="h-3.5" />
              <span className="h-3.5 flex items-center">Wed</span>
              <span className="h-3.5" />
              <span className="h-3.5 flex items-center">Fri</span>
              <span className="h-3.5" />
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {summary.weeks.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-rows-7 gap-1 sm:gap-1.5">
                  {week.map((day) => (
                    <span
                      key={day.date}
                      title={`${day.date}: ${day.count} contribution${day.count === 1 ? '' : 's'}`}
                      aria-label={`${day.date}: ${day.count} contributions`}
                      className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-[3px] ${LEVEL_CLASSES[day.level]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
