import React, { useCallback, useEffect, useState } from 'react';
import { ArrowDownRight, FolderGit2, Mail } from 'lucide-react';
import { motion, MotionConfig } from 'motion/react';
import { generateSchemaGraphJsonLd, getSiteData } from './lib/seoEngine';
import { applyProfileMetaTagsToDocument, applyStructuredDataToDocument } from './lib/seo';
import { extractGitHubUsername, GitHubDashboardPayload } from './lib/github';
import { ThemeToggle } from './components/ThemeToggle';
import { IosSocialList } from './components/IosSocialList';
import { ContactCard } from './components/ContactCard';
import { GitHubContributionsSummary } from './components/GitHubContributionsSummary';
import { GitHubProjectsList } from './components/GitHubProjectsList';

const THEME_KEY = 'itiswayneee_theme_v1';
const SITE_DATA = getSiteData();

type ActiveTab = 'profile' | 'projects';

function readInitialTab(): ActiveTab {
  if (typeof window === 'undefined') return 'profile';
  const params = new URLSearchParams(window.location.search);
  if (params.get('tab') === 'projects' || window.location.hash === '#projects') {
    return 'projects';
  }
  return 'profile';
}

export default function App() {
  const { profile, socials } = SITE_DATA;
  const displayHandle = `@${profile.alternateName.replace(/^@/, '')}`;
  const githubUsername = extractGitHubUsername(socials, profile.alternateName);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(readInitialTab);

  const [githubData, setGithubData] = useState<GitHubDashboardPayload | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubRefreshing, setGithubRefreshing] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    applyProfileMetaTagsToDocument(profile, { socials });
    applyStructuredDataToDocument(generateSchemaGraphJsonLd(SITE_DATA, window.location.origin));
  }, [profile, socials]);

  const loadGitHubDashboard = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setGithubRefreshing(true);
    } else {
      setGithubLoading(true);
    }
    setGithubError(null);

    try {
      const res = await fetch(`/api/github${forceRefresh ? '?refresh=1' : ''}`);
      const text = await res.text();
      let json: { data?: GitHubDashboardPayload; error?: string } | null = null;
      try {
        json = JSON.parse(text) as {
          data?: GitHubDashboardPayload;
          error?: string;
        };
      } catch {
        throw new Error(`GitHub service unavailable (${res.status})`);
      }
      if (!res.ok || !json?.data) {
        throw new Error(json?.error || `Request failed (${res.status})`);
      }
      setGithubData(json.data);
    } catch (err) {
      setGithubError(
        err instanceof Error ? err.message : 'Unable to reach GitHub API'
      );
    } finally {
      setGithubLoading(false);
      setGithubRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'projects' && !githubData && !githubLoading && !githubError) {
      void loadGitHubDashboard(false);
    }
  }, [activeTab, githubData, githubLoading, githubError, loadGitHubDashboard]);

  const selectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const nextUrl = tab === 'projects' ? '#projects' : '#profile';
      window.history.replaceState(null, '', nextUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 backdrop-blur-2xl bg-[#f2f2f7]/80 dark:bg-[#050507]/80 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3 sm:gap-8">
            <button
              type="button"
              onClick={() => selectTab('profile')}
              className="font-display text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-[#f5f5f7] whitespace-nowrap shrink-0"
            >
              {displayHandle}
            </button>

            <nav
              aria-label="Site tabs"
              role="tablist"
              className="inline-flex items-center p-1 rounded-full bg-black/[0.05] dark:bg-white/[0.07] border border-black/[0.05] dark:border-white/[0.08]"
            >
              {(['profile', 'projects'] as const).map((tab) => {
                const isSelected = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => selectTab(tab)}
                    className={`relative z-10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
                      isSelected
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="ios-nav-tab"
                        transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                        className="absolute inset-0 -z-10 rounded-full bg-white dark:bg-[#2c2c34] shadow-sm"
                      />
                    )}
                    {tab === 'profile' ? 'Profile' : 'Projects'}
                  </button>
                );
              })}
            </nav>

            <ThemeToggle theme={theme} onToggle={setTheme} />
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-10 sm:space-y-12">
          {activeTab === 'profile' ? (
            <>
              <motion.section
                id="profile"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                className="ios-depth-card rounded-[28px] p-6 sm:p-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    className="h-24 w-24 sm:h-28 sm:w-28 rounded-[26px] shrink-0 overflow-hidden bg-gradient-to-b from-slate-200 to-slate-300 dark:from-[#2c2c35] dark:to-[#121216] border border-black/10 dark:border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_28px_-8px_rgba(0,0,0,0.45)] flex items-center justify-center"
                  >
                    {!imgError ? (
                      <img
                        src={profile.avatarImage}
                        alt={profile.fullName}
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-display text-sm font-medium text-slate-500 dark:text-zinc-400">
                        Photo
                      </span>
                    )}
                  </motion.div>

                  <div className="space-y-2 min-w-0">
                    <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                      {displayHandle} · <span className="tabular-nums">{socials.length}</span> social accounts
                    </p>
                    <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#f5f5f7] text-balance">
                      {profile.fullName}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                      {profile.shortBio}
                    </p>
                  </div>
                </div>

                <div className="mt-7 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center gap-3">
                  <motion.a
                    href={`mailto:${profile.contactEmail}`}
                    whileTap={{ scale: 0.97 }}
                    className="ios-depth-button inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-medium rounded-xl bg-[#007AFF] dark:bg-[#0A84FF] text-white hover:opacity-95 transition-opacity whitespace-nowrap"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email Wayne</span>
                  </motion.a>

                  <motion.a
                    href="#socials"
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] text-sm font-medium rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-slate-900 dark:text-white hover:bg-black/[0.09] dark:hover:bg-white/[0.12] transition-colors whitespace-nowrap"
                  >
                    <span>Social Accounts</span>
                    <ArrowDownRight className="h-4 w-4" />
                  </motion.a>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => selectTab('projects')}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] text-sm font-medium rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-slate-900 dark:text-white hover:bg-black/[0.09] dark:hover:bg-white/[0.12] transition-colors whitespace-nowrap"
                  >
                    <FolderGit2 className="h-4 w-4" />
                    <span>View Projects</span>
                  </motion.button>
                </div>
              </motion.section>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 32, delay: 0.06 }}
              >
                <IosSocialList socials={socials} handle={displayHandle} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 32, delay: 0.12 }}
              >
                <ContactCard
                  email={profile.contactEmail}
                  handle={displayHandle}
                />
              </motion.div>
            </>
          ) : (
            <motion.div
              key="projects-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="space-y-10 sm:space-y-12"
            >
              <GitHubContributionsSummary
                username={githubUsername}
                data={githubData}
                loading={githubLoading}
                refreshing={githubRefreshing}
                error={githubError}
                onRefresh={() => void loadGitHubDashboard(true)}
              />

              <GitHubProjectsList
                repos={githubData?.repos ?? []}
                loading={githubLoading}
                error={githubError}
              />
            </motion.div>
          )}
        </main>

        <footer className="border-t border-black/[0.06] dark:border-white/[0.08]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-500">
            <p>
              {profile.fullName} · {displayHandle}
            </p>
            <div className="flex items-center gap-5">
              <a
                href="/sitemap.xml"
                className="hover:text-slate-900 dark:hover:text-zinc-300 transition-colors"
              >
                Sitemap
              </a>
              <a
                href="/robots.txt"
                className="hover:text-slate-900 dark:hover:text-zinc-300 transition-colors"
              >
                Robots
              </a>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
