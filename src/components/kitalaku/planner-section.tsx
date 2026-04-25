'use client';

import { useState } from 'react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { IconCopy, IconThumb, IconWand } from './icons';
import { cn, GlassPanel } from './primitives';
import { Id } from '@/convex/_generated/dataModel';
import { RichTextEditor } from './rich-text-editor';
import { MediaUploader } from './media-uploader';
import { MediaItem } from './media-item';

export function PlannerSection() {
  const [brief, setBrief] = useState('');
  const [tone, setTone] = useState('Refined & Warm');
  const [platform, setPlatform] = useState('Instagram');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<Id<'contentDrafts'> | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const [selectedBrandId, setSelectedBrandId] = useState<Id<'brands'> | ''>('');
  const [selectedProjectId, setSelectedProjectId] = useState<Id<'projects'> | ''>('');

  const currentUser = useQuery(api.users.getCurrentUser);
  const contentLock = useQuery(
    api.collaborativeLocks.getLock,
    draftId ? { documentId: draftId, field: 'content' } : 'skip',
  );
  const acquireLock = useMutation(api.collaborativeLocks.acquireLock);
  const releaseLock = useMutation(api.collaborativeLocks.releaseLock);

  const brands = useQuery(api.brands.getBrands) || [];
  const projects =
    useQuery(
      api.projects.getProjects,
      selectedBrandId ? { brandId: selectedBrandId as Id<'brands'> } : 'skip',
    ) || [];

  const agencyQuota = useQuery(api.brands.getAgencyQuota);
  const quotaExhausted = agencyQuota && agencyQuota.tokenQuotaRemaining <= 0;

  const generateDraftAction = useAction(api.ai.generateDraft);
  const saveDraftMutation = useMutation(api.drafts.createDraft);
  const updateDraftMutation = useMutation(api.drafts.updateDraftContent);
  const updateDraftStatusMutation = useMutation(api.drafts.updateDraftStatus);

  const draft = useQuery(api.drafts.getDraft, draftId ? { draftId } : 'skip');
  const [revisionNotes, setRevisionNotes] = useState('');

  const handleGenerate = async () => {
    if (!brief.trim()) {
      setError('Brief cannot be empty.');
      return;
    }
    if (brief.length > 500) {
      setError('Brief must be under 500 characters.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const result = await generateDraftAction({
        brief,
        tone,
        platform,
      });
      setGeneratedText(result);
      setDraftId(null);
      setSaveStatus('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate content.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedBrandId || !selectedProjectId) {
      setError('Please select a brand and project to save the draft.');
      return;
    }
    if (!generatedText.trim()) {
      setError('No generated content to save.');
      return;
    }

    try {
      setSaveStatus('Saving...');
      const newDraftId = await saveDraftMutation({
        brandId: selectedBrandId as Id<'brands'>,
        projectId: selectedProjectId as Id<'projects'>,
        content: generatedText,
        aiPrompt: brief,
        platform,
      });
      setDraftId(newDraftId);
      setSaveStatus('Saved to Drafts');
    } catch (err: any) {
      setError(err.message || 'Failed to save draft.');
      setSaveStatus('');
    }
  };

  const handleAutoSave = async (newContent: string) => {
    if (!draftId) return;
    try {
      setSaveStatus('Auto-saving...');
      await updateDraftMutation({
        draftId,
        content: newContent,
      });
      setSaveStatus('Saved to Drafts');
    } catch (err) {
      console.error('Auto-save failed', err);
      setSaveStatus('Auto-save failed');
    }
  };

  const handleUpdateStatus = async (newStatus: 'Draft' | 'Review' | 'Approved') => {
    if (!draftId) return;
    try {
      setSaveStatus(`Updating to ${newStatus}...`);
      await updateDraftStatusMutation({
        draftId,
        status: newStatus,
        revisionNotes: newStatus === 'Draft' ? revisionNotes : undefined,
      });
      setSaveStatus(`Status: ${newStatus}`);
      if (newStatus !== 'Draft') setRevisionNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const isLockedByOther = contentLock && currentUser && contentLock.lockedBy !== currentUser._id;

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

  return (
    <div id="planner" className="space-y-5">
      <GlassPanel className="relative overflow-hidden border-[rgba(124,58,237,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(245,247,255,0.9))] p-6 text-[var(--slate-900)] shadow-[var(--shadow-premium)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.14),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.65),transparent_52%)]" />
        <div className="relative z-10">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[var(--purple-soft)] p-2 text-[var(--slate-900)]">
              <IconWand />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slate-700)]">
                AI PLANNER
              </p>
              <h2 className="font-display mt-4 text-5xl leading-[0.98] text-[var(--slate-900)] md:text-6xl">
                Buat draft konten baru.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--slate-600)]">
                Isi brief singkat, pilih tone, lalu generate caption yang bisa langsung diedit
                sebelum dikirim ke review.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <label
                htmlFor="planner-brief"
                className="text-sm font-medium text-[var(--slate-900)]"
              >
                Target audience dan topik bisnis
              </label>
              <textarea
                id="planner-brief"
                rows={4}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Founder brand premium, Gen Z urban, launching serum hydration baru..."
                className="mt-2 w-full resize-none rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm leading-7 text-[var(--slate-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="planner-platform"
                  className="text-sm font-medium text-[var(--slate-900)]"
                >
                  Platform
                </label>
                <select
                  id="planner-platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--slate-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition-all duration-200 focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] hover:border-[var(--slate-300)]"
                >
                  <option>Instagram</option>
                  <option>LinkedIn</option>
                  <option>Twitter / X</option>
                  <option>TikTok</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="planner-tone"
                  className="text-sm font-medium text-[var(--slate-900)]"
                >
                  Tone of voice
                </label>
                <select
                  id="planner-tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--slate-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition-all duration-200 focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] hover:border-[var(--slate-300)]"
                >
                  <option>Refined &amp; Warm</option>
                  <option>Professional &amp; Confident</option>
                  <option>Playful &amp; Conversational</option>
                  <option>Minimal &amp; Elegant</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.08)] p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {quotaExhausted && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 font-medium">
              ⚠️ AI Quota Exhausted. Please contact your administrator to top up tokens.
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !!quotaExhausted}
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_20px_45px_rgba(124,58,237,0.36)] disabled:opacity-50 disabled:hover:transform-none"
            >
              {isGenerating ? (
                <span className="animate-pulse">Generating...</span>
              ) : (
                <>
                  <IconWand />
                  <span>Generate draft</span>
                </>
              )}
            </button>
            <button
              onClick={() => setBrief('')}
              className="rounded-2xl border border-[var(--slate-200)] bg-white/90 px-6 py-3 text-sm font-semibold text-[var(--slate-700)] transition-all duration-200 hover:bg-white hover:border-[var(--slate-300)]"
            >
              Reset brief
            </button>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassPanel className="p-5">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[var(--slate-900)]">Workspace Destination</h3>
            <div>
              <label className="text-sm font-medium text-[var(--slate-900)]">Select Brand</label>
              <select
                value={selectedBrandId}
                onChange={(e) => {
                  setSelectedBrandId(e.target.value as Id<'brands'>);
                  setSelectedProjectId(''); // reset project
                }}
                className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--slate-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition-all duration-200 focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] hover:border-[var(--slate-300)]"
              >
                <option value="">-- Choose Brand --</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedBrandId && (
              <div>
                <label className="text-sm font-medium text-[var(--slate-900)]">
                  Select Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value as Id<'projects'>)}
                  className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--slate-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition-all duration-200 focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] hover:border-[var(--slate-300)]"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleSaveDraft}
              disabled={!generatedText || !selectedProjectId || draftId !== null}
              className="mt-4 rounded-xl bg-[var(--slate-900)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saveStatus || (draftId ? 'Saved' : 'Save to Drafts')}
            </button>

            {draftId && (
              <div className="mt-4 space-y-3 border-t border-[var(--slate-100)] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--slate-500)] uppercase tracking-wider">
                    Approval Workflow
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                      draft?.status === 'Draft'
                        ? 'bg-amber-100 text-amber-700'
                        : draft?.status === 'Review'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700',
                    )}
                  >
                    {draft?.status}
                  </span>
                </div>

                <div className="mt-4">
                  <span className="text-xs font-semibold text-[var(--slate-500)] uppercase tracking-wider block mb-3">
                    Media Assets
                  </span>
                  <MediaUpload draftId={draftId} />

                  {draft?.mediaAssetIds && draft.mediaAssetIds.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {draft.mediaAssetIds.map((assetId) => (
                        <MediaItem key={assetId} assetId={assetId} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {draft?.status === 'Draft' && (
                    <button
                      onClick={() => handleUpdateStatus('Review')}
                      className="col-span-2 rounded-xl bg-[var(--purple-strong)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--slate-900)]"
                    >
                      Submit for Review
                    </button>
                  )}

                  {draft?.status === 'Review' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus('Approved')}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Enter revision notes:');
                          if (notes) {
                            setRevisionNotes(notes);
                            // We need to wait for state to update or just pass it directly
                            updateDraftStatusMutation({
                              draftId,
                              status: 'Draft',
                              revisionNotes: notes,
                            });
                          }
                        }}
                        className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100"
                      >
                        Request Revision
                      </button>
                    </>
                  )}
                </div>

                {draft?.revisionNotes && draft.status === 'Draft' && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-amber-700">Revision Notes</p>
                    <p className="mt-1 text-xs text-amber-800 italic">{draft.revisionNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[var(--slate-900)]">Manual Edit Panel</h3>
            <span className="text-xs text-[var(--slate-400)]">
              {generatedText.length} characters
            </span>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="rounded-lg border border-[var(--slate-150)] bg-white/70 px-3 py-2 text-sm text-[var(--slate-700)]">
              Platform: {platform}
            </div>
            <div className="rounded-lg border border-[var(--slate-150)] bg-white/70 px-3 py-2 text-sm text-[var(--slate-700)]">
              Tone: {tone}
            </div>
          </div>

          {isLockedByOther && (
            <div className="mt-4 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.08)] p-3 text-sm font-medium text-red-600 flex items-center justify-between">
              <span>🔒 This content is currently being edited by {contentLock.userName}</span>
              <span className="text-xs">You cannot edit until they finish.</span>
            </div>
          )}

          <div className="mt-4">
            <RichTextEditor
              value={generatedText}
              onChange={setGeneratedText}
              onAutoSave={handleAutoSave}
              disabled={!!isLockedByOther}
              onFocus={handleEditorFocus}
              onBlur={handleEditorBlur}
            />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.08)] p-3 text-xs text-[var(--amber-strong)]">
            <span>Human-in-the-loop validation required before approval.</span>
            {draftId && <span className="font-semibold text-[var(--slate-700)]">{saveStatus}</span>}
          </div>
          <MediaUploader draftId={draftId} />
        </GlassPanel>
      </div>
    </div>
  );
}
