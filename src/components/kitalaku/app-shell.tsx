'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useWorkspace } from './workspace-context';
import { Id } from '@/convex/_generated/dataModel';
import { sideNav } from './data';
import {
  IconAnalytics,
  IconBell,
  IconCalendar,
  IconCard,
  IconGrid,
  IconSearch,
  IconSettings,
  IconWand,
} from './icons';
import { GlassPanel, cn } from './primitives';

const NOTIFICATION_TRANSITION_MS = 260;

export function AppShell({ active, children }: { active: string; children: React.ReactNode }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsMounted, setNotificationsMounted] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const agency = useQuery(
    api.agencies.getAgency,
    currentUser?.agencyId ? { agencyId: currentUser.agencyId } : 'skip',
  );

  const { selectedBrandId, setSelectedBrandId, selectedProjectId, setSelectedProjectId } =
    useWorkspace();

  const brandsQuery = useQuery(api.brands.getBrands);
  const brands = brandsQuery || [];
  const projectsQuery = useQuery(
    api.projects.getProjects,
    selectedBrandId ? { brandId: selectedBrandId as Id<'brands'> } : 'skip',
  );
  const projects = projectsQuery || [];

  useEffect(() => {
    if (!selectedBrandId && brands.length > 0) {
      setSelectedBrandId(brands[0]._id);
    }
  }, [brands, selectedBrandId, setSelectedBrandId]);

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId, setSelectedProjectId]);

  const notifications = useQuery(api.notifications.getNotifications) || [];
  const markAsReadMutation = useMutation(api.notifications.markAsRead);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const pageDescriptions: Record<string, string> = {
    Dasbor: 'Pantau prioritas, persetujuan, dan performa tanpa meninggalkan ruang kerja.',
    'Perencana AI': 'Buat konsep konten strategis, lalu poles sebelum dikirim untuk ditinjau.',
    Penjadwal: 'Pastikan jadwal publikasi terlihat jelas agar tim bisa bergerak lebih cepat.',
    'Persetujuan & Analitik':
      'Pantau persetujuan dan performa kampanye dalam satu tampilan siap-ambil-keputusan.',
    Profil: 'Kelola identitas akun dan detail profil ruang kerja yang selaras dengan brand Anda.',
    Pengaturan: 'Kelola akses tim, integrasi, dan preferensi ruang kerja dari satu tempat.',
  };

  const activeDescription = pageDescriptions[active] ?? '';

  const openNotifications = () => {
    setNotificationsMounted(true);
    requestAnimationFrame(() => setNotificationsOpen(true));
  };

  const closeNotifications = () => {
    setNotificationsOpen(false);
  };

  useEffect(() => {
    if (!notificationsMounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeNotifications();
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsMounted]);

  useEffect(() => {
    if (notificationsOpen || !notificationsMounted) return;

    const timeout = window.setTimeout(() => {
      setNotificationsMounted(false);
    }, NOTIFICATION_TRANSITION_MS);

    return () => window.clearTimeout(timeout);
  }, [notificationsOpen, notificationsMounted]);

  return (
    <div className="min-h-screen md:pl-[292px]">
      <aside className="hidden rounded-[32px] border border-[rgba(219,227,238,0.88)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.72))] shadow-[0_24px_48px_rgba(30,41,59,0.14)] backdrop-blur-2xl md:fixed md:bottom-4 md:left-4 md:top-4 md:flex md:w-[260px] md:flex-col md:justify-between md:overflow-y-auto">
        <div className="px-5 py-5">
          <GlassPanel className="p-5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/kitalakuin-icon.png"
                alt="Kitalaku.in Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <p className="font-bold self-center font-display text-xl leading-[0.95] text-[var(--slate-900)]">
                  Kitalaku.in
                </p>
              </div>
            </Link>
          </GlassPanel>

          <div className="mt-3 px-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slate-400)]">
              Navigasi
            </p>
          </div>

          <nav className="mt-3 space-y-1">
            {sideNav
              .filter((item) => {
                if (!currentUser) return true;
                if (currentUser.role === 'Client') {
                  return (
                    item.label === 'Dasbor' ||
                    item.label === 'Penjadwal' ||
                    item.label === 'Persetujuan & Analitik'
                  );
                }
                return true;
              })
              .map((item) => {
                const current = item.label === active;
                const icon =
                  item.label === 'Dasbor' ? (
                    <IconGrid />
                  ) : item.label === 'Perencana AI' ? (
                    <IconWand />
                  ) : item.label === 'Penjadwal' ? (
                    <IconCalendar />
                  ) : (
                    <IconAnalytics />
                  );

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-[14px] px-4 py-3 text-sm transition-all duration-200',
                      current
                        ? 'bg-white shadow-[0_2px_12px_rgba(30,41,59,0.05)] text-[var(--purple-strong)] font-semibold'
                        : 'text-[var(--slate-600)] font-medium hover:bg-white/50 hover:text-[var(--slate-900)]',
                    )}
                  >
                    {icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        </div>

        <div className="px-5 pb-5 space-y-4">
          <GlassPanel className="p-4 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--slate-400)]">
                Brand Terpilih
              </label>
              <select
                value={selectedBrandId}
                onChange={(e) => {
                  setSelectedBrandId(e.target.value as Id<'brands'>);
                  setSelectedProjectId('');
                }}
                className="mt-1.5 w-full rounded-xl border border-[var(--slate-200)] bg-white/50 px-3 py-2 text-sm font-semibold text-[var(--slate-700)] outline-none transition-all hover:border-[var(--purple-border)]"
              >
                <option value="">Pilih Brand</option>
                {brandsQuery === undefined && <option disabled>Memuat brand...</option>}
                {brandsQuery !== undefined && brands.length === 0 && (
                  <option disabled>Belum ada brand</option>
                )}
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--slate-400)]">
                Proyek Aktif
              </label>
              <select
                value={selectedProjectId}
                disabled={!selectedBrandId}
                onChange={(e) => setSelectedProjectId(e.target.value as Id<'projects'>)}
                className="mt-1.5 w-full rounded-xl border border-[var(--slate-200)] bg-white/50 px-3 py-2 text-sm font-semibold text-[var(--slate-700)] outline-none transition-all hover:border-[var(--purple-border)] disabled:opacity-50"
              >
                <option value="">Pilih Proyek</option>
                {selectedBrandId && projectsQuery === undefined && (
                  <option disabled>Memuat proyek...</option>
                )}
                {selectedBrandId && projectsQuery !== undefined && projects.length === 0 && (
                  <option disabled>Belum ada proyek</option>
                )}
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </GlassPanel>

          {currentUser?.role !== 'Client' && (
            <GlassPanel className="border-[rgba(124,58,237,0.16)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--slate-700)]">Kuota AI</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--slate-900)]">
                    {agency?.tokenQuotaRemaining?.toLocaleString() || '0'}
                  </p>
                </div>
                <span className="rounded-full bg-[rgba(16,185,129,0.14)] px-3 py-1 text-xs font-semibold text-[var(--emerald-strong)]">
                  {agency ? 'Aktif' : 'Tanpa Agency'}
                </span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/85">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,#8b5cf6,#7c3aed)]"
                  style={{
                    width: `${Math.min(100, ((agency?.tokenQuotaRemaining || 0) / 1000) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--slate-500)]">
                {agency
                  ? 'Saldo kredit cukup.'
                  : 'Mohon siapkan agency untuk menggunakan fitur AI.'}
              </p>
            </GlassPanel>
          )}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[rgba(219,227,238,0.88)] bg-[rgba(248,250,252,0.78)] backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="font-display mt-3 text-3xl leading-[1.04] text-[var(--slate-900)]">
                  {active}
                </p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--slate-500)]">
                  {activeDescription}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl border border-[rgba(219,227,238,0.88)] bg-white/82 px-4 py-3 text-left text-[var(--slate-500)] shadow-[0_10px_20px_rgba(30,41,59,0.05)] sm:w-[340px]"
                >
                  <IconSearch />
                  <span className="flex-1 text-sm">Cari konten...</span>
                  <span className="rounded-lg bg-[var(--slate-100)] px-2 py-1 text-[10px] font-semibold text-[var(--slate-400)]">
                    /
                  </span>
                </button>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={openNotifications}
                    aria-label="Buka notifikasi"
                    className={cn(
                      'relative flex items-center justify-center rounded-2xl border bg-white/80 p-3 shadow-[0_2px_10px_rgba(30,41,59,0.04)] backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-[0_8px_20px_rgba(30,41,59,0.08)]',
                      notificationsMounted
                        ? 'border-[var(--purple-border)] text-[var(--purple-strong)]'
                        : 'border-transparent text-[var(--slate-600)]',
                    )}
                  >
                    <IconBell />
                    {unreadCount > 0 && (
                      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </button>

                  {(currentUser?.role === 'Admin' || currentUser?.role === 'Creative Manager') && (
                    <Link
                      href="/settings"
                      aria-label="Buka pengaturan"
                      className={cn(
                        'flex items-center justify-center rounded-2xl border bg-white/80 p-3 shadow-[0_2px_10px_rgba(30,41,59,0.04)] backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-[0_8px_20px_rgba(30,41,59,0.08)]',
                        active === 'Pengaturan'
                          ? 'border-[var(--purple-border)] text-[var(--purple-strong)]'
                          : 'border-transparent text-[var(--slate-600)]',
                      )}
                    >
                      <IconSettings />
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border bg-white/80 px-3 py-2.5 shadow-[0_2px_10px_rgba(30,41,59,0.04)] backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-[0_8px_20px_rgba(30,41,59,0.08)]',
                      active === 'Profil'
                        ? 'border-[var(--purple-border)] ring-1 ring-[rgba(124,58,237,0.08)]'
                        : 'border-transparent',
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] text-sm font-semibold text-white">
                      {currentUser?.name?.substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--slate-900)]">
                        {currentUser?.name || 'Memuat...'}
                      </p>
                      <p className="text-xs text-[var(--slate-500)]">
                        {currentUser?.role || 'Pengguna'}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
              {sideNav
                .filter((item) => {
                  if (!currentUser) return true;
                  if (currentUser.role === 'Client') {
                    return (
                      item.label === 'Dasbor' ||
                      item.label === 'Penjadwal' ||
                      item.label === 'Persetujuan & Analitik'
                    );
                  }
                  return true;
                })
                .map((item) => {
                  const current = item.label === active;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium',
                        current
                          ? 'border-[var(--purple-border)] bg-white text-[var(--purple-strong)] shadow-sm'
                          : 'border-transparent bg-white/60 text-[var(--slate-600)] hover:bg-white/90',
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

      {notificationsMounted ? (
        <>
          <button
            type="button"
            aria-label="Tutup notifikasi"
            onClick={closeNotifications}
            className={cn(
              'fixed inset-0 z-40 bg-[rgba(15,23,42,0.28)] transition-opacity duration-200 ease-out',
              notificationsOpen ? 'opacity-100' : 'opacity-0',
            )}
          />

          <div className="fixed inset-0 z-50 flex items-stretch justify-end overflow-hidden p-2 md:p-3">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="notification-title"
              className={cn(
                'notification-drawer-scroll h-full w-full max-w-[440px] overflow-y-scroll rounded-[28px] border border-[rgba(255,255,255,0.76)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.9))] p-5 shadow-[-18px_0_42px_rgba(15,23,42,0.18)] backdrop-blur-2xl will-change-transform will-change-opacity transition-all duration-300 ease-out',
                notificationsOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slate-700)]">
                    Kotak Masuk
                  </p>
                  <h2
                    id="notification-title"
                    className="mt-1 text-xl font-semibold tracking-tight text-[var(--slate-900)]"
                  >
                    Notifikasi
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeNotifications}
                  className="rounded-xl border border-[rgba(219,227,238,0.9)] bg-white/85 px-3 py-1.5 text-xs font-semibold text-[var(--slate-600)]"
                >
                  Tutup
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-[var(--slate-400)] py-8">
                    Belum ada notifikasi.
                  </p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => markAsReadMutation({ notificationId: item._id })}
                      className={cn(
                        'rounded-2xl border px-4 py-3 cursor-pointer transition-colors',
                        item.isRead
                          ? 'border-[rgba(219,227,238,0.88)] bg-[var(--surface-strong)] opacity-60'
                          : 'border-[var(--purple-border)] bg-white shadow-sm',
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[var(--slate-900)]">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[var(--slate-500)]">
                            {item.message}
                          </p>
                        </div>
                        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--slate-400)]">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
