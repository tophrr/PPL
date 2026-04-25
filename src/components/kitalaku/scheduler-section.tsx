'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { GlassPanel, cn } from './primitives';
import { IconCalendar } from './icons';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';

export function SchedulerSection() {
  const [selectedBrandId, setSelectedBrandId] = useState<Id<'brands'> | ''>('');
  const [selectedProjectId, setSelectedProjectId] = useState<Id<'projects'> | ''>('');

  const brands = useQuery(api.brands.getBrands) || [];
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

  useEffect(() => {
    if (backlogRef.current) {
      new Draggable(backlogRef.current, {
        itemSelector: '.fc-event',
        eventData: function (eventEl) {
          const id = eventEl.getAttribute('data-id');
          const title = eventEl.getAttribute('data-title');
          return {
            id,
            title,
          };
        },
      });
    }
  }, [drafts]);

  const scheduledDrafts = drafts.filter((d) => d.scheduledDate !== undefined);
  const unscheduledDrafts = drafts.filter((d) => d.scheduledDate === undefined);

  const calendarEvents = scheduledDrafts.map((d) => ({
    id: d._id,
    title:
      d.content.replace(/<[^>]*>?/gm, '').substring(0, 30) + '...' ||
      d.aiPrompt ||
      'Untitled Draft',
    date: new Date(d.scheduledDate!).toISOString().split('T')[0], // yyyy-mm-dd
    extendedProps: {
      status: d.status,
    },
  }));

  const handleEventDrop = async (info: any) => {
    const draftId = info.event.id as Id<'contentDrafts'>;
    const newDate = info.event.start.getTime();

    // Optimistic UI updates are built into FullCalendar if we don't strictly bind to the exact state immediately,
    // but React's render cycle will sync it. We just fire the mutation.
    try {
      await updateDraftSchedule({ draftId, scheduledDate: newDate });
    } catch (error) {
      console.error('Failed to reschedule draft:', error);
      info.revert();
      alert('Failed to save schedule. Reverting.');
    }
  };

  const handleEventReceive = async (info: any) => {
    const draftId = info.event.id as Id<'contentDrafts'>;
    const newDate = info.event.start.getTime();

    try {
      await updateDraftSchedule({ draftId, scheduledDate: newDate });
      // Remove from calendar temporarily until React state updates, otherwise it creates duplicates if not handled well.
      info.event.remove();
    } catch (error) {
      console.error('Failed to schedule draft:', error);
      info.revert();
    }
  };

  return (
    <div className="space-y-6">
      <GlassPanel className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--slate-900)] flex items-center gap-2">
              <IconCalendar /> Scheduler Workspace
            </h2>
            <p className="mt-1 text-sm text-[var(--slate-500)]">
              Drag drafts onto the calendar to assign publication dates.
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedBrandId}
              onChange={(e) => {
                setSelectedBrandId(e.target.value as Id<'brands'>);
                setSelectedProjectId('');
              }}
              className="rounded-xl border border-[var(--slate-200)] bg-white px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] hover:border-[var(--slate-300)]"
            >
              <option value="">-- Brand --</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value as Id<'projects'>)}
              disabled={!selectedBrandId}
              className="rounded-xl border border-[var(--slate-200)] bg-white px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] hover:border-[var(--slate-300)] disabled:opacity-50"
            >
              <option value="">-- Project --</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassPanel>

      {selectedProjectId ? (
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <GlassPanel className="flex flex-col p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--slate-700)]">
              Unscheduled Backlog
            </h3>
            <p className="mt-1 text-xs text-[var(--slate-500)] mb-4">
              Drag these items onto the calendar.
            </p>

            <div
              ref={backlogRef}
              className="flex-1 space-y-3 overflow-y-auto"
              style={{ minHeight: '300px' }}
            >
              {unscheduledDrafts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--slate-200)] bg-[var(--slate-50)] p-4 text-center text-xs text-[var(--slate-400)]">
                  No unscheduled drafts.
                </div>
              ) : (
                unscheduledDrafts.map((d) => (
                  <div
                    key={d._id}
                    data-id={d._id}
                    data-title={d.content.replace(/<[^>]*>?/gm, '').substring(0, 30) || 'Untitled'}
                    className="fc-event cursor-move rounded-xl border border-[rgba(219,227,238,0.88)] bg-white p-3 shadow-sm hover:border-[var(--purple-border)] hover:shadow-md transition-all duration-200"
                  >
                    <p className="text-sm font-semibold text-[var(--slate-900)] truncate">
                      {d.content.replace(/<[^>]*>?/gm, '').substring(0, 30) || 'Untitled Draft'}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                          d.status === 'Draft'
                            ? 'bg-amber-100 text-amber-700'
                            : d.status === 'Review'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-emerald-100 text-emerald-700',
                        )}
                      >
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 overflow-hidden">
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
                  padding: 2px 4px;
                  border-radius: 4px;
                  cursor: pointer;
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
              height="auto"
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
            Please select a Brand and Project to view the calendar.
          </p>
        </GlassPanel>
      )}
    </div>
  );
}
