export type StatusTone = "draft" | "review" | "approved";

export const sideNav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "AI Planner", href: "/dashboard/planner" },
  { label: "Scheduler", href: "/dashboard/scheduler" },
  { label: "Approval & Analytics", href: "/dashboard/approval-analytics" },
];

export const dashboardMetrics = [
  { label: "Total Content", value: "156", note: "+12% from last month", tone: "purple" },
  { label: "Engagement Rate", value: "8.4%", note: "+2.3% from last week", tone: "green" },
  { label: "Active Campaigns", value: "7", note: "3 ending this week", tone: "purple" },
  { label: "AI Credits Used", value: "420", note: "580 remaining", tone: "amber" },
];

export const contentStatus = [
  { label: "Draft", value: "12", tone: "draft" as StatusTone },
  { label: "Review", value: "8", tone: "review" as StatusTone },
  { label: "Approved", value: "24", tone: "approved" as StatusTone },
];

export const activities = [
  { title: "New draft created", detail: "Social Media Post - Spring Campaign", time: "2 hours ago", color: "bg-[var(--amber)]" },
  { title: "Content approved", detail: "Blog Post - Marketing Tips", time: "5 hours ago", color: "bg-[var(--emerald)]" },
  { title: "Review requested", detail: "Email Newsletter - March Edition", time: "1 day ago", color: "bg-[var(--purple)]" },
  { title: "AI draft generated", detail: "Instagram Caption - Product Launch", time: "2 days ago", color: "bg-[var(--amber)]" },
];

export const plannerTopics = [
  { title: "AI in Content Marketing", tag: "Marketing", score: "95%", lift: "+127%" },
  { title: "Sustainable Business Practices", tag: "Business", score: "88%", lift: "+89%" },
  { title: "Remote Work Culture", tag: "HR", score: "82%", lift: "+72%" },
  { title: "Social Media Trends 2026", tag: "Social Media", score: "90%", lift: "+65%" },
];

export const captionDrafts = [
  {
    platform: "Instagram",
    tone: "Professional & Engaging",
    body: "Transform your content strategy with AI-powered insights! Discover how smart automation can help you create engaging posts in minutes, not hours.",
    tags: ["#ContentMarketing", "#AITools", "#DigitalMarketing", "#SocialMediaTips"],
  },
  {
    platform: "LinkedIn",
    tone: "Professional & Authoritative",
    body: "In today's fast-paced digital landscape, content creators need every advantage. Our AI-driven platform helps teams streamline workflow and maintain consistent brand quality.",
    tags: ["#B2B", "#ContentStrategy", "#MarketingAutomation"],
  },
];

export const calendarColumns = [
  {
    title: "Draft",
    count: "3",
    tone: "draft" as StatusTone,
    cards: [
      { title: "Spring Collection Launch - Instagram Carousel", brand: "Fashion Co.", meta: "Mar 15 · Sarah", platform: "IG" },
      { title: "Weekly dashboard recap", brand: "Agency Pro", meta: "Mar 16 · Emma", platform: "LN" },
    ],
  },
  {
    title: "Review",
    count: "3",
    tone: "review" as StatusTone,
    cards: [
      { title: "Customer Success Story Video", brand: "Agency Pro", meta: "Mar 13 · Emma", platform: "YT" },
      { title: "Product feature article", brand: "Tech Labs", meta: "Mar 18 · Riko", platform: "FB" },
    ],
  },
  {
    title: "Approved",
    count: "2",
    tone: "approved" as StatusTone,
    cards: [
      { title: "Monthly Newsletter: Industry Trends", brand: "Fashion Co.", meta: "Mar 11 · David", platform: "EM" },
      { title: "Launch reminder story sequence", brand: "Kopi Sela", meta: "Mar 19 · Nia", platform: "IG" },
    ],
  },
];

export const approvalStats = [
  { label: "Pending", value: "12" },
  { label: "Approved", value: "45" },
  { label: "Revise", value: "8" },
];

export const analyticsSummary = [
  { label: "Reach", value: "51.8K", delta: "+18%" },
  { label: "Engagement", value: "4.5K", delta: "+25%" },
  { label: "Rate", value: "8.7%", delta: "+2.3%" },
  { label: "Posts", value: "120", delta: "This month" },
];

export const platformPerformance = [
  { label: "Instagram", value: "85%", width: "85%" },
  { label: "Facebook", value: "74%", width: "74%" },
  { label: "TikTok", value: "64%", width: "64%" },
];
