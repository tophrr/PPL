'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppShell } from '@/src/components/kitalaku/app-shell';
import { GlassPanel } from '@/src/components/kitalaku/primitives';
import { Id } from '@/convex/_generated/dataModel';

export default function SettingsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const brands = useQuery(api.brands.getBrands) || [];

  // Basic states for creating a new Brand
  const [newBrandName, setNewBrandName] = useState('');
  const createBrand = useMutation(api.brands.createBrand);

  // Basic states for creating a new Project
  const [selectedBrandForProject, setSelectedBrandForProject] = useState<Id<'brands'> | ''>('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const createProject = useMutation(api.projects.createProject);

  const projects =
    useQuery(
      api.projects.getProjects,
      selectedBrandForProject ? { brandId: selectedBrandForProject as Id<'brands'> } : 'skip',
    ) || [];

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;
    try {
      await createBrand({
        name: newBrandName,
        agencyId: currentUser?.agencyId || ('jh78f0d87dfg' as Id<'agencies'>), // Temporary fallback if agencyId isn't strictly set yet
        clientIds: [],
      });
      setNewBrandName('');
      alert('Brand created');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !selectedBrandForProject) return;
    try {
      await createProject({
        name: newProjectName,
        brandId: selectedBrandForProject as Id<'brands'>,
        description: newProjectDesc,
      });
      setNewProjectName('');
      setNewProjectDesc('');
      alert('Project created');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <AppShell active="Settings">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--slate-900)]">Workspace Settings</h2>
          <p className="mt-1 text-sm text-[var(--slate-500)]">
            Manage brands, projects, and team access.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Brand Management */}
          <GlassPanel className="p-6">
            <h3 className="text-lg font-semibold text-[var(--slate-900)]">Brands</h3>

            <form onSubmit={handleCreateBrand} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--slate-900)]">
                  New Brand Name
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--slate-200)] px-4 py-2 text-sm outline-none"
                  placeholder="Acme Corp"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[var(--slate-900)] px-4 py-2 text-sm text-white"
              >
                Create Brand
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-[var(--slate-500)]">Existing Brands</h4>
              {brands.length === 0 ? (
                <p className="text-xs text-[var(--slate-400)]">No brands found.</p>
              ) : null}
              {brands.map((b) => (
                <div
                  key={b._id}
                  className="rounded-xl border border-[var(--slate-150)] p-3 text-sm flex justify-between"
                >
                  <span>{b.name}</span>
                  <span className="text-xs text-[var(--slate-500)]">
                    {b.isArchived ? 'Archived' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Project Management */}
          <GlassPanel className="p-6">
            <h3 className="text-lg font-semibold text-[var(--slate-900)]">Projects</h3>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--slate-900)]">Select Brand</label>
                <select
                  value={selectedBrandForProject}
                  onChange={(e) => setSelectedBrandForProject(e.target.value as Id<'brands'>)}
                  className="mt-2 w-full rounded-xl border border-[var(--slate-200)] px-4 py-2 text-sm outline-none"
                >
                  <option value="">-- Select --</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--slate-900)]">
                  New Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--slate-200)] px-4 py-2 text-sm outline-none"
                  placeholder="Q3 Campaign"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--slate-900)]">Description</label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--slate-200)] px-4 py-2 text-sm outline-none"
                  placeholder="Optional description"
                />
              </div>
              <button
                type="submit"
                disabled={!selectedBrandForProject}
                className="rounded-xl bg-[var(--slate-900)] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Create Project
              </button>
            </form>

            {selectedBrandForProject && (
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium text-[var(--slate-500)]">Projects for Brand</h4>
                {projects.length === 0 ? (
                  <p className="text-xs text-[var(--slate-400)]">No projects found.</p>
                ) : null}
                {projects.map((p) => (
                  <div
                    key={p._id}
                    className="rounded-xl border border-[var(--slate-150)] p-3 text-sm flex justify-between"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-[var(--slate-500)]">
                      {p.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      </div>
    </AppShell>
  );
}
