'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useAction, useMutation, useConvexAuth } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { sideNav, StatusTone } from './data';
import {
  IconAnalytics,
  IconCalendar,
  IconCheck,
  IconCopy,
  IconGrid,
  IconThumb,
  IconWand,
} from './icons';
import { AnalyticsDashboard } from './analytics-dashboard';
import { cn, GlassPanel, toneDot, toneSurface } from './primitives';

export function DashboardSection() {
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const stats = useQuery(
    api.drafts.getDashboardStats,
    currentUser?.agencyId ? { agencyId: currentUser.agencyId } : 'skip',
  );

  const agencyDrafts =
    useQuery(
      api.drafts.getDraftsByAgency,
      currentUser?.agencyId ? { agencyId: currentUser.agencyId } : 'skip',
    ) || [];

  const notifications = useQuery(api.notifications.getNotifications) || [];

  const latestDrafts = [...agencyDrafts]
    .sort((a, b) => b._creationTime - a._creationTime)
    .slice(0, 3);

  const contentStatusReal = [
    { label: 'Draft', value: stats?.draft.toString() || '0', tone: 'draft' as StatusTone },
    { label: 'Review', value: stats?.review.toString() || '0', tone: 'review' as StatusTone },
    { label: 'Approved', value: stats?.approved.toString() || '0', tone: 'approved' as StatusTone },
  ];

  const dashboardMetricsReal = [
    {
      label: 'Total Content',
      value: stats?.total.toString() || '0',
      note: 'All-time production',
      tone: 'purple',
    },
    {
      label: 'Pending Review',
      value: stats?.review.toString() || '0',
      note: 'Needs attention',
      tone: 'amber',
    },
    {
      label: 'Approved',
      value: stats?.approved.toString() || '0',
      note: 'Ready to publish',
      tone: 'green',
    },
    { label: 'AI Credits', value: 'Balanced', note: 'Healthy quota', tone: 'purple' },
  ];

  const totalItems = stats?.total || 0;

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

  const focusItems = latestDrafts.map((d) => ({
    title: d.content.substring(0, 40).replace(/<[^>]*>/g, '') + '...',
    detail: `Awaiting ${d.status} processing.`,
    href: '/dashboard/planner',
    tone: d.status.toLowerCase() as StatusTone,
  }));

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
              {stats && (
                <>
                  <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-[var(--slate-900)]">
                    {stats.review} pending review
                  </span>
                  <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-[var(--slate-900)]">
                    {stats.approved} approved
                  </span>
                </>
              )}
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
                {focusItems.length === 0
                  ? 'No priorities'
                  : focusItems.length === 1
                    ? 'One priority'
                    : `${focusItems.length} priorities`}
              </h2>
            </div>
            <span className="rounded-full bg-[var(--slate-100)] px-3 py-1 text-xs font-semibold text-[var(--slate-500)]">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {focusItems.length === 0 ? (
              <p className="text-sm text-[var(--slate-400)] italic p-4">
                No drafts to focus on yet. Open the AI Planner to get started.
              </p>
            ) : (
              focusItems.map((item, index) => (
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
                        <p className="text-sm font-semibold text-[var(--slate-900)]">
                          {item.title}
                        </p>
                        <span
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
                            toneSurface(item.tone),
                          )}
                        >
                          {item.tone}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--slate-500)]">
                        {item.detail}
                      </p>
                      <Link
                        href={item.href}
                        className="mt-3 inline-flex text-xs font-semibold text-[var(--slate-900)]"
                      >
                        Open module
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
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
        {dashboardMetricsReal.map((metric) => (
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
            {contentStatusReal.map((item) => (
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
            {notifications.length === 0 ? (
              <p className="text-sm text-[var(--slate-400)] italic p-4">No recent activity.</p>
            ) : (
              notifications.slice(0, 4).map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-[rgba(219,227,238,0.88)] bg-white/74 px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn('mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--purple-strong)]')}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-[var(--slate-800)]">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[var(--slate-500)]">
                            {item.message}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--slate-100)] px-3 py-1 text-[11px] font-semibold text-[var(--slate-500)]">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

export function SubscriptionSection() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const agency = useQuery(
    api.agencies.getAgency,
    currentUser?.agencyId ? { agencyId: currentUser.agencyId } : 'skip',
  );

  const quota = agency?.tokenQuotaRemaining || 0;
  const usagePercent = Math.round(((1000 - quota) / 1000) * 100);

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
              [
                'AI Credits',
                `${quota.toLocaleString()} / 1,000`,
                `${100 - usagePercent}% remaining`,
              ],
              ['Seats', '1 / 5', '4 seats available'],
              ['Storage', '0 GB / 10 GB', 'Plenty of room'],
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
              <div
                className="h-2 rounded-full bg-[linear-gradient(90deg,#8b5cf6,#7c3aed)]"
                style={{ width: `${100 - usagePercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--slate-500)]">
              {quota > 200
                ? 'Healthy credit balance for current sprint.'
                : 'Consider upgrading soon to maintain production speed.'}
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
  return <AnalyticsDashboard />;
}

export function ProfileSection() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const agency = useQuery(
    api.agencies.getAgency,
    currentUser?.agencyId ? { agencyId: currentUser.agencyId } : 'skip',
  );

  const [name, setName] = useState(currentUser?.name || '');
  const updateUser = useMutation(api.users.updateUser);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !name) return;
    await updateUser({
      tokenIdentifier: currentUser.tokenIdentifier,
      email: currentUser.email,
      name: name,
    });
    alert('Profile updated');
  };

  return (
    <div className="space-y-6">
      <GlassPanel className="p-8">
        <h2 className="text-2xl font-semibold text-[var(--slate-900)]">Personal Identity</h2>
        <p className="mt-1 text-sm text-[var(--slate-500)]">
          Manage your account details and role.
        </p>

        <form onSubmit={handleUpdate} className="mt-8 max-w-md space-y-6">
          <div>
            <label className="text-sm font-semibold text-[var(--slate-700)]">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[var(--purple-border)]"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--slate-700)]">Email</label>
            <input
              type="text"
              disabled
              value={currentUser?.email || ''}
              className="mt-2 w-full rounded-2xl border border-[var(--slate-100)] bg-[var(--slate-50)] px-4 py-3 text-sm font-medium text-[var(--slate-500)]"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--slate-700)]">Role</label>
            <div className="mt-2 inline-flex rounded-full bg-[var(--purple-soft)] px-4 py-2 text-sm font-semibold text-[var(--slate-900)]">
              {currentUser?.role}
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-[var(--slate-900)] py-4 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
          >
            Save Changes
          </button>
        </form>
      </GlassPanel>

      <GlassPanel className="p-8">
        <h2 className="text-2xl font-semibold text-[var(--slate-900)]">Workspace Identity</h2>
        <p className="mt-1 text-sm text-[var(--slate-500)]">Details of the agency you belong to.</p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-[var(--slate-150)] bg-white/70 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--slate-500)]">
                Agency Name
              </p>
              <p className="mt-1 font-semibold text-[var(--slate-900)]">
                {agency?.name || 'Loading...'}
              </p>
            </div>
            <Link href="/settings" className="text-sm font-semibold text-[var(--purple-strong)]">
              Manage
            </Link>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
