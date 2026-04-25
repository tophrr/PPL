'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useAction, useMutation, useConvexAuth } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  activities,
  analyticsSummary,
  approvalStats,
  calendarColumns,
  captionDrafts,
  contentStatus,
  dashboardMetrics,
  plannerTopics,
  platformPerformance,
} from './data';
import { IconAnalytics, IconCalendar, IconCopy, IconGrid, IconThumb, IconWand } from './icons';
import { cn, GlassPanel, toneDot, toneSurface } from './primitives';

export function DashboardSection() {
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const totalItems = contentStatus.reduce((sum, item) => sum + Number(item.value), 0);

  const quickActions = [
    {
      href: '/dashboard/planner',
      title: 'Open Planner',
      detail: 'Generate a new content direction for the next campaign.',
      icon: <IconWand />,
    },
    {
      href: '/dashboard/scheduler',
      title: 'Review Schedule',
      detail: "Check this week's publishing queue and move blockers faster.",
      icon: <IconCalendar />,
    },
    {
      href: '/dashboard/approval-analytics',
      title: 'Track Performance',
      detail: 'See approvals and engagement without switching context.',
      icon: <IconAnalytics />,
    },
  ];

  const focusItems = [
    {
      title: 'Finalize review queue',
      detail: '8 pieces are waiting for feedback before 16:00.',
      href: '/dashboard/approval-analytics',
      tone: 'review',
    },
    {
      title: "Prepare tomorrow's schedule",
      detail: '3 drafts are ready to be moved into the calendar.',
      href: '/dashboard/scheduler',
      tone: 'draft',
    },
    {
      title: 'Generate fresh campaign ideas',
      detail: 'AI planner still has enough credits for another sprint.',
      href: '/dashboard/planner',
      tone: 'approved',
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_340px]">
        <GlassPanel className="relative overflow-hidden border-[rgba(255,255,255,0.8)] bg-white/40 p-6 text-[var(--slate-900)] shadow-[var(--shadow-premium)] md:p-8 backdrop-blur-3xl">
          <div className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12),transparent_70%)] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.4),rgba(255,255,255,0.05))] pointer-events-none" />

          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--purple-strong)]">
              COMMAND CENTER
            </p>
            <h1 className="font-display mt-4 max-w-4xl text-4xl leading-[1.04] text-[var(--slate-900)] md:text-5xl">
              Content decisions made instantly clear.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-[var(--slate-600)] md:text-base">
              From creative brief to final approval, this workspace is designed to eliminate team
              friction and surface your most important editorial priorities.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {currentUser === undefined ? (
                <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-[var(--slate-900)] italic animate-pulse">
                  Loading User Profile...
                </span>
              ) : currentUser === null ? (
                <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-[var(--slate-900)]">
                  {isAuthenticated ? 'Syncing profile...' : 'Not signed in'}
                </span>
              ) : (
                <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-[var(--slate-900)]">
                  Role: {currentUser.role}
                </span>
              )}
              {['SLA 96%', '8 items waiting review', '24 approved this month'].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-[var(--slate-900)]"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-[22px] border border-white/50 bg-white/60 p-4 shadow-[0_4px_14px_rgba(30,41,59,0.03)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:border-[var(--purple-border)] hover:shadow-[0_12px_30px_rgba(124,58,237,0.08)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--slate-100)] text-[var(--slate-700)] transition-colors duration-300 group-hover:bg-[var(--purple-soft)] group-hover:text-[var(--purple-strong)]">
                    {action.icon}
                  </div>
                  <p className="mt-4 text-base font-semibold text-[var(--slate-900)]">
                    {action.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--slate-700)]">{action.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slate-700)]">
                Today Focus
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--slate-900)]">
                Three priorities
              </h2>
            </div>
            <span className="rounded-full bg-[var(--slate-100)] px-3 py-1 text-xs font-semibold text-[var(--slate-500)]">
              16 Apr
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {focusItems.map((item, index) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-[rgba(219,227,238,0.6)] bg-white/60 p-4 transition-all duration-300 hover:-translate-y-[2px] hover:bg-white hover:border-[var(--purple-border)] hover:shadow-[0_8px_20px_rgba(30,41,59,0.04)]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--slate-100)] text-sm font-semibold text-[var(--slate-700)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--slate-900)]">{item.title}</p>
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
                          toneSurface(item.tone),
                        )}
                      >
                        {item.tone}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--slate-500)]">{item.detail}</p>
                    <Link
                      href={item.href}
                      className="mt-3 inline-flex text-xs font-semibold text-[var(--slate-900)]"
                    >
                      Open module
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[rgba(219,227,238,0.6)] bg-white/60 p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--slate-700)]">Weekly engagement trend</span>
              <span className="font-semibold text-[var(--emerald-strong)]">+24%</span>
            </div>
            <div className="mt-4 flex h-20 items-end gap-2">
              {[34, 45, 41, 60, 56, 68, 72].map((h, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="w-full rounded-t-md bg-[linear-gradient(180deg,#c4b5fd,#8b5cf6)]"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--slate-500)]">
              Best growth came from posts that passed review before noon.
            </p>
          </div>
        </GlassPanel>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--slate-900)]">
            Performance Snapshot
          </h2>
          <p className="mt-1 text-sm text-[var(--slate-500)]">
            Real-time metrics across planner, scheduler, and approvals.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/approval-analytics"
            className="inline-flex items-center justify-center rounded-xl border border-[rgba(219,227,238,0.88)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--slate-700)]"
          >
            View Approvals
          </Link>
          <Link
            href="/dashboard/planner"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-5 py-3 text-sm font-semibold text-[var(--slate-900)] shadow-[var(--shadow-soft)]"
          >
            <IconWand />
            <span>Create AI Draft</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <GlassPanel key={metric.label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--slate-500)]">{metric.label}</p>
                <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--slate-900)]">
                  {metric.value}
                </p>
                <p
                  className={cn(
                    'mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                    metric.tone === 'green'
                      ? 'bg-[var(--emerald-soft)] text-[var(--emerald-strong)]'
                      : metric.tone === 'amber'
                        ? 'bg-[var(--amber-soft)] text-[var(--amber-strong)]'
                        : 'bg-[var(--purple-soft)] text-[var(--slate-900)]',
                  )}
                >
                  {metric.note}
                </p>
              </div>
              <div
                className={cn(
                  'rounded-2xl p-3',
                  metric.tone === 'green'
                    ? 'bg-[var(--emerald-soft)] text-[var(--emerald-strong)]'
                    : metric.tone === 'amber'
                      ? 'bg-[var(--amber-soft)] text-[var(--amber-strong)]'
                      : 'bg-[var(--purple-soft)] text-[var(--slate-900)]',
                )}
              >
                <IconAnalytics />
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--slate-900)]">Workflow Status</h2>
              <p className="mt-1 text-sm text-[var(--slate-500)]">
                {totalItems} active items across the current production cycle.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(124,58,237,0.1)] text-[var(--slate-900)]">
              <IconGrid />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {contentStatus.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[rgba(219,227,238,0.88)] bg-white/74 px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn('h-2.5 w-2.5 rounded-full', toneDot(item.tone))} />
                    <span className="text-sm font-medium text-[var(--slate-700)]">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-2xl font-semibold text-[var(--slate-900)]">
                    {item.value}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[var(--slate-100)]">
                  <div
                    className={cn(
                      'h-2 rounded-full',
                      item.tone === 'approved'
                        ? 'bg-[linear-gradient(90deg,#34d399,#10b981)]'
                        : item.tone === 'review'
                          ? 'bg-[linear-gradient(90deg,#c4b5fd,#8b5cf6)]'
                          : 'bg-[linear-gradient(90deg,#fcd34d,#f59e0b)]',
                    )}
                    style={{ width: `${(Number(item.value) / totalItems) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.08)] p-4 text-sm leading-6 text-[var(--amber-strong)]">
            Human-in-the-loop approval remains active so AI drafts always get a final manual review.
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--slate-900)]">Recent Activity</h2>
              <p className="mt-1 text-sm text-[var(--slate-500)]">
                Latest motion across drafts, approvals, and publishing.
              </p>
            </div>
            <Link
              href="/dashboard/scheduler"
              className="inline-flex w-fit rounded-xl border border-[rgba(219,227,238,0.88)] bg-white/80 px-4 py-2.5 text-sm font-semibold text-[var(--slate-700)]"
            >
              Open Scheduler
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {activities.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[rgba(219,227,238,0.88)] bg-white/74 px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <span className={cn('mt-1.5 h-2.5 w-2.5 rounded-full', item.color)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--slate-800)]">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--slate-500)]">
                          {item.detail}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--slate-100)] px-3 py-1 text-[11px] font-semibold text-[var(--slate-500)]">
                        {item.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

export function PlannerSection() {
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
                defaultValue="Founder brand premium, Gen Z urban, launching serum hydration baru dengan positioning accessible luxury."
                className="mt-2 w-full resize-none rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm leading-7 text-[var(--slate-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]"
              />
            </div>
            <div>
              <label htmlFor="planner-tone" className="text-sm font-medium text-[var(--slate-900)]">
                Tone of voice
              </label>
              <select
                id="planner-tone"
                defaultValue="Refined & Warm"
                className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--slate-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]"
              >
                <option>Refined &amp; Warm</option>
                <option>Professional &amp; Confident</option>
                <option>Playful &amp; Conversational</option>
                <option>Minimal &amp; Elegant</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-6 py-3 text-sm font-semibold text-[var(--slate-900)] shadow-[0_16px_40px_rgba(124,58,237,0.28)]">
              <IconWand />
              <span>Generate draft</span>
            </button>
            <button className="rounded-2xl border border-[var(--slate-200)] bg-white/90 px-6 py-3 text-sm font-semibold text-[var(--slate-700)]">
              Reset brief
            </button>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[var(--purple-soft)] p-2 text-[var(--slate-900)]">
            <IconWand />
          </div>
          <div>
            <h2 className="font-display text-4xl leading-[1.02] text-[var(--slate-900)]">
              Arah konten yang lebih matang, bukan sekadar draft otomatis.
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--slate-500)]">
              Hasil AI di bawah ini sudah disusun seperti workspace nyata: ada topic scoring, manual
              edit, dan caption draft yang siap dipilih tim.
            </p>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--slate-900)]">
                AI-Generated Content
              </h3>
              <p className="mt-1 text-sm text-[var(--emerald-strong)]">Trending Topics</p>
            </div>
            <button className="text-sm font-medium text-[var(--slate-900)]">Refresh</button>
          </div>
          <div className="mt-4 space-y-3">
            {plannerTopics.map((topic) => (
              <article
                key={topic.title}
                className="rounded-xl border border-[rgba(16,185,129,0.16)] bg-[rgba(16,185,129,0.08)] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-[var(--slate-900)]">{topic.title}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-[var(--slate-500)]">
                      <span className="rounded-full bg-white px-2 py-1">{topic.tag}</span>
                      <span>Relevance: {topic.score}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--emerald-strong)]">
                    {topic.lift}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[var(--slate-900)]">Manual Edit Panel</h3>
            <span className="text-xs text-[var(--slate-400)]">0 characters</span>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="rounded-lg border border-[var(--slate-150)] bg-white/70 px-3 py-2 text-sm text-[var(--slate-700)]">
              Platform: Instagram
            </div>
            <div className="rounded-lg border border-[var(--slate-150)] bg-white/70 px-3 py-2 text-sm text-[var(--slate-700)]">
              Tone: Professional
            </div>
          </div>
          <div className="mt-4 h-48 rounded-xl border border-[var(--slate-150)] bg-white/75 px-4 py-4 text-sm text-[var(--slate-400)]">
            Edit AI draft here before submit to review...
          </div>
          <div className="mt-4 rounded-xl border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.08)] p-3 text-xs text-[var(--amber-strong)]">
            Human-in-the-loop validation required before approval.
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="p-5">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--slate-900)]">
          <IconWand />
          <span>Social Media Caption Drafts</span>
        </h3>
        <div className="mt-5 space-y-5">
          {captionDrafts.map((draft) => (
            <article
              key={draft.platform}
              className="rounded-2xl border border-[var(--slate-150)] bg-white/80 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <span className="inline-flex w-fit rounded-full bg-[var(--purple-soft)] px-4 py-2 text-sm font-semibold text-[var(--slate-900)]">
                  {draft.platform}
                </span>
                <span className="text-sm text-[var(--slate-500)]">{draft.tone}</span>
              </div>
              <p className="mt-4 text-lg leading-9 text-[var(--slate-700)]">{draft.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {draft.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-[rgba(124,58,237,0.08)] px-3 py-2 text-sm font-medium text-[var(--slate-900)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[var(--slate-150)] pt-4 text-[var(--slate-900)]">
                <button className="inline-flex items-center gap-2 text-base font-semibold">
                  <IconCopy />
                  <span>Copy to Editor</span>
                </button>
                <button className="text-[var(--slate-500)]">
                  <IconThumb />
                </button>
                <button className="rotate-180 text-[var(--slate-500)]">
                  <IconThumb />
                </button>
              </div>
            </article>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

export function CalendarSection() {
  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const eventToneClass = {
    draft: 'border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.1)] text-[var(--amber-strong)]',
    review: 'border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.1)] text-[var(--slate-900)]',
    approved:
      'border-[rgba(16,185,129,0.18)] bg-[rgba(16,185,129,0.1)] text-[var(--emerald-strong)]',
  } as const;

  const scheduledItemsByDay: Record<
    number,
    Array<{ time: string; title: string; platform: string; tone: 'draft' | 'review' | 'approved' }>
  > = {
    2: [
      { time: '09:30', title: 'Product teaser carousel', platform: 'IG', tone: 'draft' },
      { time: '15:00', title: 'Weekly market recap', platform: 'LN', tone: 'review' },
    ],
    5: [{ time: '11:00', title: 'Stories sequence draft', platform: 'IG', tone: 'draft' }],
    8: [{ time: '10:30', title: 'Customer success short video', platform: 'YT', tone: 'review' }],
    12: [
      { time: '08:45', title: 'Newsletter final approval', platform: 'EM', tone: 'approved' },
      { time: '13:00', title: 'Campaign launch reminder', platform: 'IG', tone: 'approved' },
    ],
    16: [{ time: '14:00', title: 'Community engagement post', platform: 'FB', tone: 'review' }],
    21: [{ time: '10:00', title: 'Feature update thread', platform: 'X', tone: 'draft' }],
    24: [{ time: '09:00', title: 'Ramadan promo highlight', platform: 'TT', tone: 'approved' }],
    27: [{ time: '16:00', title: 'Creator spotlight reel', platform: 'IG', tone: 'review' }],
  };

  const monthDays = [
    { key: 'prev-30', day: 30, inMonth: false },
    { key: 'prev-31', day: 31, inMonth: false },
    ...Array.from({ length: 30 }, (_, index) => ({
      key: `apr-${index + 1}`,
      day: index + 1,
      inMonth: true,
    })),
    { key: 'next-1', day: 1, inMonth: false },
    { key: 'next-2', day: 2, inMonth: false },
    { key: 'next-3', day: 3, inMonth: false },
  ];

  return (
    <div id="calendar" className="space-y-5">
      <GlassPanel className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-display text-4xl leading-[1] text-[var(--slate-900)]">
              Scheduler Board
            </h2>
            <p className="mt-1 text-sm text-[var(--slate-500)]">
              Manage visual timeline from draft to approved.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl border border-[var(--slate-150)] bg-white/80 px-4 py-2.5 text-sm font-medium text-[var(--slate-700)]">
              Filter
            </button>
            <a
              href="#scheduler-calendar"
              className="rounded-xl border border-[var(--slate-150)] bg-white/80 px-4 py-2.5 text-sm font-medium text-[var(--slate-700)]"
            >
              Calendar View
            </a>
            <button className="rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-4 py-2.5 text-sm font-semibold text-[var(--slate-900)]">
              + New Content
            </button>
          </div>
        </div>
      </GlassPanel>

      <div id="scheduler-board" className="grid gap-4 xl:grid-cols-3">
        {calendarColumns.map((column) => (
          <GlassPanel key={column.title} className="p-4">
            <div className="flex items-center justify-between border-b border-[var(--slate-150)] pb-4">
              <div className="flex items-center gap-3">
                <span className={cn('h-2.5 w-2.5 rounded-full', toneDot(column.tone))} />
                <div>
                  <p className="text-2xl font-semibold text-[var(--slate-900)]">{column.title}</p>
                  <p className="text-xs text-[var(--slate-500)]">{column.count} items</p>
                </div>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold',
                  toneSurface(column.tone),
                )}
              >
                {column.count}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {column.cards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-[var(--slate-150)] bg-white/80 p-3"
                >
                  <div className="flex h-28 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f8fafc,#ede9fe)] text-xs font-semibold text-[var(--slate-500)]">
                    {card.title}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold leading-6 text-[var(--slate-800)]">
                    {card.title}
                  </h3>
                  <span className="mt-2 inline-flex rounded-full bg-[rgba(124,58,237,0.08)] px-2 py-1 text-xs font-medium text-[var(--slate-900)]">
                    {card.brand}
                  </span>
                  <div className="mt-3 flex items-center justify-between text-xs text-[var(--slate-500)]">
                    <span>{card.meta}</span>
                    <span className="rounded-full bg-[var(--slate-100)] px-2 py-1">
                      {card.platform}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel id="scheduler-calendar" className="p-5">
        <div className="flex flex-col gap-4 border-b border-[var(--slate-150)] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-[var(--slate-900)]">
              Calendar View
            </h3>
            <p className="mt-1 text-sm text-[var(--slate-500)]">
              April 2026 schedule across draft, review, and approved timelines.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded-full border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.09)] px-3 py-1 text-[var(--amber-strong)]">
              Draft
            </span>
            <span className="rounded-full border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.09)] px-3 py-1 text-[var(--slate-900)]">
              Review
            </span>
            <span className="rounded-full border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.09)] px-3 py-1 text-[var(--emerald-strong)]">
              Approved
            </span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto pb-1">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-7 gap-2">
              {weekdayLabels.map((label) => (
                <p
                  key={label}
                  className="rounded-lg bg-[var(--slate-100)] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[var(--slate-500)]"
                >
                  {label}
                </p>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {monthDays.map((day) => {
                const events = day.inMonth ? (scheduledItemsByDay[day.day] ?? []) : [];

                return (
                  <article
                    key={day.key}
                    className={cn(
                      'min-h-[140px] rounded-xl border border-[var(--slate-150)] bg-white/70 p-3',
                      day.inMonth ? '' : 'opacity-55',
                      day.day === 16 && day.inMonth && 'ring-1 ring-[rgba(124,58,237,0.25)]',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          day.inMonth ? 'text-[var(--slate-800)]' : 'text-[var(--slate-400)]',
                        )}
                      >
                        {day.day}
                      </p>
                      {day.day === 16 && day.inMonth ? (
                        <span className="rounded-full bg-[rgba(124,58,237,0.12)] px-2 py-1 text-[10px] font-semibold text-[var(--slate-900)]">
                          Today
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 space-y-2">
                      {events.length === 0 ? (
                        <p className="text-xs text-[var(--slate-400)]">No schedule</p>
                      ) : (
                        events.map((event) => (
                          <div
                            key={`${day.key}-${event.time}-${event.title}`}
                            className={cn(
                              'rounded-lg border px-2 py-2',
                              eventToneClass[event.tone],
                            )}
                          >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                              {event.time}
                            </p>
                            <p className="mt-1 text-xs font-semibold leading-5">{event.title}</p>
                            <p className="mt-1 text-[10px]">{event.platform}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

export function SubscriptionSection() {
  return (
    <div id="subscription" className="space-y-5">
      <GlassPanel className="relative overflow-hidden p-6 md:p-7">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.2),transparent_70%)]" />
        <div className="absolute -left-20 -bottom-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12),transparent_70%)]" />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slate-700)]">
            Subscription Center
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--slate-900)]">
            Workspace Plan & Billing
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--slate-500)]">
            UI design untuk memantau paket langganan, kuota AI, dan siklus pembayaran. Data siap
            dihubungkan ke Convex untuk status plan, usage, invoice, dan riwayat upgrade.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Convex: subscriptions', 'Convex: usage_events', 'Convex: invoices'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[rgba(124,58,237,0.15)] bg-[rgba(124,58,237,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--slate-900)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassPanel className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--slate-150)] pb-4">
            <div>
              <p className="text-sm font-semibold text-[var(--slate-900)]">Current Plan</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-[var(--slate-900)]">
                Pro Team
              </p>
              <p className="mt-2 text-sm text-[var(--slate-500)]">
                Active until 30 Apr 2026 • Auto-renew enabled
              </p>
            </div>
            <span className="rounded-full bg-[rgba(16,185,129,0.12)] px-3 py-1 text-xs font-semibold text-[var(--emerald-strong)]">
              Healthy
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              ['AI Credits', '7,250 / 10,000', '72.5% used'],
              ['Seats', '12 / 15', '3 seats available'],
              ['Storage', '84 GB / 200 GB', 'Plenty of room'],
            ].map(([label, value, note]) => (
              <div
                key={label}
                className="rounded-2xl border border-[var(--slate-150)] bg-white/80 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--slate-500)]">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--slate-900)]">{value}</p>
                <p className="mt-1 text-xs text-[var(--slate-500)]">{note}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--slate-150)] bg-white/80 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <p className="font-semibold text-[var(--slate-800)]">Monthly credit trend</p>
              <p className="text-[var(--slate-500)]">April cycle</p>
            </div>
            <div className="h-2 rounded-full bg-[var(--slate-100)]">
              <div className="h-2 w-[72.5%] rounded-full bg-[linear-gradient(90deg,#8b5cf6,#7c3aed)]" />
            </div>
            <p className="mt-2 text-xs text-[var(--slate-500)]">
              Projected to reach ~89% usage before renewal date.
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <p className="text-sm font-semibold text-[var(--slate-900)]">Plan Actions</p>
          <div className="mt-4 space-y-3">
            <button className="w-full rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-4 py-3 text-sm font-semibold text-[var(--slate-900)]">
              Upgrade Plan
            </button>
            <button className="w-full rounded-xl border border-[var(--slate-150)] bg-white/85 px-4 py-3 text-sm font-semibold text-[var(--slate-700)]">
              Manage Seats
            </button>
            <button className="w-full rounded-xl border border-[var(--slate-150)] bg-white/85 px-4 py-3 text-sm font-semibold text-[var(--slate-700)]">
              Download Last Invoice
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.08)] p-4">
            <p className="text-sm font-semibold text-[var(--amber-strong)]">Renewal Reminder</p>
            <p className="mt-1 text-xs leading-6 text-[var(--slate-600)]">
              Subscription renews in 14 days. Convex trigger dapat dipakai untuk kirim notifikasi
              in-app + email H-7 dan H-1.
            </p>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="p-5">
        <div className="flex flex-col gap-4 border-b border-[var(--slate-150)] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-[var(--slate-900)]">Billing History</p>
            <p className="mt-1 text-sm text-[var(--slate-500)]">
              Mock data untuk desain tabel invoice (source nantinya dari Convex query).
            </p>
          </div>
          <button className="rounded-xl border border-[var(--slate-150)] bg-white/85 px-4 py-2.5 text-sm font-semibold text-[var(--slate-700)]">
            Export CSV
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.12em] text-[var(--slate-500)]">
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['INV-2026-04', '01 Apr 2026', 'Rp 1.499.000', 'Paid', 'Visa **** 1024'],
                ['INV-2026-03', '01 Mar 2026', 'Rp 1.499.000', 'Paid', 'Visa **** 1024'],
                ['INV-2026-02', '01 Feb 2026', 'Rp 1.199.000', 'Paid', 'Bank Transfer'],
              ].map((row) => (
                <tr
                  key={row[0]}
                  className="border-t border-[var(--slate-150)] text-[var(--slate-700)]"
                >
                  <td className="px-3 py-3 font-semibold">{row[0]}</td>
                  <td className="px-3 py-3">{row[1]}</td>
                  <td className="px-3 py-3">{row[2]}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-[rgba(16,185,129,0.12)] px-2.5 py-1 text-xs font-semibold text-[var(--emerald-strong)]">
                      {row[3]}
                    </span>
                  </td>
                  <td className="px-3 py-3">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

export function ApprovalAnalyticsSection() {
  return (
    <div id="analytics" className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
      <GlassPanel className="p-5">
        <div className="rounded-[20px] bg-[linear-gradient(135deg,#16a34a_0%,#22c55e_100%)] px-5 py-4 text-[var(--slate-900)]">
          <h2 className="font-display text-4xl leading-[0.98]">Approval System</h2>
          <p className="mt-2 text-sm text-[var(--slate-900)]">
            Agency-client workflow dengan keputusan yang lebih cepat dan tetap terdokumentasi.
          </p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {approvalStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[var(--slate-150)] bg-white/75 px-4 py-5 text-center"
            >
              <p className="text-4xl font-semibold text-[var(--slate-900)]">{stat.value}</p>
              <p className="mt-1 text-sm text-[var(--slate-500)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5">
        <div className="rounded-[20px] bg-[linear-gradient(135deg,#7c3aed_0%,#a855f7_100%)] px-5 py-4 text-[var(--slate-900)]">
          <h2 className="font-display text-4xl leading-[0.98]">Analytics</h2>
          <p className="mt-2 text-sm text-[var(--slate-900)]">
            Performance metrics yang lebih siap dibaca untuk evaluasi campaign dan next move.
          </p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {analyticsSummary.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[var(--slate-150)] bg-white/75 p-4"
            >
              <p className="text-sm text-[var(--slate-500)]">{item.label}</p>
              <p className="mt-2 text-4xl font-semibold text-[var(--slate-900)]">{item.value}</p>
              <p className="mt-2 text-sm text-[var(--slate-500)]">{item.delta}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-4 rounded-2xl border border-[var(--slate-150)] bg-white/75 p-4">
          {platformPerformance.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm text-[var(--slate-600)]">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-3 rounded-full bg-[var(--slate-100)]">
                <div
                  className="h-3 rounded-full bg-[linear-gradient(90deg,#c084fc_0%,#9333ea_100%)]"
                  style={{ width: item.width }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
