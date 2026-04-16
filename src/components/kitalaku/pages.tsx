import Link from "next/link";
import { AppShell, GlassPanel } from "./primitives";
import { ApprovalAnalyticsSection, CalendarSection, DashboardSection, PlannerSection } from "./sections";

function LandingNav() {
  return (
    <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between rounded-2xl border border-[rgba(255,255,255,0.7)] bg-[rgba(255,255,255,0.72)] px-5 py-4 backdrop-blur-xl">
      <p className="text-xl font-semibold tracking-tight text-[var(--slate-900)]">Kitalaku.in</p>
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded-lg border border-[var(--slate-150)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--slate-700)]">
          Login
        </Link>
        <Link href="/dashboard" className="rounded-lg bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-4 py-2 text-sm font-semibold text-white">
          Open Dashboard
        </Link>
      </div>
    </header>
  );
}

function LandingHero() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <section className="relative overflow-hidden rounded-3xl bg-[#111111] p-8 text-white shadow-[var(--shadow-elevated)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.45),transparent_38%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.22),transparent_34%)]" />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f3d27c]">AI CONTENT WORKSPACE</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight leading-[1.04] md:text-6xl">
            Kelola konten lebih cepat, rapi, dan tetap sesuai brand.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/78">
            Dari ide konten sampai approval klien, semua alur kerja ada di satu dashboard yang terhubung.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-6 py-3 text-sm font-semibold text-white">
              Masuk ke Workspace
            </Link>
            <Link href="/dashboard" className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white">
              Lihat Dashboard
            </Link>
          </div>
        </div>
      </section>

      <GlassPanel className="p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--amber-strong)]">Quick Access</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--slate-900)]">Masuk dan lanjutkan pekerjaan tim.</h2>
        <p className="mt-3 text-base text-[var(--slate-500)]">Akses role-based untuk Admin, Manager, Creator, dan Client.</p>
        <div className="mt-7 space-y-3">
          <div className="rounded-xl border border-[var(--slate-150)] bg-white/90 px-4 py-4 text-[var(--slate-400)]">admin@kitalaku.in</div>
          <div className="rounded-xl border border-[var(--slate-150)] bg-white/90 px-4 py-4 text-[var(--slate-400)]">Masukkan password</div>
          <div className="flex items-center justify-between rounded-xl border border-[var(--slate-150)] bg-white/90 px-4 py-4">
            <span className="text-sm text-[var(--slate-600)]">Admin session detected</span>
            <span className="rounded-full bg-[rgba(16,185,129,0.14)] px-3 py-1 text-xs font-semibold text-[var(--emerald-strong)]">Persistent Session</span>
          </div>
        </div>
        <Link href="/login" className="mt-5 block rounded-xl bg-[linear-gradient(135deg,#f59e0b,#d28a19)] px-5 py-4 text-center text-lg font-semibold text-[#1e293b]">
          Masuk ke Dashboard
        </Link>
      </GlassPanel>
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
            ["AI Planner", "Ide konten + draft caption dengan validasi manual."],
            ["Scheduler & Approval", "Status Draft, Review, Approved dalam satu board."],
            ["Analytics", "Pantau reach, engagement, dan performa platform."],
          ].map(([title, desc]) => (
            <GlassPanel key={title} className="p-5">
              <p className="text-lg font-semibold text-[var(--slate-900)]">{title}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--slate-600)]">{desc}</p>
            </GlassPanel>
          ))}
        </section>

        <GlassPanel className="flex flex-col items-center justify-between gap-4 p-6 text-center md:flex-row md:text-left">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-[var(--slate-900)]">Mulai kerja dari satu workspace yang terintegrasi.</p>
            <p className="mt-1 text-sm text-[var(--slate-500)]">Login untuk membuka planner, scheduler, approval, dan analytics.</p>
          </div>
          <Link href="/login" className="rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-6 py-3 text-sm font-semibold text-white">
            Go to Login
          </Link>
        </GlassPanel>
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
      <CalendarSection />
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

export function LoginPageDesign() {
  return (
    <div className="premium-background relative min-h-screen overflow-hidden px-4 py-8 md:px-6">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_60%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1180px] items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative hidden overflow-hidden rounded-[32px] bg-[#111111] p-8 text-white shadow-[var(--shadow-elevated)] lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.42),transparent_38%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.2),transparent_34%)]" />

            <div className="relative z-10">
              <Link href="/" className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                Kitalaku.in
              </Link>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3d27c]">Secure Workspace Access</p>
              <h1 className="mt-3 text-5xl font-semibold tracking-tight leading-[1.04]">
                Simplified sign in with the same premium feel.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-white/78">
                Access planner, scheduler, approvals, and analytics from one clean gateway designed to keep your team moving.
              </p>
            </div>

            <div className="relative z-10 grid gap-3 sm:grid-cols-3">
              {[
                ["4 Modules", "Planner, schedule, approval, analytics"],
                ["Role Based", "Admin, manager, creator, and client"],
                ["Persistent", "Secure session between workflow steps"],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
                  <p className="text-lg font-semibold">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mx-auto w-full max-w-[620px]">
            <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
              {["Role-based access", "Persistent session", "Premium workspace"].map((pill) => (
                <span key={pill} className="rounded-full border border-[rgba(219,227,238,0.88)] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[var(--slate-600)]">
                  {pill}
                </span>
              ))}
            </div>

            <GlassPanel className="relative overflow-hidden p-7 md:p-8">
              <div className="absolute right-0 top-0 h-36 w-36 bg-[radial-gradient(circle,rgba(139,92,246,0.14),transparent_68%)]" />

              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--purple-strong)]">Secure Access</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--slate-900)]">Sign in to Kitalaku.in</h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-[var(--slate-500)]">
                  Satu form yang lebih ringkas, lebih jelas, dan langsung mengarahkan user ke pekerjaan utamanya.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Protected", "Secure workspace"],
                    ["Fast access", "Persistent session"],
                    ["Team ready", "Role-aware entry"],
                  ].map(([title, desc]) => (
                    <div key={title} className="rounded-2xl border border-[rgba(219,227,238,0.88)] bg-white/72 px-4 py-3">
                      <p className="text-sm font-semibold text-[var(--slate-900)]">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--slate-500)]">{desc}</p>
                    </div>
                  ))}
                </div>

                <form className="mt-8 space-y-4">
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-[var(--slate-700)]">
                      Work email
                    </label>
                    <input
                      id="email"
                      type="email"
                      defaultValue="admin@kitalaku.in"
                      className="mt-2 w-full rounded-2xl border border-[var(--slate-150)] bg-white/82 px-4 py-3.5 text-sm text-[var(--slate-700)] outline-none ring-0 placeholder:text-[var(--slate-400)] focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="password" className="text-sm font-medium text-[var(--slate-700)]">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="mt-2 w-full rounded-2xl border border-[var(--slate-150)] bg-white/82 px-4 py-3.5 text-sm text-[var(--slate-700)] outline-none placeholder:text-[var(--slate-400)] focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="text-sm font-medium text-[var(--slate-700)]">
                        Role
                      </label>
                      <select
                        id="role"
                        defaultValue="Admin"
                        className="mt-2 w-full rounded-2xl border border-[var(--slate-150)] bg-white/82 px-4 py-3.5 text-sm text-[var(--slate-700)] outline-none focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]"
                      >
                        <option>Admin</option>
                        <option>Manager</option>
                        <option>Creator</option>
                        <option>Client</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 text-sm text-[var(--slate-500)] sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-[var(--slate-150)] accent-[var(--purple)]" />
                      <span>Keep me signed in</span>
                    </label>
                    <Link href="/" className="font-semibold text-[var(--purple-strong)]">
                      Back to landing page
                    </Link>
                  </div>
                </form>

                <button
                  type="button"
                  className="mt-6 w-full rounded-2xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-5 py-4 text-base font-semibold text-white shadow-[var(--shadow-soft)]"
                >
                  Secure Sign In
                </button>

                <div className="mt-4 rounded-2xl border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.08)] px-4 py-3 text-sm leading-6 text-[var(--emerald-strong)]">
                  Session akan tetap aktif saat user berpindah dari planner ke scheduler atau approval.
                </div>

                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[rgba(219,227,238,0.88)] bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--slate-900)]">Need a quick UI preview?</p>
                    <p className="mt-1 text-sm text-[var(--slate-500)]">Open the dashboard directly to review the new information hierarchy.</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-xl border border-[rgba(219,227,238,0.88)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--slate-700)]"
                  >
                    Open Dashboard
                  </Link>
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SimplePlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <AppShell active="Dashboard">
      <GlassPanel className="p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--purple-strong)]">Supporting page</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--slate-900)]">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--slate-600)]">{description}</p>
      </GlassPanel>
    </AppShell>
  );
}
