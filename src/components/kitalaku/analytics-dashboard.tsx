'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { GlassPanel, cn } from './primitives';
import { IconAnalytics, IconCalendar, IconCheck, IconCopy } from './icons';

export function AnalyticsDashboard() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const agencyDrafts =
    useQuery(
      api.drafts.getDraftsByAgency,
      currentUser?.agencyId ? { agencyId: currentUser.agencyId } : 'skip',
    ) || [];

  const updateDraftStatus = useMutation(api.drafts.updateDraftStatus);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Persistence logic for filters
  useEffect(() => {
    const savedStart = localStorage.getItem('analytics_start_date');
    const savedEnd = localStorage.getItem('analytics_end_date');
    if (savedStart) setStartDate(savedStart);
    if (savedEnd) setEndDate(savedEnd);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('analytics_start_date', startDate);
      localStorage.setItem('analytics_end_date', endDate);
    }
  }, [startDate, endDate, isLoaded]);

  const reviewDrafts = agencyDrafts.filter((d) => d.status === 'Review');
  const approvedDrafts = agencyDrafts.filter((d) => d.status === 'Approved');

  const handleApprove = async (draftId: Id<'contentDrafts'>) => {
    try {
      await updateDraftStatus({ draftId, status: 'Approved' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevise = async (draftId: Id<'contentDrafts'>) => {
    const notes = prompt('Enter revision feedback for the creator:');
    if (notes) {
      try {
        await updateDraftStatus({ draftId, status: 'Draft', revisionNotes: notes });
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const hasRangeData = startDate && endDate && new Date(startDate) < new Date(endDate);

  const mockMetrics = [
    { label: 'Total Engagement', value: '124.5k', delta: '+12.3%', tone: 'positive' },
    { label: 'Avg. Click-Through', value: '4.82%', delta: '+0.5%', tone: 'positive' },
    { label: 'Conversion Rate', value: '2.1%', delta: '-0.2%', tone: 'negative' },
    { label: 'Approval Latency', value: '4.2h', delta: '-1.1h', tone: 'positive' },
  ];

  const platformData = [
    { label: 'Instagram', value: 85 },
    { label: 'LinkedIn', value: 62 },
    { label: 'Twitter/X', value: 45 },
    { label: 'TikTok', value: 38 },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-[var(--slate-900)]">Approval & Analytics</h2>
        <p className="text-sm text-[var(--slate-500)] mt-1">
          Review pending content and track workspace performance.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Approval Queue */}
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--slate-900)]">Awaiting Approval</h3>
              <span className="bg-purple-100 text-[var(--purple-strong)] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                {reviewDrafts.length} Pending
              </span>
            </div>

            {reviewDrafts.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[var(--slate-100)] rounded-2xl">
                <p className="text-sm text-[var(--slate-400)] italic">
                  All caught up! No drafts currently in review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewDrafts.map((draft) => (
                  <div
                    key={draft._id}
                    className="rounded-2xl border border-[var(--slate-200)] bg-white/60 p-5 shadow-sm transition-all hover:border-[var(--purple-border)]"
                  >
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed text-[var(--slate-800)] line-clamp-3">
                          {draft.content.replace(/<[^>]*>?/gm, '') || 'Empty content'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="bg-[var(--slate-100)] text-[var(--slate-600)] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {draft.platform || 'General'}
                          </span>
                          <span className="text-[10px] text-[var(--slate-400)] font-medium">
                            Created {new Date(draft._creationTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleApprove(draft._id)}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all"
                        >
                          <IconCheck /> Approve
                        </button>
                        <button
                          onClick={() => handleRevise(draft._id)}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-all"
                        >
                          Revise
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* Performance Snapshot */}
          <div className="grid gap-4 md:grid-cols-2">
            {mockMetrics.map((m) => (
              <GlassPanel key={m.label} className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--slate-400)]">
                  {m.label}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-[var(--slate-900)]">{m.value}</p>
                  <p
                    className={cn(
                      'text-[11px] font-bold',
                      m.tone === 'positive' ? 'text-emerald-600' : 'text-red-500',
                    )}
                  >
                    {m.delta}
                  </p>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          <GlassPanel className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--slate-700)] mb-6">
              Platform Mix
            </h3>
            <div className="space-y-6">
              {platformData.map((p) => (
                <div key={p.label}>
                  <div className="mb-2 flex justify-between text-xs font-bold">
                    <span className="text-[var(--slate-600)]">{p.label}</span>
                    <span className="text-[var(--slate-900)]">{p.value}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--slate-100)] overflow-hidden">
                    <div
                      className="h-full bg-[linear-gradient(90deg,#8b5cf6,#7c3aed)] rounded-full transition-all duration-1000"
                      style={{ width: `${p.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--slate-700)] mb-4">
              Export Reports
            </h3>
            <p className="text-xs text-[var(--slate-500)] leading-relaxed mb-6">
              Download your campaign performance and approval logs for internal reporting.
            </p>
            <div className="space-y-2">
              <button className="w-full rounded-xl border border-[var(--slate-200)] bg-white py-2.5 text-xs font-bold text-[var(--slate-700)] hover:bg-[var(--slate-50)] transition-all">
                Download CSV
              </button>
              <button className="w-full rounded-xl border border-[var(--slate-200)] bg-white py-2.5 text-xs font-bold text-[var(--slate-700)] hover:bg-[var(--slate-50)] transition-all">
                Download PDF
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
