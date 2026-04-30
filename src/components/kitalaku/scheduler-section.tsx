'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { GlassPanel, cn } from './primitives';
import { IconCalendar } from './icons';
import { useWorkspace } from './workspace-context';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';

export function SchedulerSection() {
  const { selectedBrandId, selectedProjectId } = useWorkspace();

  const projects =
    useQuery(
      api.projects.getProjects,
      selectedBrandId ? { brandId: selectedBrandId as Id<'brands'> } : 'skip',
    ) || [];

  const drafts =
    useQuery(
      api.drafts.getDrafts,
      selectedProjectId ? { projectId: selectedProjectId as Id<'projects'> } : 'skip',
    ) || [];

  const updateDraftSchedule = useMutation(api.drafts.updateDraftSchedule);

  const backlogRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<Draggable | null>(null);

  // Correct Draggable initialization with cleanup
  useEffect(() => {
    if (backlogRef.current && !draggableRef.current) {
      draggableRef.current = new Draggable(backlogRef.current, {
        itemSelector: '.fc-event',
        eventData: function (eventEl) {
          const id = eventEl.getAttribute('data-id');
          const title = eventEl.getAttribute('data-title');
          return {
            id,
            title,
            allDay: true,
          };
        },
      });
    }
  }, [selectedProjectId]);

  const scheduledDrafts = drafts.filter(
    (d) => d.scheduledDate !== undefined && d.scheduledDate > 0,
  );
  const unscheduledDrafts = drafts.filter(
    (d) => !d.scheduledDate || d.scheduledDate === 0 || d.scheduledDate === undefined,
  );

  const calendarEvents = scheduledDrafts.map((d) => ({
    id: d._id,
    title:
      d.content.replace(/<[^>]*>?/gm, '').substring(0, 30) + '...' ||
      d.aiPrompt ||
      'Draf Tanpa Judul',
    start: d.scheduledDate,
    allDay: true,
    extendedProps: {
      status: d.status,
    },
  }));

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleEventDrop = async (info: any) => {
    const draftId = info.event.id as Id<'contentDrafts'>;
    const newDate = new Date(info.event.start);

    if (isPastDate(newDate)) {
      info.revert();
      alert('Tidak dapat menjadwalkan konten di tanggal yang sudah lewat.');
      return;
    }

    try {
      await updateDraftSchedule({ draftId, scheduledDate: newDate.getTime() });
    } catch (error) {
      console.error('Failed to reschedule draft:', error);
      info.revert();
      alert('Gagal menyimpan jadwal. Mengembalikan posisi.');
    }
  };

  const handleEventReceive = async (info: any) => {
    const draftId = info.event.id as Id<'contentDrafts'>;
    const newDate = new Date(info.event.start);

    if (isPastDate(newDate)) {
      info.revert();
      alert('Tidak dapat menjadwalkan konten di tanggal yang sudah lewat.');
      return;
    }

    try {
      await updateDraftSchedule({ draftId, scheduledDate: newDate.getTime() });
      info.event.remove();
    } catch (error) {
      console.error('Failed to schedule draft:', error);
      info.revert();
    }
  };

  const handleEventDragStop = async (info: any) => {
    // Check if event was dragged outside the calendar (to the backlog)
    const calendarRect = document.querySelector('.fc')?.getBoundingClientRect();
    const eventRect = info.jsEvent.target.getBoundingClientRect();

    if (calendarRect && (eventRect.x < calendarRect.x || eventRect.x > calendarRect.right)) {
      const draftId = info.event.id as Id<'contentDrafts'>;
      try {
        // Remove scheduled date to move back to unscheduled
        await updateDraftSchedule({ draftId, scheduledDate: 0 });
        // remove from calendar immediately to avoid flicker/duplicates until data syncs
        try {
          info.event.remove();
        } catch (e) {
          // ignore
        }
      } catch (error) {
        console.error('Failed to unschedule draft:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <GlassPanel className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--slate-900)] flex items-center gap-2">
              <IconCalendar /> Penjadwal Editorial
            </h2>
            <p className="mt-1 text-sm text-[var(--slate-500)]">
              Tarik draf dari sidebar ke dalam kalender untuk mengatur tanggal publikasi.
            </p>
          </div>
        </div>
      </GlassPanel>

      {selectedProjectId ? (
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* Sidebar: Backlog */}
          <GlassPanel className="p-5 h-fit max-h-[800px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--slate-800)] text-sm uppercase tracking-wider">
                Draf Belum Terjadwal
              </h3>
              <span className="bg-[var(--slate-100)] text-[var(--slate-600)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unscheduledDrafts.length}
              </span>
            </div>

            <div ref={backlogRef} className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {unscheduledDrafts.length === 0 ? (
                <p className="text-xs text-[var(--slate-400)] italic p-4 text-center border-2 border-dashed border-[var(--slate-100)] rounded-xl">
                  Tidak ada draf belum terjadwal untuk proyek ini.
                </p>
              ) : (
                unscheduledDrafts.map((d) => (
                  <div
                    key={d._id}
                    className="fc-event cursor-grab active:cursor-grabbing p-3 rounded-xl border border-[var(--slate-200)] bg-white shadow-sm hover:shadow-md transition-all hover:border-[var(--purple-border)]"
                    data-id={d._id}
                    data-title={d.content.replace(/<[^>]*>?/gm, '').substring(0, 30) + '...'}
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-[var(--slate-800)] line-clamp-2 leading-relaxed">
                        {d.content.replace(/<[^>]*>?/gm, '').substring(0, 80) ||
                          d.aiPrompt ||
                          'Draf Tanpa Judul'}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] font-bold uppercase text-[var(--slate-400)]">
                          {d.platform}
                        </span>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase',
                            d.status === 'Draft'
                              ? 'bg-amber-100 text-amber-600'
                              : d.status === 'Review'
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-emerald-100 text-emerald-600',
                          )}
                        >
                          {d.status === 'Draft'
                            ? 'Draf'
                            : d.status === 'Review'
                              ? 'Ditinjau'
                              : 'Disetujui'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>

          {/* Main: Calendar */}
          <GlassPanel className="p-6">
            <style>
              {`
                .fc-theme-standard td, .fc-theme-standard th {
                  border-color: rgba(219, 227, 238, 0.4);
                }
                .fc .fc-toolbar-title {
                  font-size: 1.25rem;
                  font-weight: 600;
                  color: var(--slate-900);
                }
                .fc .fc-button-primary {
                  background-color: white;
                  color: var(--slate-700);
                  border-color: var(--slate-200);
                  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .fc .fc-button-primary:not(:disabled):active, .fc .fc-button-primary:not(:disabled).fc-button-active {
                  background-color: var(--slate-100);
                  border-color: var(--slate-300);
                  color: var(--slate-900);
                }
                .fc .fc-event {
                  background-color: var(--purple-soft);
                  border: 1px solid var(--purple-border);
                  color: var(--purple-strong);
                  font-weight: 500;
                  padding: 4px 8px;
                  border-radius: 8px;
                  cursor: pointer;
                  font-size: 11px;
                  border-left: 4px solid var(--purple-strong);
                }
                .custom-scrollbar::-webkit-scrollbar {
                  width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: var(--slate-200);
                  border-radius: 10px;
                }
              `}
            </style>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              editable={true}
              droppable={true}
              events={calendarEvents}
              eventDrop={handleEventDrop}
              eventReceive={handleEventReceive}
              eventDragStop={handleEventDragStop}
              height="auto"
              locale="id"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek',
              }}
            />
          </GlassPanel>
        </div>
      ) : (
        <GlassPanel className="p-12 text-center">
          <p className="text-sm font-semibold text-[var(--slate-500)]">
            Silakan pilih Brand dan Proyek di sidebar untuk melihat kalender.
          </p>
        </GlassPanel>
      )}
    </div>
  );
}
