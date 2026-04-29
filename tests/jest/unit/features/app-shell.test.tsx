import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const apiMock = {
  users: { getCurrentUser: 'users.getCurrentUser' },
  agencies: { getAgency: 'agencies.getAgency' },
  brands: { getBrands: 'brands.getBrands' },
  projects: { getProjects: 'projects.getProjects' },
  notifications: {
    getNotifications: 'notifications.getNotifications',
    markAsRead: 'notifications.markAsRead',
  },
};

const queryState = {
  currentUser: { _id: 'user_1', name: 'Alya', role: 'Admin', agencyId: 'agency_1' },
  agency: { _id: 'agency_1', tokenQuotaRemaining: 800, name: 'Agency One' },
  brands: [
    { _id: 'brand_1', name: 'Brand One' },
    { _id: 'brand_2', name: 'Brand Two' },
  ],
  projects: [{ _id: 'project_1', name: 'Project One' }],
  notifications: [
    {
      _id: 'notif_1',
      title: 'Draft Status Updated',
      message: 'Your draft has been moved to Review.',
      isRead: false,
      createdAt: Date.UTC(2026, 3, 25, 8, 30),
    },
  ],
};

const workspaceState = {
  selectedBrandId: '',
  selectedProjectId: '',
  setSelectedBrandId: jest.fn(),
  setSelectedProjectId: jest.fn(),
};

const markAsReadMutation = jest.fn();

jest.mock('@/convex/_generated/api', () => ({
  api: apiMock,
}));

jest.mock('convex/react', () => ({
  useQuery: (ref: string) => {
    if (ref === apiMock.users.getCurrentUser) return queryState.currentUser;
    if (ref === apiMock.agencies.getAgency) return queryState.agency;
    if (ref === apiMock.brands.getBrands) return queryState.brands;
    if (ref === apiMock.projects.getProjects) return queryState.projects;
    if (ref === apiMock.notifications.getNotifications) return queryState.notifications;
    return null;
  },
  useMutation: () => markAsReadMutation,
}));

jest.mock('@/src/components/kitalaku/workspace-context', () => ({
  useWorkspace: () => workspaceState,
}));

const { AppShell } = require('@/src/components/kitalaku/app-shell');

describe('AppShell', () => {
  beforeEach(() => {
    queryState.currentUser = { _id: 'user_1', name: 'Alya', role: 'Admin', agencyId: 'agency_1' };
    queryState.notifications = [
      {
        _id: 'notif_1',
        title: 'Draft Status Updated',
        message: 'Your draft has been moved to Review.',
        isRead: false,
        createdAt: Date.UTC(2026, 3, 25, 8, 30),
      },
    ];
    workspaceState.selectedBrandId = '';
    workspaceState.selectedProjectId = '';
    workspaceState.setSelectedBrandId.mockReset();
    workspaceState.setSelectedProjectId.mockReset();
    markAsReadMutation.mockReset();
  });

  test('should auto-select the first brand and project for admin users', async () => {
    render(
      <AppShell active="Dasbor">
        <div>Dashboard body</div>
      </AppShell>,
    );

    expect(screen.getByText('Kuota AI')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();

    await waitFor(() => {
      expect(workspaceState.setSelectedBrandId).toHaveBeenCalledWith('brand_1');
      expect(workspaceState.setSelectedProjectId).toHaveBeenCalledWith('project_1');
    });
  });

  test('should show settings access for creative managers', () => {
    queryState.currentUser = {
      _id: 'user_3',
      name: 'Nadia',
      role: 'Creative Manager',
      agencyId: 'agency_1',
    };

    render(
      <AppShell active="Dasbor">
        <div>Manager dashboard</div>
      </AppShell>,
    );

    expect(screen.getByLabelText('Buka pengaturan')).toBeInTheDocument();
    expect(screen.getByText('Kuota AI')).toBeInTheDocument();
  });

  test('should restrict navigation and hide admin controls for clients', () => {
    queryState.currentUser = { _id: 'user_2', name: 'Rina', role: 'Client', agencyId: 'agency_1' };

    render(
      <AppShell active="Dasbor">
        <div>Client dashboard</div>
      </AppShell>,
    );

    expect(screen.getAllByText('Dasbor').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Penjadwal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Persetujuan & Analitik').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Perencana AI')).toHaveLength(0);
    expect(screen.queryAllByText('Kuota AI')).toHaveLength(0);
    expect(screen.queryByLabelText('Buka pengaturan')).not.toBeInTheDocument();
  });

  test('should reset selected project when brand changes', () => {
    workspaceState.selectedBrandId = 'brand_1';
    workspaceState.selectedProjectId = 'project_1';

    render(
      <AppShell active="Dasbor">
        <div>Dashboard body</div>
      </AppShell>,
    );

    fireEvent.change(screen.getByDisplayValue('Brand One'), {
      target: { value: 'brand_2' },
    });

    expect(workspaceState.setSelectedBrandId).toHaveBeenCalledWith('brand_2');
    expect(workspaceState.setSelectedProjectId).toHaveBeenCalledWith('');
  });

  test('should open the notification drawer and mark an item as read', async () => {
    render(
      <AppShell active="Dasbor">
        <div>Dashboard body</div>
      </AppShell>,
    );

    fireEvent.click(screen.getByLabelText('Buka notifikasi'));

    expect(screen.getByText('Notifikasi')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Draft Status Updated'));

    await waitFor(() => {
      expect(markAsReadMutation).toHaveBeenCalledWith({ notificationId: 'notif_1' });
    });
  });

  test('should show empty state when there are no notifications', () => {
    queryState.notifications = [];

    render(
      <AppShell active="Dasbor">
        <div>Dashboard body</div>
      </AppShell>,
    );

    fireEvent.click(screen.getByLabelText('Buka notifikasi'));
    expect(screen.getByText('Belum ada notifikasi.')).toBeInTheDocument();
  });
});
