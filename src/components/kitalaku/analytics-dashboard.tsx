'use client';

import { useState, useEffect } from 'react';
import { GlassPanel, cn } from './primitives';
import { IconAnalytics, IconCalendar } from './icons';

export function AnalyticsDashboard() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Persistence logic
  useEffect(() => {
    const savedStart = localStorage.getItem('analytics_start_date');
    const savedEnd = localStorage.getItem('analytics_end_date');
    if (savedStart) setStartDate(savedStart);
    if (savedEnd) setEndDate(savedEnd);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('analytics_start_date', startDate);
      localStorage.setItem('analytics_end_date', endDate);
    }
  }, [startDate, endDate, isLoaded]);

  const hasData = startDate && endDate && new Date(startDate) < new Date(endDate);

  const mockMetrics = [
    { label: 'Total Engagement', value: '124.5k', delta: '+12.3%', tone: 'positive' },
    { label: 'Avg. Click-Through', value: '4.82%', delta: '+0.5%', tone: 'positive' },
    { label: 'Conversion Rate', value: '2.1%', delta: '-0.2%', tone: 'negative' },
    { label: 'Approval Latency', value: '4.2h', delta: '-1.1h', tone: 'positive' },
  ];

  const platformData = [
    { label: 'Instagram', value: 85 },
    { label: 'LinkedIn', value: 62 },
    { label: 'Twitter/X', value: 45 },
    { label: 'Facebook', value: 38 },
  ];

  return (
    <div className="space-y-6">
      <GlassPanel className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--slate-900)] flex items-center gap-2">
              <IconAnalytics /> Performance Insights
            </h2>
            <p className="mt-1 text-sm text-[var(--slate-500)]">
              Decision-ready metrics for campaign evaluation and strategic planning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--slate-200)] bg-white px-3 py-2">
              <span className="text-xs font-semibold text-[var(--slate-400)] uppercase">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm font-medium text-[var(--slate-700)] outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--slate-200)] bg-white px-3 py-2">
              <span className="text-xs font-semibold text-[var(--slate-400)] uppercase">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm font-medium text-[var(--slate-700)] outline-none"
              />
            </div>
          </div>
        </div>

        {!hasData && startDate && endDate && new Date(startDate) >= new Date(endDate) && (
          <p className="mt-4 text-xs font-semibold text-red-500">
            Error: End date must be strictly after the start date.
          </p>
        )}
      </GlassPanel>

      {!hasData ? (
        <GlassPanel className="flex flex-col items-center justify-center p-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--slate-50)] text-[var(--slate-300)]">
            <IconAnalytics />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-[var(--slate-900)]">
            No Data range selected
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--slate-500)]">
            Please select a valid date range to visualize your workspace performance and approval
            metrics.
          </p>
        </GlassPanel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {mockMetrics.map((m) => (
            <GlassPanel key={m.label} className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--slate-400)]">
                {m.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--slate-900)]">{m.value}</p>
              <p
                className={cn(
                  'mt-2 text-xs font-bold',
                  m.tone === 'positive' ? 'text-emerald-600' : 'text-red-500',
                )}
              >
                {m.delta}{' '}
                <span className="font-normal text-[var(--slate-400)]">vs prev. period</span>
              </p>
            </GlassPanel>
          ))}

          <GlassPanel className="lg:col-span-2 xl:col-span-3 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--slate-700)]">
              Engagement Trends
            </h3>
            <div className="mt-8 flex h-64 items-end justify-between gap-2">
              {[40, 65, 45, 90, 55, 75, 40, 85, 60, 95, 70, 80].map((h, i) => (
                <div key={i} className="group relative flex-1">
                  <div
                    className="w-full rounded-t-lg bg-[var(--purple-soft)] transition-all duration-500 hover:bg-[var(--purple-border)]"
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-[var(--slate-900)] px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {h}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--slate-400)]">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
            </div>
          </GlassPanel>

          <GlassPanel className="xl:col-span-1 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--slate-700)]">
              Platform Share
            </h3>
            <div className="mt-8 space-y-6">
              {platformData.map((p) => (
                <div key={p.label}>
                  <div className="mb-2 flex justify-between text-xs font-bold">
                    <span className="text-[var(--slate-600)]">{p.label}</span>
                    <span className="text-[var(--slate-900)]">{p.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--slate-100)] overflow-hidden">
                    <div
                      className="h-full bg-[linear-gradient(90deg,#8b5cf6,#7c3aed)] rounded-full transition-all duration-1000"
                      style={{ width: `${p.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
