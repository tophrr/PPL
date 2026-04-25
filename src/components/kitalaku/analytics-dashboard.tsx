'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { GlassPanel, cn } from './primitives';
import { IconAnalytics, IconCalendar, IconCheck, IconCopy } from './icons';
import { MediaItem } from './media-item';

export function AnalyticsDashboard() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const agencyDrafts =
    useQuery(
      api.drafts.getDraftsByAgency,
      currentUser?.agencyId ? { agencyId: currentUser.agencyId } : 'skip',
    ) || [];

  const stats = useQuery(
    api.drafts.getDashboardStats,
    currentUser?.agencyId ? { agencyId: currentUser.agencyId } : 'skip',
  );

  const updateDraftStatus = useMutation(api.drafts.updateDraftStatus);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<Id<'contentDrafts'> | null>(null);

  const selectedDraft = agencyDrafts.find((d) => d._id === selectedDraftId);

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
      if (selectedDraftId === draftId) setSelectedDraftId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevise = async (draftId: Id<'contentDrafts'>) => {
    const notes = prompt('Masukkan masukan revisi untuk kreator:');
    if (notes) {
      try {
        await updateDraftStatus({ draftId, status: 'Draft', revisionNotes: notes });
        if (selectedDraftId === draftId) setSelectedDraftId(null);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const hasRangeData = startDate && endDate && new Date(startDate) < new Date(endDate);

  const realMetrics = [
    {
      label: 'Total Konten',
      value: stats?.total.toString() || '0',
      delta: 'Kumulatif',
      tone: 'positive',
    },
    {
      label: 'Konten Disetujui',
      value: stats?.approved.toString() || '0',
      delta: `${Math.round(((stats?.approved || 0) / (stats?.total || 1)) * 100)}% dari total`,
      tone: 'positive',
    },
    {
      label: 'Dalam Peninjauan',
      value: stats?.review.toString() || '0',
      delta: 'Butuh atensi',
      tone: stats?.review && stats.review > 5 ? 'negative' : 'positive',
    },
    {
      label: 'Draf Aktif',
      value: stats?.draft.toString() || '0',
      delta: 'Sedang diproses',
      tone: 'positive',
    },
  ];

  const platformCounts = agencyDrafts.reduce((acc: Record<string, number>, d) => {
    const p = d.platform || 'Lainnya';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  const totalDraftsCount = agencyDrafts.length || 1;
  const displayPlatformData = Object.entries(platformCounts)
    .map(([label, count]) => ({
      label,
      value: Math.round((count / totalDraftsCount) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-[var(--slate-900)]">Persetujuan & Analitik</h2>
        <p className="text-sm text-[var(--slate-500)] mt-1">
          Tinjau konten yang tertunda dan pantau performa ruang kerja.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_500px]">
        <div className="space-y-6">
          {/* Approval Queue */}
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--slate-900)]">Menunggu Persetujuan</h3>
              <span className="bg-purple-100 text-[var(--purple-strong)] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                {reviewDrafts.length} Tertunda
              </span>
            </div>

            {reviewDrafts.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[var(--slate-100)] rounded-2xl">
                <p className="text-sm text-[var(--slate-400)] italic">
                  Semua beres! Tidak ada draf yang perlu ditinjau.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewDrafts.map((draft) => (
                  <div
                    key={draft._id}
                    onClick={() => setSelectedDraftId(draft._id)}
                    className={cn(
                      'rounded-2xl border p-5 shadow-sm transition-all cursor-pointer',
                      selectedDraftId === draft._id
                        ? 'border-[var(--purple-border)] bg-white ring-1 ring-[var(--purple-border)]'
                        : 'border-[var(--slate-200)] bg-white/60 hover:border-[var(--purple-border)]',
                    )}
                  >
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed text-[var(--slate-800)] line-clamp-2 font-medium">
                          {draft.content.replace(/<[^>]*>?/gm, '') || 'Konten kosong'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="bg-[var(--slate-100)] text-[var(--slate-600)] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {draft.platform || 'Umum'}
                          </span>
                          <span className="text-[10px] text-[var(--slate-400)] font-medium">
                            {new Date(draft._creationTime).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs font-bold text-[var(--purple-strong)] uppercase tracking-tight">
                          Lihat Detail →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* Performance Snapshot */}
          <div className="grid gap-4 md:grid-cols-2">
            {realMetrics.map((m) => (
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

        {/* Detail Panel */}
        <div className="space-y-6">
          {selectedDraft ? (
            <GlassPanel className="p-6 sticky top-24 border-[var(--purple-border)] ring-1 ring-[rgba(124,58,237,0.1)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--slate-900)]">Detail Peninjauan</h3>
                <button
                  onClick={() => setSelectedDraftId(null)}
                  className="text-xs text-[var(--slate-400)] hover:text-[var(--slate-600)]"
                >
                  Tutup
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--slate-400)]">
                    Isi Konten
                  </label>
                  <div
                    className="mt-3 p-4 rounded-xl bg-[var(--slate-50)] border border-[var(--slate-100)] text-sm leading-relaxed text-[var(--slate-800)] max-h-[500px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: selectedDraft.content }}
                  />
                </div>

                {selectedDraft.mediaAssetIds && selectedDraft.mediaAssetIds.length > 0 && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--slate-400)]">
                      Aset Media
                    </label>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {selectedDraft.mediaAssetIds.map((assetId) => (
                        <MediaItem key={assetId} assetId={assetId} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-[var(--slate-100)] space-y-3">
                  <button
                    onClick={() => handleApprove(selectedDraft._id)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-md transition-all active:scale-[0.98]"
                  >
                    <IconCheck /> Setujui Konten
                  </button>
                  <button
                    onClick={() => handleRevise(selectedDraft._id)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100 transition-all active:scale-[0.98]"
                  >
                    Minta Revisi
                  </button>
                </div>
              </div>
            </GlassPanel>
          ) : (
            <div className="space-y-6">
              <GlassPanel className="p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--slate-700)] mb-6">
                  Distribusi Platform
                </h3>
                <div className="space-y-6">
                  {displayPlatformData.map((p) => (
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
                  {displayPlatformData.length === 0 && (
                    <p className="text-xs text-[var(--slate-400)] italic text-center py-4">
                      Belum ada data distribusi.
                    </p>
                  )}
                </div>
              </GlassPanel>

              <GlassPanel className="p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--slate-700)] mb-4">
                  Ekspor Laporan
                </h3>
                <p className="text-xs text-[var(--slate-500)] leading-relaxed mb-6">
                  Unduh performa kampanye dan log persetujuan Anda untuk pelaporan internal.
                </p>
                <div className="space-y-2">
                  <button className="w-full rounded-xl border border-[var(--slate-200)] bg-white py-2.5 text-xs font-bold text-[var(--slate-700)] hover:bg-[var(--slate-50)] transition-all">
                    Unduh CSV
                  </button>
                  <button className="w-full rounded-xl border border-[var(--slate-200)] bg-white py-2.5 text-xs font-bold text-[var(--slate-700)] hover:bg-[var(--slate-50)] transition-all">
                    Unduh PDF
                  </button>
                </div>
              </GlassPanel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
