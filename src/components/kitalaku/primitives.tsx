import Link from "next/link";
import { sideNav, type StatusTone } from "./data";
import { IconAnalytics, IconBell, IconCalendar, IconGrid, IconSearch, IconWand } from "./icons";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function toneDot(tone: StatusTone) {
  if (tone === "approved") return "bg-[var(--emerald)]";
  if (tone === "review") return "bg-[var(--purple)]";
  return "bg-[var(--amber)]";
}

export function toneSurface(tone: StatusTone) {
  if (tone === "approved") return "bg-[var(--emerald-soft)] text-[var(--emerald-strong)] border-[rgba(16,185,129,0.18)]";
  if (tone === "review") return "bg-[rgba(124,58,237,0.09)] text-[var(--purple-strong)] border-[rgba(124,58,237,0.14)]";
  return "bg-[var(--amber-soft)] text-[var(--amber-strong)] border-[rgba(245,158,11,0.18)]";
}

export function GlassPanel({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "premium-glass rounded-[24px] border border-[rgba(255,255,255,0.72)] shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function AppShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const pageDescriptions: Record<string, string> = {
    Dashboard: "Monitor priorities, approvals, and performance without leaving the workspace.",
    "AI Planner": "Generate strategic content directions, then refine them before review.",
    Scheduler: "Keep publishing timelines visible so the team can move faster with less back-and-forth.",
    "Approval & Analytics": "Track approvals and campaign performance in one decision-ready view.",
  };

  const activeDescription = pageDescriptions[active] ?? "Move work forward from one calm workspace.";

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[rgba(219,227,238,0.88)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.68))] backdrop-blur-2xl md:flex md:flex-col md:justify-between">
        <div className="px-5 py-5">
          <GlassPanel className="p-5">
            <p className="text-2xl font-semibold tracking-tight text-[var(--slate-900)]">Kitalaku.in</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--purple-strong)]">Creative OS</p>
            <p className="mt-4 text-sm leading-6 text-[var(--slate-600)]">
              Planner, scheduler, approval, and analytics in one premium workspace.
            </p>
          </GlassPanel>

          <div className="mt-6 px-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slate-400)]">Navigation</p>
          </div>

          <nav className="mt-3 space-y-1">
            {sideNav.map((item) => {
              const current = item.label === active;
              const icon =
                item.label === "Dashboard" ? (
                  <IconGrid />
                ) : item.label === "AI Planner" ? (
                  <IconWand />
                ) : item.label === "Scheduler" ? (
                  <IconCalendar />
                ) : (
                  <IconAnalytics />
                );

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium",
                    current
                      ? "bg-[linear-gradient(135deg,rgba(124,58,237,0.14),rgba(255,255,255,0.8))] text-[var(--purple-strong)] ring-1 ring-[rgba(124,58,237,0.18)]"
                      : "text-[var(--slate-600)] hover:bg-white/75",
                  )}
                >
                  {icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-5 pb-5">
          <GlassPanel className="border-[rgba(124,58,237,0.16)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--slate-700)]">AI Quota</p>
                <p className="mt-1 text-xs text-[var(--slate-500)]">420 / 1000 credits used</p>
              </div>
              <span className="rounded-full bg-[rgba(16,185,129,0.12)] px-2.5 py-1 text-xs font-semibold text-[var(--emerald-strong)]">
                Healthy
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/85">
              <div className="h-2 w-[42%] rounded-full bg-[linear-gradient(90deg,#8b5cf6,#7c3aed)]" />
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--slate-500)]">
              Sufficient credit balance to keep draft generation and review workflows running today.
            </p>
          </GlassPanel>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[rgba(219,227,238,0.88)] bg-[rgba(248,250,252,0.78)] backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--purple-strong)]">Workspace Overview</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--slate-900)]">{active}</p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--slate-500)]">{activeDescription}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl border border-[rgba(219,227,238,0.88)] bg-white/82 px-4 py-3 text-left text-[var(--slate-500)] shadow-[0_10px_20px_rgba(30,41,59,0.05)] sm:w-[340px]"
                >
                  <IconSearch />
                  <span className="flex-1 text-sm">Search content, campaigns, or insights...</span>
                  <span className="rounded-lg bg-[var(--slate-100)] px-2 py-1 text-[10px] font-semibold text-[var(--slate-400)]">/</span>
                </button>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="relative rounded-2xl border border-[rgba(219,227,238,0.88)] bg-white/82 p-3 text-[var(--slate-600)] shadow-[0_10px_20px_rgba(30,41,59,0.05)]"
                  >
                    <IconBell />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                  </button>

                  <div className="flex items-center gap-3 rounded-2xl border border-[rgba(219,227,238,0.88)] bg-white/82 px-3 py-2.5 shadow-[0_10px_20px_rgba(30,41,59,0.05)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] text-sm font-semibold text-white">
                      JD
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--slate-900)]">John Doe</p>
                      <p className="text-xs text-[var(--slate-500)]">Admin / KennySoft</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
              {sideNav.map((item) => {
                const current = item.label === active;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium",
                      current
                        ? "border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.12)] text-[var(--purple-strong)]"
                        : "border-[rgba(219,227,238,0.88)] bg-white/75 text-[var(--slate-600)]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        <main className="bg-[var(--background)] p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1240px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
