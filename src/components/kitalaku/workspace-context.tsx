'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';

type WorkspaceContextType = {
  selectedBrandId: Id<'brands'> | '';
  setSelectedBrandId: (id: Id<'brands'> | '') => void;
  selectedProjectId: Id<'projects'> | '';
  setSelectedProjectId: (id: Id<'projects'> | '') => void;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [selectedBrandId, setSelectedBrandId] = useState<Id<'brands'> | ''>('');
  const [selectedProjectId, setSelectedProjectId] = useState<Id<'projects'> | ''>('');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const savedBrand = localStorage.getItem('kitalaku_brandId');
    const savedProject = localStorage.getItem('kitalaku_projectId');
    if (savedBrand) setSelectedBrandId(savedBrand as Id<'brands'>);
    if (savedProject) setSelectedProjectId(savedProject as Id<'projects'>);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (selectedBrandId) {
      localStorage.setItem('kitalaku_brandId', selectedBrandId);
    } else {
      localStorage.removeItem('kitalaku_brandId');
    }
  }, [selectedBrandId]);

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('kitalaku_projectId', selectedProjectId);
    } else {
      localStorage.removeItem('kitalaku_projectId');
    }
  }, [selectedProjectId]);

  return (
    <WorkspaceContext.Provider
      value={{
        selectedBrandId,
        setSelectedBrandId,
        selectedProjectId,
        setSelectedProjectId,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
