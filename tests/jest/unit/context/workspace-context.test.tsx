import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import { WorkspaceProvider, useWorkspace } from '@/src/components/kitalaku/workspace-context';

function WorkspaceConsumer() {
  const { selectedBrandId, selectedProjectId, setSelectedBrandId, setSelectedProjectId } =
    useWorkspace();

  return (
    <div>
      <span data-testid="brand">{selectedBrandId || 'empty-brand'}</span>
      <span data-testid="project">{selectedProjectId || 'empty-project'}</span>
      <button onClick={() => setSelectedBrandId('brand_2' as never)}>set-brand</button>
      <button onClick={() => setSelectedProjectId('project_2' as never)}>set-project</button>
      <button
        onClick={() => {
          setSelectedBrandId('');
          setSelectedProjectId('');
        }}
      >
        clear
      </button>
    </div>
  );
}

describe('WorkspaceProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('should hydrate selected brand and project from localStorage', async () => {
    localStorage.setItem('kitalaku_brandId', 'brand_1');
    localStorage.setItem('kitalaku_projectId', 'project_1');

    render(
      <WorkspaceProvider>
        <WorkspaceConsumer />
      </WorkspaceProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('brand')).toHaveTextContent('brand_1');
      expect(screen.getByTestId('project')).toHaveTextContent('project_1');
    });
  });

  test('should persist updates when selected brand or project changes', async () => {
    render(
      <WorkspaceProvider>
        <WorkspaceConsumer />
      </WorkspaceProvider>,
    );

    fireEvent.click(screen.getByText('set-brand'));
    fireEvent.click(screen.getByText('set-project'));

    await waitFor(() => {
      expect(localStorage.getItem('kitalaku_brandId')).toBe('brand_2');
      expect(localStorage.getItem('kitalaku_projectId')).toBe('project_2');
    });
  });

  test('should remove persisted values when selections are cleared', async () => {
    localStorage.setItem('kitalaku_brandId', 'brand_1');
    localStorage.setItem('kitalaku_projectId', 'project_1');

    render(
      <WorkspaceProvider>
        <WorkspaceConsumer />
      </WorkspaceProvider>,
    );

    fireEvent.click(screen.getByText('clear'));

    await waitFor(() => {
      expect(localStorage.getItem('kitalaku_brandId')).toBeNull();
      expect(localStorage.getItem('kitalaku_projectId')).toBeNull();
    });
  });

  test('should throw when useWorkspace is used outside provider', () => {
    expect(() => render(<WorkspaceConsumer />)).toThrow(
      'useWorkspace must be used within a WorkspaceProvider',
    );
  });
});
