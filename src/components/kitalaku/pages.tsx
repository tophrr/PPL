'use client';

import Link from 'next/link';
import { SignInButton, SignOutButton, useAuth, UserButton, SignIn } from '@clerk/nextjs';
import { Authenticated, Unauthenticated } from 'convex/react';
import { AppShell } from './app-shell';
import { GlassPanel } from './primitives';
import { ApprovalAnalyticsSection, DashboardSection, ProfileSection } from './sections';
import { PlannerSection } from './planner-section';
import { SchedulerSection } from './scheduler-section';

function LandingNav() {
  const { isSignedIn } = useAuth();
  return (
    <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between rounded-2xl border border-[rgba(255,255,255,0.7)] bg-[rgba(255,255,255,0.72)] px-5 py-4 backdrop-blur-xl">
      <p className="font-display text-2xl leading-[0.95] text-[var(--slate-900)]">Kitalaku.in</p>
      <div className="flex items-center gap-3">
        <Unauthenticated>
          <SignInButton mode="modal">
            <button className="rounded-lg border border-[var(--slate-150)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--slate-700)] hover:bg-white transition-all">
              Login
            </button>
          </SignInButton>
        </Unauthenticated>

        <Authenticated>
          <SignOutButton>
            <button className="rounded-lg border border-[var(--slate-150)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--slate-700)] hover:bg-white transition-all">
              Logout
            </button>
          </SignOutButton>
          <Link
            href="/dashboard"
            className="rounded-lg bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
          >
            Open Dashboard
          </Link>
          <UserButton afterSignOutUrl="/" />
        </Authenticated>

        <Unauthenticated>
          <Link
            href="/dashboard"
            className="rounded-lg bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
          >
            Try Demo
          </Link>
        </Unauthenticated>
      </div>
    </header>
  );
}

function LandingHero() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <section className="relative overflow-hidden rounded-[36px] bg-[#FFFFFF] p-8 text-[var(--slate-900)] shadow-[var(--shadow-premium)] md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.45),transparent_38%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_52%)]" />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--slate-700)]">
            AI CONTENT WORKSPACE
          </p>
          <h1 className="font-display mt-4 max-w-4xl text-3xl leading-[1.06] text-[var(--slate-900)] md:text-6xl">
            Workflow konten yang terasa tenang, tajam, dan siap dipakai tim harian.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--slate-700)]">
            Kitalaku.in merangkum brief, drafting, approval, dan analytics ke dalam satu ruang kerja
            yang bersih, premium, dan tetap praktis untuk agensi maupun brand in-house.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Unauthenticated>
              <SignInButton mode="modal">
                <button className="rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-8 py-4 text-lg font-semibold text-white shadow-lg hover:opacity-90 transition-all">
                  Mulai Sekarang
                </button>
              </SignInButton>
            </Unauthenticated>
            <Link
              href="/dashboard"
              className="rounded-xl border border-[var(--slate-200)] bg-white/50 px-8 py-4 text-lg font-semibold text-[var(--slate-700)] hover:bg-white transition-all"
            >
              Jelajahi dashboard
            </Link>
          </div>
        </div>
      </section>

      <Unauthenticated>
        <div className="flex items-center justify-center">
          <SignIn
            routing="hash"
            appearance={{
              elements: {
                rootBox: 'w-full h-full',
                card: 'shadow-none border-none bg-transparent w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                footer: 'hidden',
              },
            }}
          />
        </div>
      </Unauthenticated>

      <Authenticated>
        <GlassPanel className="p-8 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--purple-soft)] flex items-center justify-center mb-6">
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { userButtonAvatarBox: 'w-16 h-16' } }}
            />
          </div>
          <h2 className="font-display text-3xl leading-[1.08] text-[var(--slate-900)] md:text-4xl">
            Selamat datang kembali!
          </h2>
          <p className="mt-4 text-base leading-7 text-[var(--slate-500)] max-w-sm">
            Workspace Anda sudah siap. Lanjutkan pekerjaan kreatif Anda hari ini.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 block w-full rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-5 py-4 text-center text-lg font-semibold text-white shadow-md hover:opacity-90 transition-all"
          >
            Buka Dashboard
          </Link>
        </GlassPanel>
      </Authenticated>
    </div>
  );
}

export function LandingPageDesign() {
  return (
    <div className="premium-background min-h-screen px-4 py-6 md:px-6 lg:px-10">
      <div className="mx-auto max-w-[1080px] space-y-8">
        <LandingNav />
        <LandingHero />

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['AI Planner', 'Ide konten + draft caption dengan validasi manual.'],
            ['Scheduler & Approval', 'Status Draft, Review, Approved dalam satu board.'],
            ['Analytics', 'Pantau reach, engagement, dan performa platform.'],
          ].map(([title, desc]) => (
            <GlassPanel key={title} className="p-5">
              <p className="font-display text-2xl leading-[1] text-[var(--slate-900)]">{title}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--slate-600)]">{desc}</p>
            </GlassPanel>
          ))}
        </section>

        <Unauthenticated>
          <GlassPanel className="flex flex-col items-center justify-between gap-4 p-6 text-center md:flex-row md:text-left">
            <div>
              <p className="font-display text-3xl leading-[0.98] text-[var(--slate-900)]">
                Mulai kerja dari satu workspace yang terintegrasi.
              </p>
              <p className="mt-1 text-sm text-[var(--slate-500)]">
                Login untuk membuka planner, scheduler, approval, dan analytics.
              </p>
            </div>
            <SignInButton mode="modal">
              <button className="rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all">
                Login ke Kitalaku
              </button>
            </SignInButton>
          </GlassPanel>
        </Unauthenticated>
      </div>
    </div>
  );
}

export function DashboardPageDesign() {
  return (
    <AppShell active="Dashboard">
      <DashboardSection />
    </AppShell>
  );
}

export function PlannerPageDesign() {
  return (
    <AppShell active="AI Planner">
      <PlannerSection />
    </AppShell>
  );
}

export function SchedulerPageDesign() {
  return (
    <AppShell active="Scheduler">
      <SchedulerSection />
    </AppShell>
  );
}

export function ApprovalAnalyticsPageDesign() {
  return (
    <AppShell active="Approval & Analytics">
      <ApprovalAnalyticsSection />
    </AppShell>
  );
}

export function SubscriptionPageDesign() {
  return (
    <AppShell active="Subscription">
      <SubscriptionSection />
    </AppShell>
  );
}

export function ProfilePageDesign() {
  return (
    <AppShell active="Profile">
      <ProfileSection />
    </AppShell>
  );
}

export function LoginPageDesign({
  children,
  title,
  subtitle,
}: {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="premium-background relative min-h-screen overflow-hidden px-4 py-8 md:px-6">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_60%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1180px] items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative hidden overflow-hidden rounded-[32px] bg-[#FFFFFF] p-8 text-[var(--slate-900)] shadow-[var(--shadow-elevated)] lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.42),transparent_38%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.2),transparent_34%)]" />

            <div className="relative z-10">
              <Link
                href="/"
                className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--slate-700)]"
              >
                Kitalaku.in
              </Link>
              <h1 className="font-display mt-4 text-5xl leading-[0.98] text-[var(--slate-900)]">
                Masuk ke workspace
              </h1>
            </div>
          </section>

          <div className="mx-auto w-full max-w-[620px]">
            <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
              {['Role-based access', 'Persistent session', 'Premium workspace'].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-[rgba(219,227,238,0.88)] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[var(--slate-600)]"
                >
                  {pill}
                </span>
              ))}
            </div>

            <GlassPanel className="relative overflow-hidden p-7 md:p-8">
              <div className="absolute right-0 top-0 h-36 w-36 bg-[radial-gradient(circle,rgba(139,92,246,0.14),transparent_68%)]" />

              <div className="relative z-10">
                <div className="mt-8 flex justify-center w-full">{children}</div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SimplePlaceholderPage({
  active,
  title,
  description,
}: {
  active: string;
  title: string;
  description: string;
}) {
  return (
    <AppShell active={active}>
      <GlassPanel className="p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--slate-700)]">
          Supporting page
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--slate-900)]">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--slate-600)]">{description}</p>
      </GlassPanel>
    </AppShell>
  );
}
