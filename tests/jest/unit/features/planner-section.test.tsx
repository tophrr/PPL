import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const apiMock = {
  users: { getCurrentUser: 'users.getCurrentUser' },
  collaborativeLocks: {
    getLock: 'locks.getLock',
    acquireLock: 'locks.acquireLock',
    releaseLock: 'locks.releaseLock',
  },
  brands: { getAgencyQuota: 'brands.getAgencyQuota' },
  ai: { generateDraft: 'ai.generateDraft' },
  drafts: {
    createDraft: 'drafts.createDraft',
    getDraft: 'drafts.getDraft',
    updateDraftContent: 'drafts.updateDraftContent',
    updateDraftStatus: 'drafts.updateDraftStatus',
  },
};

const plannerState = {
  currentUser: { _id: 'user_1', role: 'Creator' },
  contentLock: null as Record<string, any> | null,
  agencyQuota: { tokenQuotaRemaining: 10 },
  draft: null as Record<string, any> | null,
  selectedBrandId: 'brand_1',
  selectedProjectId: 'project_1',
  searchDraftId: null as string | null,
};

const generateDraftAction = jest.fn();
const saveDraftMutation = jest.fn();
const updateDraftMutation = jest.fn();
const updateDraftStatusMutation = jest.fn();
const acquireLockMutation = jest.fn();
const releaseLockMutation = jest.fn();
const routerPushMock = jest.fn();

jest.mock('@/convex/_generated/api', () => ({
  api: apiMock,
}));

jest.mock('convex/react', () => ({
  useQuery: (ref: string) => {
    if (ref === apiMock.users.getCurrentUser) return plannerState.currentUser;
    if (ref === apiMock.collaborativeLocks.getLock) return plannerState.contentLock;
    if (ref === apiMock.brands.getAgencyQuota) return plannerState.agencyQuota;
    if (ref === apiMock.drafts.getDraft) return plannerState.draft;
    return null;
  },
  useAction: () => generateDraftAction,
  useMutation: (ref: string) => {
    if (ref === apiMock.collaborativeLocks.acquireLock) return acquireLockMutation;
    if (ref === apiMock.collaborativeLocks.releaseLock) return releaseLockMutation;
    if (ref === apiMock.drafts.createDraft) return saveDraftMutation;
    if (ref === apiMock.drafts.updateDraftContent) return updateDraftMutation;
    if (ref === apiMock.drafts.updateDraftStatus) return updateDraftStatusMutation;
    return jest.fn();
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPushMock,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () =>
    new URLSearchParams(plannerState.searchDraftId ? `draftId=${plannerState.searchDraftId}` : ''),
}));

jest.mock('@/src/components/kitalaku/workspace-context', () => ({
  useWorkspace: () => ({
    selectedBrandId: plannerState.selectedBrandId,
    selectedProjectId: plannerState.selectedProjectId,
  }),
}));

jest.mock('@/src/components/kitalaku/rich-text-editor', () => ({
  RichTextEditor: ({
    value,
    onChange,
    onAutoSave,
    onFocus,
    onBlur,
    disabled,
  }: {
    value: string;
    onChange: (value: string) => void;
    onAutoSave: (value: string) => void;
    onFocus: () => void;
    onBlur: () => void;
    disabled?: boolean;
  }) => (
    <div>
      <textarea
        aria-label="Editor Draf"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <button onClick={() => onAutoSave(`${value} - autosaved`)}>auto-save</button>
    </div>
  ),
}));

jest.mock('@/src/components/kitalaku/media-uploader', () => ({
  MediaUploader: ({ draftId }: { draftId: string | null }) => (
    <div data-testid="media-uploader">{draftId || 'no-draft'}</div>
  ),
}));

jest.mock('@/src/components/kitalaku/media-item', () => ({
  MediaItem: ({ assetId }: { assetId: string }) => <div>{assetId}</div>,
}));

const { PlannerSection } = require('@/src/components/kitalaku/planner-section');

describe('PlannerSection', () => {
  const audiencePlaceholder = 'Gen Z Perkotaan, Founder Startup, Ibu Rumah Tangga...';
  const topicPlaceholder = 'Peluncuran produk, tips edukasi, respon tren...';
  const goalPlaceholder = 'Engagement, kesadaran brand, penjualan langsung...';

  beforeEach(() => {
    plannerState.currentUser = { _id: 'user_1', role: 'Creator' };
    plannerState.contentLock = null;
    plannerState.agencyQuota = { tokenQuotaRemaining: 10 };
    plannerState.draft = null;
    plannerState.selectedBrandId = 'brand_1';
    plannerState.selectedProjectId = 'project_1';
    plannerState.searchDraftId = null;
    generateDraftAction.mockReset();
    saveDraftMutation.mockReset();
    updateDraftMutation.mockReset();
    updateDraftStatusMutation.mockReset();
    acquireLockMutation.mockReset();
    releaseLockMutation.mockReset();
    routerPushMock.mockReset();
  });

  test('should block generation when required briefing fields are empty', async () => {
    render(<PlannerSection />);

    fireEvent.click(screen.getByText('Hasilkan Draf AI'));

    await waitFor(() => {
      expect(screen.getByText('Target Audiens dan Topik wajib diisi.')).toBeInTheDocument();
    });

    expect(generateDraftAction).not.toHaveBeenCalled();
  });

  test('should show loading state while AI draft generation is pending', async () => {
    let resolvePromise: ((value: string) => void) | undefined;
    generateDraftAction.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolvePromise = resolve;
        }),
    );

    render(<PlannerSection />);

    fireEvent.change(screen.getByPlaceholderText(audiencePlaceholder), {
      target: { value: 'Founder startup' },
    });
    fireEvent.change(screen.getByPlaceholderText(topicPlaceholder), {
      target: { value: 'Peluncuran campaign Q2' },
    });

    fireEvent.click(screen.getByText('Hasilkan Draf AI'));

    expect(screen.getByText('Menyusun konten Anda...')).toBeInTheDocument();

    resolvePromise?.('Caption AI siap publish');

    await waitFor(() => {
      expect(screen.getByLabelText('Editor Draf')).toHaveValue('Caption AI siap publish');
    });
  });

  test('should handle AI generation errors', async () => {
    generateDraftAction.mockRejectedValue(new Error('AI timeout'));

    render(<PlannerSection />);

    fireEvent.change(screen.getByPlaceholderText(audiencePlaceholder), {
      target: { value: 'Founder startup' },
    });
    fireEvent.change(screen.getByPlaceholderText(topicPlaceholder), {
      target: { value: 'Peluncuran campaign Q2' },
    });
    fireEvent.click(screen.getByText('Hasilkan Draf AI'));

    await waitFor(() => {
      expect(screen.getByText('AI timeout')).toBeInTheDocument();
    });
  });

  test('should save, autosave, and move a draft from Draft to Review', async () => {
    generateDraftAction.mockResolvedValue('Caption AI siap publish');
    saveDraftMutation.mockResolvedValue('draft_1');
    updateDraftMutation.mockResolvedValue(undefined);
    updateDraftStatusMutation.mockResolvedValue(undefined);

    plannerState.searchDraftId = 'draft_1';
    plannerState.draft = {
      _id: 'draft_1',
      content: 'Caption AI siap publish',
      status: 'Draft',
      mediaAssetIds: [],
    };

    render(<PlannerSection />);

    fireEvent.change(screen.getByPlaceholderText(audiencePlaceholder), {
      target: { value: 'Founder startup' },
    });
    fireEvent.change(screen.getByPlaceholderText(topicPlaceholder), {
      target: { value: 'Peluncuran campaign Q2' },
    });
    fireEvent.change(screen.getByPlaceholderText(goalPlaceholder), {
      target: { value: 'Lead generation' },
    });

    fireEvent.click(screen.getByText('Hasilkan Draf AI'));

    await waitFor(() => {
      expect(screen.getByText('Simpan ke Proyek')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Simpan ke Proyek'));

    await waitFor(() => {
      expect(saveDraftMutation).toHaveBeenCalledWith({
        brandId: 'brand_1',
        projectId: 'project_1',
        content: 'Caption AI siap publish',
        aiPrompt: 'Audience: Founder startup | Topic: Peluncuran campaign Q2',
        platform: 'Instagram',
      });
    });

    fireEvent.click(screen.getByText('auto-save'));
    fireEvent.click(screen.getByText('Kirim untuk Ditinjau'));

    await waitFor(() => {
      expect(updateDraftMutation).toHaveBeenCalledWith({
        draftId: 'draft_1',
        content: 'Caption AI siap publish - autosaved',
      });
      expect(updateDraftStatusMutation).toHaveBeenCalledWith({
        draftId: 'draft_1',
        status: 'Review',
        revisionNotes: undefined,
      });
    });
  });

  test('should prevent editing when another user owns the content lock', () => {
    plannerState.searchDraftId = 'draft_1';
    plannerState.draft = {
      _id: 'draft_1',
      content: 'Locked draft',
      status: 'Draft',
      mediaAssetIds: [],
    };
    plannerState.contentLock = {
      lockedBy: 'user_2',
      userName: 'Other User',
    };

    render(<PlannerSection />);

    expect(screen.getByText(/Terkunci oleh Other User/)).toBeInTheDocument();
    expect(screen.getByLabelText('Editor Draf')).toBeDisabled();
  });

  test('should disable AI generation when quota is exhausted', () => {
    plannerState.agencyQuota = { tokenQuotaRemaining: 0 };

    render(<PlannerSection />);

    expect(screen.getByRole('button', { name: /hasilkan draf ai/i })).toBeDisabled();
  });

  test('should redirect clients to approval analytics', () => {
    plannerState.currentUser = { _id: 'user_9', role: 'Client' };

    render(<PlannerSection />);

    expect(screen.getByText('Akses Terbatas')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Buka Persetujuan & Analitik'));
    expect(routerPushMock).toHaveBeenCalledWith('/dashboard/approval-analytics');
  });
});
