import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const apiMock = {
  users: { getCurrentUser: 'users.getCurrentUser' },
  drafts: {
    getDraftsByAgency: 'drafts.getDraftsByAgency',
    getDashboardStats: 'drafts.getDashboardStats',
    updateDraftStatus: 'drafts.updateDraftStatus',
  },
};

const state = {
  currentUser: { _id: 'user_1', agencyId: 'agency_1', role: 'Admin' },
  drafts: [] as Array<Record<string, any>>,
  stats: { total: 0, approved: 0, review: 0, draft: 0 },
};

const updateDraftStatusMock = jest.fn();

jest.mock('@/convex/_generated/api', () => ({
  api: apiMock,
}));

jest.mock('convex/react', () => ({
  useQuery: (ref: string) => {
    if (ref === apiMock.users.getCurrentUser) return state.currentUser;
    if (ref === apiMock.drafts.getDraftsByAgency) return state.drafts;
    if (ref === apiMock.drafts.getDashboardStats) return state.stats;
    return null;
  },
  useMutation: () => updateDraftStatusMock,
}));

jest.mock('@/src/components/kitalaku/media-item', () => ({
  MediaItem: ({ assetId }: { assetId: string }) => <div data-testid="media-item">{assetId}</div>,
}));

const { AnalyticsDashboard } = require('@/src/components/kitalaku/analytics-dashboard');

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    state.currentUser = { _id: 'user_1', agencyId: 'agency_1', role: 'Admin' };
    state.drafts = [
      {
        _id: 'draft_review',
        _creationTime: Date.UTC(2026, 3, 25),
        content: '<p>Caption review</p>',
        platform: 'Instagram',
        status: 'Review',
        mediaAssetIds: ['asset_1'],
      },
      {
        _id: 'draft_approved',
        _creationTime: Date.UTC(2026, 3, 24),
        content: '<p>Caption approved</p>',
        platform: 'TikTok',
        status: 'Approved',
        mediaAssetIds: [],
      },
    ];
    state.stats = { total: 2, approved: 1, review: 1, draft: 0 };
    updateDraftStatusMock.mockReset();
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    jest.spyOn(window, 'prompt').mockImplementation(() => null);
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
  });

  test('should render metrics and pending review drafts', () => {
    render(<AnalyticsDashboard />);

    expect(screen.getByText('Menunggu Persetujuan')).toBeInTheDocument();
    expect(screen.getByText('1 Tertunda')).toBeInTheDocument();
    expect(screen.getByText('Total Konten')).toBeInTheDocument();
    expect(screen.getByText('50% dari total')).toBeInTheDocument();
  });

  test('should read and persist analytics filter state in localStorage', async () => {
    render(<AnalyticsDashboard />);

    expect(localStorage.getItem).toHaveBeenCalledWith('analytics_start_date');
    expect(localStorage.getItem).toHaveBeenCalledWith('analytics_end_date');

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('analytics_start_date', '');
      expect(localStorage.setItem).toHaveBeenCalledWith('analytics_end_date', '');
    });
  });

  test('should show empty state when there are no drafts in review', () => {
    state.drafts = [
      {
        _id: 'draft_approved',
        _creationTime: Date.UTC(2026, 3, 24),
        content: '<p>Caption approved</p>',
        platform: 'TikTok',
        status: 'Approved',
        mediaAssetIds: [],
      },
    ];
    state.stats = { total: 1, approved: 1, review: 0, draft: 0 };

    render(<AnalyticsDashboard />);

    expect(
      screen.getByText('Semua beres! Tidak ada draf yang perlu ditinjau.'),
    ).toBeInTheDocument();
  });

  test('should approve a selected draft and close the detail panel', async () => {
    updateDraftStatusMock.mockResolvedValue(undefined);

    render(<AnalyticsDashboard />);

    fireEvent.click(screen.getByText('Caption review'));
    fireEvent.click(screen.getByText('Setujui Konten'));

    await waitFor(() => {
      expect(updateDraftStatusMock).toHaveBeenCalledWith({
        draftId: 'draft_review',
        status: 'Approved',
      });
    });

    await waitFor(() => {
      expect(screen.queryByText('Detail Peninjauan')).not.toBeInTheDocument();
    });
  });

  test('should request revision notes and send draft back to Draft status', async () => {
    jest.spyOn(window, 'prompt').mockImplementation(() => 'Tolong revisi CTA');
    updateDraftStatusMock.mockResolvedValue(undefined);

    render(<AnalyticsDashboard />);

    fireEvent.click(screen.getByText('Caption review'));
    fireEvent.click(screen.getByText('Minta Revisi'));

    await waitFor(() => {
      expect(updateDraftStatusMock).toHaveBeenCalledWith({
        draftId: 'draft_review',
        status: 'Draft',
        revisionNotes: 'Tolong revisi CTA',
      });
    });
  });

  test('should alert when approval mutation fails', async () => {
    updateDraftStatusMock.mockRejectedValue(new Error('Gagal menyimpan status'));

    render(<AnalyticsDashboard />);

    fireEvent.click(screen.getByText('Caption review'));
    fireEvent.click(screen.getByText('Setujui Konten'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Gagal menyimpan status');
    });
  });
});
