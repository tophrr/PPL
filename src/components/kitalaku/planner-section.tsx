'use client';

import { useState, useEffect } from 'react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { IconCopy, IconThumb, IconWand, IconCalendar, IconCheck } from './icons';
import { cn, GlassPanel } from './primitives';
import { Id } from '@/convex/_generated/dataModel';
import { RichTextEditor } from './rich-text-editor';
import { MediaUploader } from './media-uploader';
import { MediaItem } from './media-item';
import { useWorkspace } from './workspace-context';

export function PlannerSection() {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);

  // Structured Briefing States
  const [targetAudience, setTargetAudience] = useState('');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [contentType, setContentType] = useState('Konten Media Sosial');
  const [tone, setTone] = useState('Refined & Warm');
  const [platform, setPlatform] = useState('Instagram');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<Id<'contentDrafts'> | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isManualMode, setIsManualMode] = useState(false);

  const { selectedBrandId, selectedProjectId } = useWorkspace();

  const contentLock = useQuery(
    api.collaborativeLocks.getLock,
    draftId ? { documentId: draftId, field: 'content' } : 'skip',
  );
  const acquireLock = useMutation(api.collaborativeLocks.acquireLock);
  const releaseLock = useMutation(api.collaborativeLocks.releaseLock);

  const agencyQuota = useQuery(api.brands.getAgencyQuota);
  const quotaExhausted = agencyQuota && agencyQuota.tokenQuotaRemaining <= 0;

  const generateDraftAction = useAction(api.ai.generateDraft);
  const saveDraftMutation = useMutation(api.drafts.createDraft);
  const updateDraftMutation = useMutation(api.drafts.updateDraftContent);
  const updateDraftStatusMutation = useMutation(api.drafts.updateDraftStatus);

  const searchParams = useSearchParams();
  const urlDraftId = searchParams.get('draftId');

  const draft = useQuery(api.drafts.getDraft, draftId ? { draftId } : 'skip');
  const [revisionNotes, setRevisionNotes] = useState('');

  // Effect to load draft from URL
  useEffect(() => {
    if (urlDraftId) {
      setDraftId(urlDraftId as Id<'contentDrafts'>);
    }
  }, [urlDraftId]);

  // Effect to sync content when draft is loaded
  useEffect(() => {
    if (draft && draft._id === draftId) {
      setGeneratedText(draft.content);
    }
  }, [draft, draftId]);

  const handleGenerate = async () => {
    if (!targetAudience.trim() || !topic.trim()) {
      setError('Target Audiens dan Topik wajib diisi.');
      return;
    }

    const combinedBrief = `
      Content Type: ${contentType}
      Platform: ${platform}
      Target Audience: ${targetAudience}
      Topic: ${topic}
      Goal: ${goal}
      Tone: ${tone}
    `.trim();

    setError(null);
    setIsGenerating(true);

    try {
      const result = await generateDraftAction({
        brief: combinedBrief,
        tone,
        platform,
      });
      setGeneratedText(result);
      setDraftId(null);
      setSaveStatus('');
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan konten.');
    } finally {
      setIsGenerating(false);
      setIsManualMode(false);
    }
  };

  const handleStartManualDraft = () => {
    setError(null);
    setGeneratedText('');
    setDraftId(null);
    setSaveStatus('');
    setIsManualMode(true);

    // Scroll to editor
    const editorElement = document.getElementById('editor-section');
    if (editorElement) {
      editorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedBrandId || !selectedProjectId) {
      setError('Mohon pilih brand dan proyek di sidebar untuk menyimpan draf.');
      return;
    }
    if (!generatedText.trim()) {
      setError('Tidak ada konten untuk disimpan.');
      return;
    }

    const combinedBrief =
      !isManualMode && targetAudience.trim() && topic.trim()
        ? `Audience: ${targetAudience} | Topic: ${topic}`
        : undefined;

    try {
      setSaveStatus('Menyimpan...');
      const newDraftId = await saveDraftMutation({
        brandId: selectedBrandId as Id<'brands'>,
        projectId: selectedProjectId as Id<'projects'>,
        content: generatedText,
        aiPrompt: combinedBrief,
        platform,
      });
      setDraftId(newDraftId);
      setSaveStatus('Tersimpan ke Draf');
      setIsManualMode(false);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan draf.');
      setSaveStatus('');
    }
  };

  const handleAutoSave = async (newContent: string) => {
    if (!draftId) return;
    try {
      setSaveStatus('Menyimpan otomatis...');
      await updateDraftMutation({
        draftId,
        content: newContent,
      });
      setSaveStatus('Tersimpan ke Draf');
    } catch (err) {
      console.error('Auto-save failed', err);
      setSaveStatus('Gagal simpan otomatis');
    }
  };

  const handleUpdateStatus = async (newStatus: 'Draft' | 'Review' | 'Approved') => {
    if (!draftId) return;
    try {
      setSaveStatus(`Memperbarui ke ${newStatus}...`);
      await updateDraftStatusMutation({
        draftId,
        status: newStatus,
        revisionNotes: newStatus === 'Draft' ? revisionNotes : undefined,
      });
      setSaveStatus(
        `Status: ${newStatus === 'Draft' ? 'Draf' : newStatus === 'Review' ? 'Ditinjau' : 'Disetujui'}`,
      );
      if (newStatus !== 'Draft') setRevisionNotes('');
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui status.');
    }
  };

  const isLockedByOther =
    contentLock && currentUser && (contentLock.lockedBy as any) !== currentUser._id;

  const handleEditorFocus = async () => {
    if (draftId && !isLockedByOther) {
      try {
        await acquireLock({ documentId: draftId, field: 'content' });
      } catch (err) {
        console.error('Failed to acquire lock', err);
      }
    }
  };

  const handleEditorBlur = async () => {
    if (draftId) {
      try {
        await releaseLock({ documentId: draftId, field: 'content' });
      } catch (err) {
        console.error('Failed to release lock', err);
      }
    }
  };

  const resetBrief = () => {
    setTargetAudience('');
    setTopic('');
    setGoal('');
    setError(null);
  };

  if (currentUser?.role === 'Client') {
    return (
      <GlassPanel className="p-12 text-center">
        <h2 className="text-2xl font-bold text-(--slate-900)">Akses Terbatas</h2>
        <p className="mt-4 text-(--slate-600)">
          Sebagai Klien, Anda memiliki akses untuk meninjau dan menyetujui konten, namun tidak untuk
          membuat draf baru.
        </p>
        <button
          onClick={() => router.push('/dashboard/approval-analytics')}
          className="mt-8 rounded-xl bg-(--purple-strong) px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90"
        >
          Buka Persetujuan & Analitik
        </button>
      </GlassPanel>
    );
  }

  return (
    <div id="planner" className="space-y-6">
      {/* 1. Briefing Section */}
      <GlassPanel className="relative overflow-hidden border-[rgba(124,58,237,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(245,247,255,0.9))] p-6 shadow-(--shadow-premium) md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.14),transparent_40%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-(--purple-soft) p-2 text-(--slate-900)">
              <IconWand />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-(--slate-500)">
                Ideasi Konten AI
              </p>
              <h2 className="font-display mt-1 text-4xl text-(--slate-900)">
                Rancang Konsep Konten.
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-(--slate-500)">
                Jenis Konten
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full rounded-xl border border-(--slate-200) bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-(--purple-border)"
              >
                <option>Konten Media Sosial</option>
                <option>Skrip Video (Reels/TikTok)</option>
                <option>Outline Blog Post</option>
                <option>Konsep Storyboard</option>
                <option>Newsletter Email</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-(--slate-500)">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl border border-(--slate-200) bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-(--purple-border)"
              >
                <option>Instagram</option>
                <option>TikTok</option>
                <option>LinkedIn</option>
                <option>Twitter / X</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-(--slate-500)">
                Gaya Bahasa (Tone)
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl border border-(--slate-200) bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-(--purple-border)"
              >
                <option>Refined & Warm</option>
                <option>Professional & Confident</option>
                <option>Playful & Conversational</option>
                <option>Minimal & Elegant</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-(--slate-500)">
                Target Audiens
              </label>
              <textarea
                rows={3}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Gen Z Perkotaan, Founder Startup, Ibu Rumah Tangga..."
                className="w-full rounded-xl border border-(--slate-200) bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-(--purple-border) resize-none"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-(--slate-500)">
                Topik / Hook
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Peluncuran produk, tips edukasi, respon tren..."
                className="w-full rounded-xl border border-(--slate-200) bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-(--purple-border) resize-none"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-(--slate-500)">
                Objektif / Goal
              </label>
              <textarea
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Engagement, kesadaran brand, penjualan langsung..."
                className="w-full rounded-xl border border-(--slate-200) bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-(--purple-border) resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !!quotaExhausted}
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="animate-pulse">Menyusun konten Anda...</span>
              ) : (
                <>
                  <IconWand />
                  <span>Hasilkan Draf AI</span>
                </>
              )}
            </button>
            <button
              onClick={handleStartManualDraft}
              className="rounded-2xl border border-[var(--purple-border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--purple-strong)] transition-all hover:bg-[var(--purple-soft)]"
            >
              Buat Draf Manual
            </button>
            <button
              onClick={resetBrief}
              className="rounded-2xl border border-(--slate-200) bg-white/50 px-6 py-3 text-sm font-semibold text-(--slate-600) transition-all hover:bg-white"
            >
              Reset
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* 2. Result & Editor Section */}
      <div id="editor-section" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Editor (Primary) */}
        <div className="space-y-6">
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-(--slate-900)">Editor Draf</h3>
                <p className="mt-0.5 text-xs text-(--slate-500)">
                  Poles konten hasil AI Anda di sini.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {draftId ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase text-emerald-600 border border-emerald-100">
                    <IconCheck /> Sinkronisasi
                  </span>
                ) : !selectedBrandId || !selectedProjectId ? (
                  <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-700">
                    ⚠ Pilih Brand & Proyek di sidebar
                  </span>
                ) : (
                  <button
                    onClick={handleSaveDraft}
                    disabled={!generatedText}
                    className="rounded-xl bg-(--slate-900) px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-(--slate-800) disabled:opacity-50 transition-all"
                  >
                    Simpan ke Proyek
                  </button>
                )}
              </div>
            </div>

            {isLockedByOther && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600 font-medium">
                🔒 Terkunci oleh {contentLock.userName}
              </div>
            )}

            <RichTextEditor
              value={generatedText}
              onChange={setGeneratedText}
              onAutoSave={handleAutoSave}
              disabled={!!isLockedByOther}
              onFocus={handleEditorFocus}
              onBlur={handleEditorBlur}
            />

            <div className="mt-8 border-t border-[var(--slate-100)] pt-6">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-(--slate-400)">
                Aset Media
              </h4>
              {!draftId && (
                <p className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  💡 Simpan draf terlebih dahulu untuk mengunggah media.
                </p>
              )}
              <MediaUploader draftId={draftId} />

              {draft?.mediaAssetIds && draft.mediaAssetIds.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {draft.mediaAssetIds.map((assetId) => (
                    <MediaItem key={assetId} assetId={assetId} />
                  ))}
                </div>
              )}
            </div>
          </GlassPanel>
        </div>

        {/* Workflow Sidebar */}
        <div className="space-y-6">
          {draftId ? (
            <GlassPanel className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--slate-900)]">
                Status Alur Kerja
              </h3>

              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-(--slate-500)">Status Saat Ini</span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase',
                      draft?.status === 'Draft'
                        ? 'bg-amber-100 text-amber-700'
                        : draft?.status === 'Review'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700',
                    )}
                  >
                    {draft?.status === 'Draft'
                      ? 'Draf'
                      : draft?.status === 'Review'
                        ? 'Ditinjau'
                        : 'Disetujui'}
                  </span>
                </div>

                <div className="space-y-2">
                  {draft?.status === 'Draft' && (
                    <button
                      onClick={() => handleUpdateStatus('Review')}
                      className="w-full rounded-xl bg-(--purple-strong) py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
                    >
                      Kirim untuk Ditinjau
                    </button>
                  )}

                  {draft?.status === 'Review' && (
                    <div className="grid gap-2">
                      <button
                        onClick={() => handleUpdateStatus('Approved')}
                        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Catatan revisi:');
                          if (notes) {
                            handleUpdateStatus('Draft');
                            setRevisionNotes(notes);
                          }
                        }}
                        className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-all"
                      >
                        Minta Revisi
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-[var(--slate-100)]">
                  <button
                    onClick={() => router.push('/dashboard/scheduler')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-(--slate-200) bg-white py-2.5 text-sm font-semibold text-(--slate-700) hover:border-(--purple-border) transition-all"
                  >
                    <IconCalendar />
                    <span>Lihat di Penjadwal</span>
                  </button>
                </div>
              </div>

              {draft?.revisionNotes && draft.status === 'Draft' && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <p className="mb-1 text-[9px] font-bold uppercase">Umpan Balik</p>
                  <p className="italic">"{draft.revisionNotes}"</p>
                </div>
              )}
            </GlassPanel>
          ) : (
            <GlassPanel className="p-6 text-center opacity-60">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-(--slate-100)">
                <IconCheck />
              </div>
              <h3 className="text-sm font-semibold text-(--slate-900)">Simpan untuk memulai</h3>
              <p className="mt-2 text-xs text-(--slate-500)">
                Status draf dan manajemen media akan muncul di sini setelah draf disimpan.
              </p>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
