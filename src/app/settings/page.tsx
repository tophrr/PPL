'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppShell } from '@/src/components/kitalaku/app-shell';
import { GlassPanel } from '@/src/components/kitalaku/primitives';
import { Id } from '@/convex/_generated/dataModel';
import { useWorkspace } from '@/src/components/kitalaku/workspace-context';

export default function SettingsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const brands = useQuery(api.brands.getBrands) || [];

  const [newBrandName, setNewBrandName] = useState('');
  const createBrand = useMutation(api.brands.createBrand);

  const {
    selectedBrandId: selectedBrandForProject,
    setSelectedBrandId: setSelectedBrandForProject,
    selectedProjectId,
    setSelectedProjectId,
  } = useWorkspace();

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const createProject = useMutation(api.projects.createProject);

  const archiveProject = useMutation(api.projects.archiveProject);
  const softDeleteProject = useMutation(api.projects.softDeleteProject);
  const archiveBrand = useMutation(api.brands.archiveBrand);
  const softDeleteBrand = useMutation(api.brands.softDeleteBrand);

  // Team Management states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Creative Manager' | 'Creator' | 'Client'>(
    'Creator',
  );
  const inviteUser = useMutation(api.users.inviteUserByEmail);
  const updateUserRole = useMutation(api.users.updateUserRole);

  const agencyUsers =
    useQuery(
      api.users.getAgencyUsers,
      currentUser?.agencyId ? { agencyId: currentUser.agencyId } : 'skip',
    ) || [];

  const projects =
    useQuery(
      api.projects.getProjects,
      selectedBrandForProject ? { brandId: selectedBrandForProject as Id<'brands'> } : 'skip',
    ) || [];

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;
    try {
      if (!currentUser?.agencyId) {
        throw new Error('You must belong to an agency to create a brand.');
      }
      await createBrand({
        name: newBrandName,
        agencyId: currentUser.agencyId,
        clientIds: [],
      });
      setNewBrandName('');
      alert('Brand created');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !currentUser?.agencyId) return;
    try {
      await inviteUser({
        email: inviteEmail,
        agencyId: currentUser.agencyId,
        role: inviteRole,
      });
      setInviteEmail('');
      alert('User added to agency.');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUpdateRole = async (userId: Id<'users'>, role: string) => {
    try {
      await updateUserRole({
        userId,
        role: role as 'Admin' | 'Creative Manager' | 'Creator' | 'Client',
      });
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
                  className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--slate-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition-all duration-200 focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] hover:border-[var(--slate-300)]"
                  placeholder="Acme Corp"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-[var(--slate-900)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(30,41,59,0.12)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(30,41,59,0.18)]"
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
                  className="rounded-2xl border border-[var(--slate-200)] bg-white/60 p-4 text-sm flex justify-between items-center shadow-sm"
                >
                  <span>{b.name}</span>
                  <div className="flex items-center gap-2">
                    {!b.isArchived && (
                      <button
                        onClick={() => archiveBrand({ brandId: b._id })}
                        className="text-[10px] font-bold uppercase text-[var(--slate-400)] hover:text-[var(--purple-strong)]"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Move brand to trash? It will be deleted in 30 days.')) {
                          softDeleteBrand({ brandId: b._id });
                        }
                      }}
                      className="text-[10px] font-bold uppercase text-red-300 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
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
                  className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--slate-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition-all duration-200 focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] hover:border-[var(--slate-300)]"
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
                  className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--slate-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition-all duration-200 focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] hover:border-[var(--slate-300)]"
                  placeholder="Q3 Campaign"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--slate-900)]">Description</label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--slate-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition-all duration-200 focus:border-[var(--purple-border)] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] hover:border-[var(--slate-300)]"
                  placeholder="Optional description"
                />
              </div>
              <button
                type="submit"
                disabled={!selectedBrandForProject}
                className="rounded-2xl bg-[var(--slate-900)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(30,41,59,0.12)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(30,41,59,0.18)] disabled:opacity-50 disabled:hover:transform-none disabled:hover:shadow-[0_8px_20px_rgba(30,41,59,0.12)]"
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
                    className="rounded-2xl border border-[var(--slate-200)] bg-white/60 p-4 text-sm flex justify-between items-center shadow-sm"
                  >
                    <span>{p.name}</span>
                    <div className="flex items-center gap-2">
                      {!p.isArchived && (
                        <button
                          onClick={() => archiveProject({ projectId: p._id })}
                          className="text-[10px] font-bold uppercase text-[var(--slate-400)] hover:text-[var(--purple-strong)]"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Move project to trash? It will be deleted in 30 days.')) {
                            softDeleteProject({ projectId: p._id });
                          }
                        }}
                        className="text-[10px] font-bold uppercase text-red-300 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>

        {currentUser?.role === 'Admin' && (
          <GlassPanel className="p-6">
            <h3 className="text-lg font-semibold text-[var(--slate-900)]">Team Access</h3>
            <p className="mt-1 text-sm text-[var(--slate-500)]">
              Invite team members and manage their system roles.
            </p>

            <form onSubmit={handleInviteUser} className="mt-4 flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-[var(--slate-900)]">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--slate-700)] outline-none transition-all duration-200 focus:border-[var(--purple-border)]"
                  placeholder="name@company.com"
                />
              </div>
              <div className="w-[180px]">
                <label className="text-sm font-medium text-[var(--slate-900)]">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="mt-2 w-full rounded-2xl border border-[var(--slate-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--slate-700)] outline-none transition-all duration-200 focus:border-[var(--purple-border)]"
                >
                  <option value="Admin">Admin</option>
                  <option value="Creative Manager">Creative Manager</option>
                  <option value="Creator">Creator</option>
                  <option value="Client">Client</option>
                </select>
              </div>
              <button
                type="submit"
                className="h-[48px] rounded-2xl bg-[var(--slate-900)] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-[1px]"
              >
                Add Member
              </button>
            </form>

            <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--slate-200)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--slate-50)] text-xs font-semibold uppercase tracking-wider text-[var(--slate-500)]">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--slate-200)] bg-white/60">
                  {agencyUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 font-medium text-[var(--slate-900)]">{user.name}</td>
                      <td className="px-6 py-4 text-[var(--slate-600)]">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          disabled={user._id === currentUser._id}
                          onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                          className="rounded-lg border border-[var(--slate-200)] bg-transparent px-2 py-1 text-xs font-semibold outline-none focus:border-[var(--purple-border)]"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Creative Manager">Creative Manager</option>
                          <option value="Creator">Creator</option>
                          <option value="Client">Client</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        )}
      </div>
    </AppShell>
  );
}
