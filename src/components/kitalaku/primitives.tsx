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
    <section id={id} className={cn("premium-glass rounded-2xl border border-[rgba(255,255,255,0.7)] shadow-[var(--shadow-card)]", className)}>
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
  return (
    <div className="grid min-h-screen md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[var(--slate-150)] bg-[rgba(255,255,255,0.78)] backdrop-blur-xl md:flex md:flex-col md:justify-between">
        <div>
          <div className="border-b border-[var(--slate-150)] px-6 py-7">
            <p className="text-2xl font-semibold tracking-tight text-[var(--slate-900)]">Kitalaku.in</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--purple-strong)]">Creative OS</p>
          </div>

          <nav className="space-y-1 px-4 py-5">
            {sideNav.map((item) => {
              const current = item.label === active;
              const icon =
                item.label === "Dashboard" ? <IconGrid /> : item.label === "AI Planner" ? <IconWand /> : item.label === "Scheduler" ? <IconCalendar /> : <IconAnalytics />;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
                    current ? "bg-[rgba(124,58,237,0.12)] text-[var(--purple-strong)] ring-1 ring-[rgba(124,58,237,0.22)]" : "text-[var(--slate-600)] hover:bg-[var(--slate-50)]",
                  )}
                >
                  {icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="m-4 rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[linear-gradient(145deg,rgba(124,58,237,0.09),rgba(255,255,255,0.65))] p-4">
          <p className="text-sm font-semibold text-[var(--slate-700)]">AI Quota</p>
          <p className="mt-1 text-xs text-[var(--slate-500)]">420 / 1000 tokens</p>
          <div className="mt-3 h-2 rounded-full bg-white/80">
            <div className="h-2 w-[42%] rounded-full bg-[linear-gradient(90deg,#8b5cf6,#7c3aed)]" />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-[var(--slate-150)] bg-[rgba(255,255,255,0.8)] px-4 py-4 backdrop-blur-xl md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-xl items-center gap-3 rounded-xl border border-[var(--slate-150)] bg-[rgba(248,250,252,0.92)] px-4 py-3 text-[var(--slate-500)] lg:w-[440px]">
            <IconSearch />
            <span className="text-sm">Search content, campaign, insight...</span>
          </div>

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <button className="relative rounded-full border border-[var(--slate-150)] bg-white/80 p-2 text-[var(--slate-600)]">
              <IconBell />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] text-sm font-semibold text-white">JD</div>
              <div>
                <p className="text-sm font-semibold text-[var(--slate-900)]">John Doe</p>
                <p className="text-xs text-[var(--slate-500)]">Admin • KennySoft</p>
              </div>
            </div>
          </div>
        </header>

        <main className="bg-[var(--background)] p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1180px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
