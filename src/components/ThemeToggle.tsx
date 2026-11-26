import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: (next: 'dark' | 'light') => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Appearance mode"
      className="relative inline-flex items-center p-1 rounded-full bg-black/[0.06] dark:bg-white/[0.08] border border-black/[0.05] dark:border-white/[0.08] shrink-0"
    >
      {(['dark', 'light'] as const).map((mode) => {
        const active = theme === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onToggle(mode)}
            aria-pressed={active}
            aria-label={mode === 'dark' ? 'Switch to dark mode' : 'Switch to light mode'}
            className={`relative z-10 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
              active
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {active && (
              <motion.span
                layoutId="ios-theme-pill"
                transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-full bg-white dark:bg-[#2c2c34] shadow-sm"
              />
            )}
            {mode === 'dark' ? (
              <Moon className="h-3.5 w-3.5" />
            ) : (
              <Sun className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline capitalize">{mode}</span>
          </button>
        );
      })}
    </div>
  );
}
