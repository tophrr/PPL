'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { GlassPanel } from '@/src/components/kitalaku/primitives';

export default function OnboardingPage() {
  const [agencyName, setAgencyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const createAgency = useMutation(api.agencies.createAgency);
  const currentUser = useQuery(api.users.getCurrentUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim()) return;

    setIsSubmitting(true);
    try {
      await createAgency({ name: agencyName });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentUser?.agencyId) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <GlassPanel className="w-full max-w-md p-8 shadow-[var(--shadow-premium)]">
        <h1 className="font-display text-3xl text-[var(--slate-900)]">Welcome to Kitalaku.in</h1>
        <p className="mt-2 text-sm text-[var(--slate-500)]">
          Let's set up your agency workspace to get started.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="agency-name" className="text-sm font-semibold text-[var(--slate-700)]">
              Agency Name
            </label>
            <input
              id="agency-name"
              type="text"
              required
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="e.g. Creative Flow Agency"
              className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !agencyName.trim()}
            className="w-full rounded-2xl bg-[var(--slate-900)] py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(30,41,59,0.12)] transition-all hover:-translate-y-[2px] disabled:opacity-50"
          >
            {isSubmitting ? 'Setting up...' : 'Create Agency'}
          </button>
        </form>
      </GlassPanel>
    </div>
  );
}
