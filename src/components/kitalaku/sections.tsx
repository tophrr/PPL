import { activities, analyticsSummary, approvalStats, calendarColumns, captionDrafts, contentStatus, dashboardMetrics, plannerTopics, platformPerformance } from "./data";
import { IconAnalytics, IconCopy, IconThumb, IconWand } from "./icons";
import { cn, GlassPanel, toneDot, toneSurface } from "./primitives";

export function DashboardSection() {
  return (
    <div className="space-y-5">
      <GlassPanel className="relative overflow-hidden border-[rgba(124,58,237,0.2)] p-6">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.24),transparent_68%)]" />
        <div className="absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18),transparent_68%)]" />
        <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--purple-strong)]">Command Center</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[var(--slate-900)]">Welcome back, John!</h1>
            <p className="mt-2 text-sm text-[var(--slate-500)]">Monitor campaign health, generate drafts, and move items to approval faster.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["SLA 96%", "12 Pending Review", "420 AI Credits Used"].map((pill) => (
                <span key={pill} className="rounded-full border border-[var(--slate-150)] bg-white/85 px-3 py-1 text-xs font-medium text-[var(--slate-600)]">
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full rounded-2xl border border-[rgba(255,255,255,0.85)] bg-white/80 p-4 xl:w-[360px]">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--slate-700)]">Weekly engagement trend</span>
              <span className="font-semibold text-[var(--emerald-strong)]">+24%</span>
            </div>
            <div className="mt-4 flex h-20 items-end gap-2">
              {[34, 45, 41, 60, 56, 68, 72].map((h, i) => (
                <div key={i} className="flex-1">
                  <div className="w-full rounded-t-md bg-[linear-gradient(180deg,#c4b5fd,#8b5cf6)]" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassPanel>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--slate-900)]">Performance Snapshot</h2>
          <p className="mt-1 text-sm text-[var(--slate-500)]">Real-time metrics across planner, scheduler, and approvals.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)]">
          <IconWand />
          <span>Create AI Draft</span>
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <GlassPanel key={metric.label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--slate-500)]">{metric.label}</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--slate-900)]">{metric.value}</p>
                <p className={cn("mt-2 text-xs font-medium", metric.tone === "green" ? "text-[var(--emerald-strong)]" : metric.tone === "amber" ? "text-[var(--amber-strong)]" : "text-[var(--slate-500)]")}>
                  {metric.note}
                </p>
              </div>
              <div className={cn("rounded-xl p-2", metric.tone === "green" ? "bg-[var(--emerald-soft)] text-[var(--emerald-strong)]" : metric.tone === "amber" ? "bg-[var(--amber-soft)] text-[var(--amber-strong)]" : "bg-[var(--purple-soft)] text-[var(--purple-strong)]")}>
                <IconAnalytics />
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold text-[var(--slate-900)]">Content Status</h2>
          <div className="mt-5 space-y-3">
            {contentStatus.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className={cn("h-2.5 w-2.5 rounded-full", toneDot(item.tone))} />
                  <span className="text-sm font-medium text-[var(--slate-700)]">{item.label}</span>
                </div>
                <span className="text-2xl font-semibold text-[var(--slate-900)]">{item.value}</span>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold text-[var(--slate-900)]">Recent Activity</h2>
          <div className="mt-5 space-y-3">
            {activities.map((item) => (
              <div key={item.title} className="rounded-xl bg-white/70 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className={cn("mt-1.5 h-2.5 w-2.5 rounded-full", item.color)} />
                  <div>
                    <p className="text-sm font-medium text-[var(--slate-800)]">{item.title}</p>
                    <p className="mt-1 text-sm text-[var(--slate-500)]">{item.detail}</p>
                    <p className="mt-1 text-xs text-[var(--slate-400)]">{item.time}</p>
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
      <GlassPanel className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[var(--purple-soft)] p-2 text-[var(--purple-strong)]">
            <IconWand />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--slate-900)]">AI Content Planner</h2>
            <p className="mt-1 text-sm text-[var(--slate-500)]">Generate strategic topics and drafts with manual edit workflow.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <label className="text-sm font-medium text-[var(--slate-700)]">Keywords, Topics, or Industry</label>
            <div className="mt-2 rounded-xl border border-[var(--slate-150)] bg-white/80 px-4 py-3 text-sm text-[var(--slate-400)]">
              e.g., AI automation, social growth, digital campaign...
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--slate-700)]">Industry</label>
            <div className="mt-2 rounded-xl border border-[var(--slate-150)] bg-white/80 px-4 py-3 text-sm text-[var(--slate-600)]">All Industries</div>
          </div>
        </div>

        <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-5 py-3 text-sm font-semibold text-white">
          <IconWand />
          <span>Generate AI Content</span>
        </button>
      </GlassPanel>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--slate-900)]">AI-Generated Content</h3>
              <p className="mt-1 text-sm text-[var(--emerald-strong)]">Trending Topics</p>
            </div>
            <button className="text-sm font-medium text-[var(--purple-strong)]">Refresh</button>
          </div>
          <div className="mt-4 space-y-3">
            {plannerTopics.map((topic) => (
              <article key={topic.title} className="rounded-xl border border-[rgba(16,185,129,0.16)] bg-[rgba(16,185,129,0.08)] px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-[var(--slate-900)]">{topic.title}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-[var(--slate-500)]">
                      <span className="rounded-full bg-white px-2 py-1">{topic.tag}</span>
                      <span>Relevance: {topic.score}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--emerald-strong)]">{topic.lift}</span>
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
            <div className="rounded-lg border border-[var(--slate-150)] bg-white/70 px-3 py-2 text-sm text-[var(--slate-700)]">Platform: Instagram</div>
            <div className="rounded-lg border border-[var(--slate-150)] bg-white/70 px-3 py-2 text-sm text-[var(--slate-700)]">Tone: Professional</div>
          </div>
          <div className="mt-4 h-48 rounded-xl border border-[var(--slate-150)] bg-white/75 px-4 py-4 text-sm text-[var(--slate-400)]">Edit AI draft here before submit to review...</div>
          <div className="mt-4 rounded-xl border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.08)] p-3 text-xs text-[var(--amber-strong)]">Human-in-the-loop validation required before approval.</div>
        </GlassPanel>
      </div>

      <GlassPanel className="p-5">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--slate-900)]">
          <IconWand />
          <span>Social Media Caption Drafts</span>
        </h3>
        <div className="mt-5 space-y-5">
          {captionDrafts.map((draft) => (
            <article key={draft.platform} className="rounded-2xl border border-[var(--slate-150)] bg-white/80 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <span className="inline-flex w-fit rounded-full bg-[var(--purple-soft)] px-4 py-2 text-sm font-semibold text-[var(--purple-strong)]">{draft.platform}</span>
                <span className="text-sm text-[var(--slate-500)]">{draft.tone}</span>
              </div>
              <p className="mt-4 text-lg leading-9 text-[var(--slate-700)]">{draft.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {draft.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-[rgba(124,58,237,0.08)] px-3 py-2 text-sm font-medium text-[var(--purple-strong)]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[var(--slate-150)] pt-4 text-[var(--purple-strong)]">
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
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const eventToneClass = {
    draft: "border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.1)] text-[var(--amber-strong)]",
    review: "border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.1)] text-[var(--purple-strong)]",
    approved: "border-[rgba(16,185,129,0.18)] bg-[rgba(16,185,129,0.1)] text-[var(--emerald-strong)]",
  } as const;

  const scheduledItemsByDay: Record<
    number,
    Array<{ time: string; title: string; platform: string; tone: "draft" | "review" | "approved" }>
  > = {
    2: [
      { time: "09:30", title: "Product teaser carousel", platform: "IG", tone: "draft" },
      { time: "15:00", title: "Weekly market recap", platform: "LN", tone: "review" },
    ],
    5: [{ time: "11:00", title: "Stories sequence draft", platform: "IG", tone: "draft" }],
    8: [{ time: "10:30", title: "Customer success short video", platform: "YT", tone: "review" }],
    12: [
      { time: "08:45", title: "Newsletter final approval", platform: "EM", tone: "approved" },
      { time: "13:00", title: "Campaign launch reminder", platform: "IG", tone: "approved" },
    ],
    16: [{ time: "14:00", title: "Community engagement post", platform: "FB", tone: "review" }],
    21: [{ time: "10:00", title: "Feature update thread", platform: "X", tone: "draft" }],
    24: [{ time: "09:00", title: "Ramadan promo highlight", platform: "TT", tone: "approved" }],
    27: [{ time: "16:00", title: "Creator spotlight reel", platform: "IG", tone: "review" }],
  };

  const monthDays = [
    { key: "prev-30", day: 30, inMonth: false },
    { key: "prev-31", day: 31, inMonth: false },
    ...Array.from({ length: 30 }, (_, index) => ({ key: `apr-${index + 1}`, day: index + 1, inMonth: true })),
    { key: "next-1", day: 1, inMonth: false },
    { key: "next-2", day: 2, inMonth: false },
    { key: "next-3", day: 3, inMonth: false },
  ];

  return (
    <div id="calendar" className="space-y-5">
      <GlassPanel className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--slate-900)]">Scheduler Board</h2>
            <p className="mt-1 text-sm text-[var(--slate-500)]">Manage visual timeline from draft to approved.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl border border-[var(--slate-150)] bg-white/80 px-4 py-2.5 text-sm font-medium text-[var(--slate-700)]">Filter</button>
            <a href="#scheduler-calendar" className="rounded-xl border border-[var(--slate-150)] bg-white/80 px-4 py-2.5 text-sm font-medium text-[var(--slate-700)]">
              Calendar View
            </a>
            <button className="rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-4 py-2.5 text-sm font-semibold text-white">+ New Content</button>
          </div>
        </div>
      </GlassPanel>

      <div id="scheduler-board" className="grid gap-4 xl:grid-cols-3">
        {calendarColumns.map((column) => (
          <GlassPanel key={column.title} className="p-4">
            <div className="flex items-center justify-between border-b border-[var(--slate-150)] pb-4">
              <div className="flex items-center gap-3">
                <span className={cn("h-2.5 w-2.5 rounded-full", toneDot(column.tone))} />
                <div>
                  <p className="text-2xl font-semibold text-[var(--slate-900)]">{column.title}</p>
                  <p className="text-xs text-[var(--slate-500)]">{column.count} items</p>
                </div>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", toneSurface(column.tone))}>{column.count}</span>
            </div>

            <div className="mt-4 space-y-4">
              {column.cards.map((card) => (
                <article key={card.title} className="rounded-2xl border border-[var(--slate-150)] bg-white/80 p-3">
                  <div className="flex h-28 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f8fafc,#ede9fe)] text-xs font-semibold text-[var(--slate-500)]">{card.title}</div>
                  <h3 className="mt-3 text-sm font-semibold leading-6 text-[var(--slate-800)]">{card.title}</h3>
                  <span className="mt-2 inline-flex rounded-full bg-[rgba(124,58,237,0.08)] px-2 py-1 text-xs font-medium text-[var(--purple-strong)]">{card.brand}</span>
                  <div className="mt-3 flex items-center justify-between text-xs text-[var(--slate-500)]">
                    <span>{card.meta}</span>
                    <span className="rounded-full bg-[var(--slate-100)] px-2 py-1">{card.platform}</span>
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
            <h3 className="text-2xl font-semibold tracking-tight text-[var(--slate-900)]">Calendar View</h3>
            <p className="mt-1 text-sm text-[var(--slate-500)]">April 2026 schedule across draft, review, and approved timelines.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded-full border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.09)] px-3 py-1 text-[var(--amber-strong)]">Draft</span>
            <span className="rounded-full border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.09)] px-3 py-1 text-[var(--purple-strong)]">Review</span>
            <span className="rounded-full border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.09)] px-3 py-1 text-[var(--emerald-strong)]">Approved</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto pb-1">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-7 gap-2">
              {weekdayLabels.map((label) => (
                <p key={label} className="rounded-lg bg-[var(--slate-100)] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[var(--slate-500)]">
                  {label}
                </p>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {monthDays.map((day) => {
                const events = day.inMonth ? scheduledItemsByDay[day.day] ?? [] : [];

                return (
                  <article
                    key={day.key}
                    className={cn(
                      "min-h-[140px] rounded-xl border border-[var(--slate-150)] bg-white/70 p-3",
                      day.inMonth ? "" : "opacity-55",
                      day.day === 16 && day.inMonth && "ring-1 ring-[rgba(124,58,237,0.25)]",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-semibold", day.inMonth ? "text-[var(--slate-800)]" : "text-[var(--slate-400)]")}>{day.day}</p>
                      {day.day === 16 && day.inMonth ? <span className="rounded-full bg-[rgba(124,58,237,0.12)] px-2 py-1 text-[10px] font-semibold text-[var(--purple-strong)]">Today</span> : null}
                    </div>

                    <div className="mt-2 space-y-2">
                      {events.length === 0 ? (
                        <p className="text-xs text-[var(--slate-400)]">No schedule</p>
                      ) : (
                        events.map((event) => (
                          <div key={`${day.key}-${event.time}-${event.title}`} className={cn("rounded-lg border px-2 py-2", eventToneClass[event.tone])}>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em]">{event.time}</p>
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

export function ApprovalAnalyticsSection() {
  return (
    <div id="analytics" className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
      <GlassPanel className="p-5">
        <div className="rounded-[20px] bg-[linear-gradient(135deg,#16a34a_0%,#22c55e_100%)] px-5 py-4 text-white">
          <h2 className="text-3xl font-semibold tracking-tight">Approval System</h2>
          <p className="mt-1 text-sm text-white/85">Agency-Client Workflow</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {approvalStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[var(--slate-150)] bg-white/75 px-4 py-5 text-center">
              <p className="text-4xl font-semibold text-[var(--slate-900)]">{stat.value}</p>
              <p className="mt-1 text-sm text-[var(--slate-500)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5">
        <div className="rounded-[20px] bg-[linear-gradient(135deg,#7c3aed_0%,#a855f7_100%)] px-5 py-4 text-white">
          <h2 className="text-3xl font-semibold tracking-tight">Analytics</h2>
          <p className="mt-1 text-sm text-white/85">Performance Metrics</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {analyticsSummary.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[var(--slate-150)] bg-white/75 p-4">
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
                <div className="h-3 rounded-full bg-[linear-gradient(90deg,#c084fc_0%,#9333ea_100%)]" style={{ width: item.width }} />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
