import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { SocialAccount } from '../data/profile';
import { SocialBrandIcon } from './SocialBrandIcon';

interface IosSocialListProps {
  socials: SocialAccount[];
  handle: string;
}

export function IosSocialList({ socials, handle }: IosSocialListProps) {
  return (
    <section id="socials" aria-labelledby="socials-heading" className="space-y-4">
      <div>
        <h2
          id="socials-heading"
          className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f5f5f7]"
        >
          Social Accounts
        </h2>
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          Official profiles for @{handle.replace(/^@/, '')}
        </p>
      </div>

      <div className="ios-depth-card rounded-[24px] overflow-hidden">
        <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
          {socials.map((social, idx) => (
            <motion.li
              key={`${social.platform}-${social.url}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 32,
                delay: idx * 0.03,
              }}
            >
              <motion.a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer me"
                whileTap={{ scale: 0.985 }}
                className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 min-h-[64px] hover:bg-black/[0.025] dark:hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="h-11 w-11 rounded-[14px] flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.08] border border-black/[0.05] dark:border-white/[0.08] text-slate-900 dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] shrink-0">
                    <SocialBrandIcon platform={social.platform} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-[15px] font-semibold text-slate-900 dark:text-[#f5f5f7] truncate">
                      {social.label}
                    </p>
                    <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 truncate">
                      {social.handle}
                    </p>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-slate-400 dark:text-zinc-500 shrink-0" />
              </motion.a>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
