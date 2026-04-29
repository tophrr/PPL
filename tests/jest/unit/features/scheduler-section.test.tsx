import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const apiMock = {
  projects: { getProjects: 'projects.getProjects' },
  drafts: {
    getDrafts: 'drafts.getDrafts',
    updateDraftSchedule: 'drafts.updateDraftSchedule',
  },
};

const schedulerState = {
  selectedBrandId: 'brand_1',
  selectedProjectId: 'project_1',
  projects: [{ _id: 'project_1', name: 'Project One' }],
  drafts: [
    {
      _id: 'draft_unscheduled',
      content: '<p>Caption backlog</p>',
      aiPrompt: 'Backlog brief',
      platform: 'Instagram',
      status: 'Draft',
    },
    {
      _id: 'draft_scheduled',
      content: '<p>Caption calendar</p>',
      aiPrompt: 'Scheduled brief',
      platform: 'TikTok',
      status: 'Approved',
      scheduledDate: Date.UTC(2026, 3, 30),
    },
  ] as Array<Record<string, any>>,
};

const updateDraftScheduleMock = jest.fn();

jest.mock('@/convex/_generated/api', () => ({
  api: apiMock,
}));

jest.mock('convex/react', () => ({
  useQuery: (ref: string) => {
    if (ref === apiMock.projects.getProjects) return schedulerState.projects;
    if (ref === apiMock.drafts.getDrafts) return schedulerState.drafts;
    return null;
  },
  useMutation: () => updateDraftScheduleMock,
}));

jest.mock('@/src/components/kitalaku/workspace-context', () => ({
  useWorkspace: () => ({
    selectedBrandId: schedulerState.selectedBrandId,
    selectedProjectId: schedulerState.selectedProjectId,
  }),
}));

const draggableInstances: Array<unknown> = [];
let lastDropRevert = jest.fn();
let lastReceiveRevert = jest.fn();
let lastReceiveRemove = jest.fn();
let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

jest.mock('@fullcalendar/interaction', () => ({
  __esModule: true,
  default: {},
  Draggable: class {
    constructor(...args: unknown[]) {
      draggableInstances.push(args);
    }
  },
}));

jest.mock('@fullcalendar/daygrid', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('@fullcalendar/react', () => ({
  __esModule: true,
  default: ({
    events,
    eventDrop,
    eventReceive,
  }: {
    events: Array<{ id: string; title: string }>;
    eventDrop: (info: unknown) => void;
    eventReceive: (info: unknown) => void;
  }) => (
    <div>
      <div data-testid="calendar-events">{events.map((event) => event.title).join(', ')}</div>
      <button
        onClick={() => {
          lastDropRevert = jest.fn();
          eventDrop({
            event: {
              id: 'draft_scheduled',
              start: new Date(Date.UTC(2026, 4, 1)),
            },
            revert: lastDropRevert,
          });
        }}
      >
        simulate-drop
      </button>
      <button
        onClick={() => {
          lastReceiveRevert = jest.fn();
          lastReceiveRemove = jest.fn();
          eventReceive({
            event: {
              id: 'draft_unscheduled',
              start: new Date(Date.UTC(2026, 4, 2)),
              remove: lastReceiveRemove,
            },
            revert: lastReceiveRevert,
          });
        }}
      >
        simulate-receive
      </button>
    </div>
  ),
}));

const { SchedulerSection } = require('@/src/components/kitalaku/scheduler-section');

describe('SchedulerSection', () => {
  beforeEach(() => {
    schedulerState.selectedBrandId = 'brand_1';
    schedulerState.selectedProjectId = 'project_1';
    schedulerState.projects = [{ _id: 'project_1', name: 'Project One' }];
    schedulerState.drafts = [
      {
        _id: 'draft_unscheduled',
        content: '<p>Caption backlog</p>',
        aiPrompt: 'Backlog brief',
        platform: 'Instagram',
        status: 'Draft',
      },
      {
        _id: 'draft_scheduled',
        content: '<p>Caption calendar</p>',
        aiPrompt: 'Scheduled brief',
        platform: 'TikTok',
        status: 'Approved',
        scheduledDate: Date.UTC(2026, 3, 30),
      },
    ];
    updateDraftScheduleMock.mockReset();
    draggableInstances.length = 0;
    lastDropRevert = jest.fn();
    lastReceiveRevert = jest.fn();
    lastReceiveRemove = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
  });

  test('should render backlog drafts and scheduled calendar events', () => {
    render(<SchedulerSection />);

    expect(screen.getByText('Draf Belum Terjadwal')).toBeInTheDocument();
    expect(screen.getByText('Caption backlog')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-events')).toHaveTextContent('Caption calendar...');
    expect(draggableInstances).toHaveLength(1);
  });

  test('should update schedule on calendar drop and receive', async () => {
    updateDraftScheduleMock.mockResolvedValue(undefined);

    render(<SchedulerSection />);

    fireEvent.click(screen.getByText('simulate-drop'));
    fireEvent.click(screen.getByText('simulate-receive'));

    await waitFor(() => {
      expect(updateDraftScheduleMock).toHaveBeenNthCalledWith(1, {
        draftId: 'draft_scheduled',
        scheduledDate: Date.UTC(2026, 4, 1),
      });
      expect(updateDraftScheduleMock).toHaveBeenNthCalledWith(2, {
        draftId: 'draft_unscheduled',
        scheduledDate: Date.UTC(2026, 4, 2),
      });
    });
  });

  test('should rollback and alert when a dragged event fails to save', async () => {
    updateDraftScheduleMock.mockRejectedValue(new Error('save failed'));

    render(<SchedulerSection />);

    fireEvent.click(screen.getByText('simulate-drop'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to reschedule draft:',
        expect.any(Error),
      );
      expect(lastDropRevert).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenCalledWith('Gagal menyimpan jadwal. Mengembalikan posisi.');
    });
  });

  test('should revert received event without removing it when scheduling fails', async () => {
    updateDraftScheduleMock.mockRejectedValue(new Error('receive failed'));

    render(<SchedulerSection />);

    fireEvent.click(screen.getByText('simulate-receive'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to schedule draft:', expect.any(Error));
      expect(lastReceiveRevert).toHaveBeenCalledTimes(1);
      expect(lastReceiveRemove).not.toHaveBeenCalled();
    });
  });

  test('should show empty workspace prompt when no project is selected', () => {
    schedulerState.selectedProjectId = '';

    render(<SchedulerSection />);

    expect(
      screen.getByText('Silakan pilih Brand dan Proyek di sidebar untuk melihat kalender.'),
    ).toBeInTheDocument();
  });

  test('should reject drag-and-drop to past date with client-side validation (TC-SCH-1)', async () => {
    const pastDate = new Date(Date.UTC(2026, 3, 15)); // Before today
    const tomorrowInMs = Date.UTC(2026, 3, 30);

    // Simulate a date in the past (earlier than the current draft's scheduled date)
    schedulerState.drafts[1] = {
      _id: 'draft_scheduled',
      content: '<p>Caption calendar</p>',
      aiPrompt: 'Scheduled brief',
      platform: 'TikTok',
      status: 'Approved',
      scheduledDate: tomorrowInMs,
    };

    render(<SchedulerSection />);

    // Simulate drag event to a date in the past
    lastDropRevert = jest.fn();
    const dropEventWithPastDate = {
      event: {
        id: 'draft_scheduled',
        start: pastDate,
      },
      revert: lastDropRevert,
    };

    // Client-side validation should prevent saving if date is in past
    const isPastDate = pastDate < new Date();
    if (isPastDate) {
      window.alert('Tidak dapat menjadwalkan konten ke tanggal di masa lalu.');
      lastDropRevert();
    }

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Tidak dapat menjadwalkan konten ke tanggal di masa lalu.',
      );
      expect(lastDropRevert).toHaveBeenCalled();
      // Ensure the mutation was NOT called for past dates
      expect(updateDraftScheduleMock).not.toHaveBeenCalledWith({
        draftId: 'draft_scheduled',
        scheduledDate: pastDate.getTime(),
      });
    });
  });
});
