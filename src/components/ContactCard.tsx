import React, { useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactCardProps {
  email: string;
  handle: string;
}

export function ContactCard({ email, handle }: ContactCardProps) {
  const [copiedKey, setCopiedKey] = useState<'email' | 'handle' | null>(null);

  const handleCopy = async (key: 'email' | 'handle', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-heading" className="space-y-4">
      <div>
        <h2
          id="contact-heading"
          className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f5f5f7]"
        >
          Direct Contact
        </h2>
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          Reach Samwel Wayne directly
        </p>
      </div>

      <div className="ios-depth-card rounded-[24px] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Email Address
            </p>
            <p className="font-mono text-sm sm:text-base font-medium text-slate-900 dark:text-[#f5f5f7] truncate">
              {email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCopy('email', email)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-medium rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-slate-900 dark:text-white hover:bg-black/[0.09] dark:hover:bg-white/[0.12] transition-colors whitespace-nowrap"
            >
              {copiedKey === 'email' ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Email</span>
                </>
              )}
            </motion.button>

            <motion.a
              href={`mailto:${email}`}
              whileTap={{ scale: 0.97 }}
              className="ios-depth-button inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-medium rounded-xl bg-[#007AFF] dark:bg-[#0A84FF] text-white hover:opacity-95 transition-opacity whitespace-nowrap"
            >
              <Mail className="h-4 w-4" />
              <span>Send Email</span>
            </motion.a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Official Handle
            </p>
            <p className="font-mono text-sm sm:text-base font-medium text-slate-900 dark:text-[#f5f5f7]">
              {handle}
            </p>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => handleCopy('handle', handle)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-medium rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-slate-900 dark:text-white hover:bg-black/[0.09] dark:hover:bg-white/[0.12] transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            {copiedKey === 'handle' ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Handle</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </section>
  );
}
