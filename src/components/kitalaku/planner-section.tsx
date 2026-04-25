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

  // Structured Briefing States
  const [targetAudience, setTargetAudience] = useState('');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [contentType, setContentType] = useState('Social Media Copy');
  const [tone, setTone] = useState('Refined & Warm');
  const [platform, setPlatform] = useState('Instagram');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<Id<'contentDrafts'> | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const { selectedBrandId, selectedProjectId } = useWorkspace();

  const currentUser = useQuery(api.users.getCurrentUser);
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
      setError('Target Audience and Topic are required.');
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
      setError(err.message || 'Failed to generate content.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedBrandId || !selectedProjectId) {
      setError('Please select a brand and project in the sidebar to save the draft.');
      return;
    }
    if (!generatedText.trim()) {
      setError('No generated content to save.');
      return;
    }

    const combinedBrief = `Audience: ${targetAudience} | Topic: ${topic}`;

    try {
      setSaveStatus('Saving...');
      const newDraftId = await saveDraftMutation({
        brandId: selectedBrandId as Id<'brands'>,
        projectId: selectedProjectId as Id<'projects'>,
        content: generatedText,
        aiPrompt: combinedBrief,
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

  return (
    <div id="planner" className="space-y-6">
      {/* 1. Briefing Section */}
      <GlassPanel className="relative overflow-hidden border-[rgba(124,58,237,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(245,247,255,0.9))] p-6 shadow-[var(--shadow-premium)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.14),transparent_40%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[var(--purple-soft)] p-2 text-[var(--slate-900)]">
              <IconWand />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--slate-500)]">
                AI Content Ideation
              </p>
              <h2 className="font-display mt-1 text-4xl text-[var(--slate-900)]">
                Rancang Konsep Konten.
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--slate-500)]">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full rounded-xl border border-[var(--slate-200)] bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--purple-border)]"
              >
                <option>Social Media Copy</option>
                <option>Video Script (Reels/TikTok)</option>
                <option>Blog Post Outline</option>
                <option>Storyboard Concept</option>
                <option>Email Newsletter</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--slate-500)]">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl border border-[var(--slate-200)] bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--purple-border)]"
              >
                <option>Instagram</option>
                <option>TikTok</option>
                <option>LinkedIn</option>
                <option>Twitter / X</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--slate-500)]">
                Tone of Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl border border-[var(--slate-200)] bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--purple-border)]"
              >
                <option>Refined & Warm</option>
                <option>Professional & Confident</option>
                <option>Playful & Conversational</option>
                <option>Minimal & Elegant</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--slate-500)]">
                Target Audience
              </label>
              <textarea
                rows={3}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Gen Z Urban, Tech Founders, Busy Moms..."
                className="w-full rounded-xl border border-[var(--slate-200)] bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--purple-border)] resize-none"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--slate-500)]">
                The Topic / Hook
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Product launch, educational tip, trend response..."
                className="w-full rounded-xl border border-[var(--slate-200)] bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--purple-border)] resize-none"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--slate-500)]">
                Objective / Goal
              </label>
              <textarea
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Engagement, brand awareness, direct sale..."
                className="w-full rounded-xl border border-[var(--slate-200)] bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--purple-border)] resize-none"
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
                <span className="animate-pulse">Crafting your content...</span>
              ) : (
                <>
                  <IconWand />
                  <span>Generate AI Draft</span>
                </>
              )}
            </button>
            <button
              onClick={resetBrief}
              className="rounded-2xl border border-[var(--slate-200)] bg-white/50 px-6 py-3 text-sm font-semibold text-[var(--slate-600)] transition-all hover:bg-white"
            >
              Reset
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* 2. Result & Editor Section */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Editor (Primary) */}
        <div className="space-y-6">
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--slate-900)]">Draft Editor</h3>
                <p className="text-xs text-[var(--slate-500)] mt-0.5">
                  Refine your AI generated content here.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {draftId ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase text-emerald-600 border border-emerald-100">
                    <IconCheck /> Syncing
                  </span>
                ) : (
                  <button
                    onClick={handleSaveDraft}
                    disabled={!generatedText || !selectedProjectId}
                    className="rounded-xl bg-[var(--slate-900)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--slate-800)] disabled:opacity-50 transition-all"
                  >
                    Save to Project
                  </button>
                )}
              </div>
            </div>

            {isLockedByOther && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600 font-medium">
                🔒 Locked by {contentLock.userName}
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--slate-400)] mb-4">
                Media Assets
              </h4>
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
                Workflow Status
              </h3>

              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--slate-500)]">Current Status</span>
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
                    {draft?.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {draft?.status === 'Draft' && (
                    <button
                      onClick={() => handleUpdateStatus('Review')}
                      className="w-full rounded-xl bg-[var(--purple-strong)] py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
                    >
                      Send for Review
                    </button>
                  )}

                  {draft?.status === 'Review' && (
                    <div className="grid gap-2">
                      <button
                        onClick={() => handleUpdateStatus('Approved')}
                        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Revision notes:');
                          if (notes) {
                            handleUpdateStatus('Draft');
                            setRevisionNotes(notes);
                          }
                        }}
                        className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-all"
                      >
                        Request Revision
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-[var(--slate-100)]">
                  <button
                    onClick={() => router.push('/dashboard/scheduler')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--slate-200)] bg-white py-2.5 text-sm font-semibold text-[var(--slate-700)] hover:border-[var(--purple-border)] transition-all"
                  >
                    <IconCalendar />
                    <span>View in Scheduler</span>
                  </button>
                </div>
              </div>

              {draft?.revisionNotes && draft.status === 'Draft' && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <p className="font-bold uppercase text-[9px] mb-1">Feedback</p>
                  <p className="italic">"{draft.revisionNotes}"</p>
                </div>
              )}
            </GlassPanel>
          ) : (
            <GlassPanel className="p-6 text-center opacity-60">
              <div className="mx-auto w-10 h-10 rounded-full bg-[var(--slate-100)] flex items-center justify-center mb-4">
                <IconCheck />
              </div>
              <h3 className="text-sm font-semibold text-[var(--slate-900)]">Save to get started</h3>
              <p className="text-xs text-[var(--slate-500)] mt-2">
                Your draft status and media management will appear here once saved.
              </p>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
