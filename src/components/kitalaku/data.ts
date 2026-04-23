export type StatusTone = 'draft' | 'review' | 'approved';

export const sideNav = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'AI Planner', href: '/dashboard/planner' },
  { label: 'Scheduler', href: '/dashboard/scheduler' },
  { label: 'Approval & Analytics', href: '/dashboard/approval-analytics' },
  { label: 'Subscription', href: '/dashboard/subscription' },
];

export const dashboardMetrics = [
  { label: 'Total Content', value: '156', note: '+12% from last month', tone: 'purple' },
  { label: 'Engagement Rate', value: '8.4%', note: '+2.3% from last week', tone: 'green' },
  { label: 'Active Campaigns', value: '7', note: '3 ending this week', tone: 'purple' },
  { label: 'AI Credits Used', value: '420', note: '580 remaining', tone: 'amber' },
];

export const contentStatus = [
  { label: 'Draft', value: '12', tone: 'draft' as StatusTone },
  { label: 'Review', value: '8', tone: 'review' as StatusTone },
  { label: 'Approved', value: '24', tone: 'approved' as StatusTone },
];

export const activities = [
  {
    title: 'Draft selesai dipoles',
    detail: 'Caption launch serum hydration untuk Lumiere Skin masuk ke review lane.',
    time: '12 minutes ago',
    color: 'bg-[var(--amber)]',
  },
  {
    title: 'Klien menyetujui konten',
    detail: 'Newsletter mingguan Bumi Properti disetujui tanpa revisi tambahan.',
    time: '48 minutes ago',
    color: 'bg-[var(--emerald)]',
  },
  {
    title: 'Manager meminta refinement',
    detail: 'Carousel edukasi pajak UMKM butuh CTA yang lebih tegas di slide akhir.',
    time: '2 hours ago',
    color: 'bg-[var(--purple)]',
  },
  {
    title: 'AI planner menghasilkan batch baru',
    detail: 'Tiga angle campaign Ramadan untuk Kopi Sela siap dipilih tim kreatif.',
    time: 'Yesterday',
    color: 'bg-[var(--amber)]',
  },
];

export const plannerTopics = [
  {
    title: 'Ritual malam premium untuk kulit dehidrasi',
    tag: 'Beauty',
    score: '95%',
    lift: '+127%',
  },
  { title: 'Behind the scenes roasting batch Ramadan', tag: 'F&B', score: '88%', lift: '+89%' },
  {
    title: 'Checklist rumah pertama untuk pasangan muda',
    tag: 'Property',
    score: '82%',
    lift: '+72%',
  },
  {
    title: 'Micro-storytelling untuk Reels edukatif 2026',
    tag: 'Social Media',
    score: '90%',
    lift: '+65%',
  },
];

export const captionDrafts = [
  {
    platform: 'Instagram',
    tone: 'Refined & Warm',
    body: 'Kulit kusam tidak selalu butuh langkah rumit. Kadang yang dibutuhkan hanya serum dengan hidrasi yang terasa ringan, cepat menyerap, dan cukup lembut dipakai setiap malam. Lumiere Night Dew dirancang untuk rutinitas yang simple, tapi tetap terasa premium saat menyentuh kulit.',
    tags: ['#NightRepair', '#HydrationRitual', '#LumiereSkin', '#SkincareMinimalist'],
  },
  {
    platform: 'LinkedIn',
    tone: 'Editorial & Bold',
    body: 'Agensi yang ingin tumbuh tidak bisa lagi bergantung pada alur kerja konten yang tersebar di banyak tools. Ketika planner, approval, dan analytics berada dalam satu workspace, keputusan editorial jadi lebih cepat, lebih terukur, dan lebih mudah dijaga kualitasnya untuk setiap brand yang ditangani.',
    tags: ['#AgencyOperations', '#ContentSystem', '#MarketingWorkflow'],
  },
];

export const calendarColumns = [
  {
    title: 'Draft',
    count: '3',
    tone: 'draft' as StatusTone,
    cards: [
      {
        title: 'Teaser carousel koleksi Raya untuk Svarna Studio',
        brand: 'Svarna Studio',
        meta: 'Apr 18 | Sarah',
        platform: 'IG',
      },
      {
        title: 'Recap insight mingguan untuk retainer Klio',
        brand: 'Klio Agency',
        meta: 'Apr 19 | Emma',
        platform: 'LN',
      },
    ],
  },
  {
    title: 'Review',
    count: '3',
    tone: 'review' as StatusTone,
    cards: [
      {
        title: 'Video testimonial founder untuk Rivora Living',
        brand: 'Rivora Living',
        meta: 'Apr 20 | Emma',
        platform: 'YT',
      },
      {
        title: 'Artikel soft launch fitur baru untuk Clario',
        brand: 'Clario Tech',
        meta: 'Apr 21 | Riko',
        platform: 'FB',
      },
    ],
  },
  {
    title: 'Approved',
    count: '2',
    tone: 'approved' as StatusTone,
    cards: [
      {
        title: 'Newsletter market outlook kuartal dua',
        brand: 'Bumi Properti',
        meta: 'Apr 16 | David',
        platform: 'EM',
      },
      {
        title: 'Story reminder flash sale sore ini',
        brand: 'Kopi Sela',
        meta: 'Apr 17 | Nia',
        platform: 'IG',
      },
    ],
  },
];

export const approvalStats = [
  { label: 'Pending', value: '12' },
  { label: 'Approved', value: '45' },
  { label: 'Revise', value: '8' },
];

export const analyticsSummary = [
  { label: 'Reach', value: '51.8K', delta: '+18%' },
  { label: 'Engagement', value: '4.5K', delta: '+25%' },
  { label: 'Rate', value: '8.7%', delta: '+2.3%' },
  { label: 'Posts', value: '120', delta: 'This month' },
];

export const platformPerformance = [
  { label: 'Instagram', value: '85%', width: '85%' },
  { label: 'Facebook', value: '74%', width: '74%' },
  { label: 'TikTok', value: '64%', width: '64%' },
];
