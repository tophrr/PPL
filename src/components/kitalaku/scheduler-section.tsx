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
              <IconCalendar /> Editorial Scheduler
            </h2>
            <p className="mt-1 text-sm text-[var(--slate-500)]">
              Selection inherited from global workspace in sidebar.
            </p>
          </div>
        </div>
      </GlassPanel>

      {selectedProjectId ? (
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* Sidebar: Backlog */}
          <GlassPanel className="p-5 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--slate-800)] text-sm uppercase tracking-wider">
                Unscheduled Drafts
              </h3>
              <span className="bg-[var(--slate-100)] text-[var(--slate-600)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unscheduledDrafts.length}
              </span>
            </div>

            <div ref={backlogRef} className="space-y-3 min-h-[300px]">
              {unscheduledDrafts.length === 0 ? (
                <p className="text-xs text-[var(--slate-400)] italic p-4 text-center border-2 border-dashed border-[var(--slate-100)] rounded-xl">
                  All drafts are scheduled or none found
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
                          'Untitled Draft'}
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
                          {d.status}
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
            Please select a Brand and Project in the sidebar to view the calendar.
          </p>
        </GlassPanel>
      )}
    </div>
  );
}
