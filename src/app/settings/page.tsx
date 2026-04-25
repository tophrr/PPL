'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppShell } from '@/src/components/kitalaku/app-shell';
import { GlassPanel } from '@/src/components/kitalaku/primitives';
import { Id } from '@/convex/_generated/dataModel';
import { useWorkspace } from '@/src/components/kitalaku/workspace-context';
import { IconCheck } from '@/src/components/kitalaku/icons';

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
  const addClientToBrand = useMutation(api.brands.addClientToBrand);
  const removeClientFromBrand = useMutation(api.brands.removeClientFromBrand);

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
      alert('User invited successfully.');
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
    } catch (error: any) {
      alert(error.message);
    }
  };

  const toggleClientAccess = async (
    brandId: Id<'brands'>,
    userId: Id<'users'>,
    hasAccess: boolean,
  ) => {
    try {
      if (hasAccess) {
        await removeClientFromBrand({ brandId, userId });
      } else {
        await addClientToBrand({ brandId, userId });
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const clientsInAgency = agencyUsers.filter((u) => u.role === 'Client');

  return (
    <AppShell active="Settings">
      <div className="space-y-6">
        <header className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--slate-900)]">
            Workspace Settings
          </h2>
          <p className="mt-1 text-sm text-[var(--slate-500)] font-medium">
            Manage your agency's brands, projects, and team permissions.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-2">
          {/* 1. Brand & Client Access Management */}
          <div className="space-y-6">
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--slate-900)]">Brand Management</h3>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--slate-400)]">
                  {brands.length} Brands
                </span>
              </div>

              <form onSubmit={handleCreateBrand} className="flex gap-2">
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="flex-1 rounded-xl border border-[var(--slate-200)] bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--purple-border)]"
                  placeholder="Brand name (e.g. Acme Corp)"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--slate-900)] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--slate-800)]"
                >
                  Add Brand
                </button>
              </form>

              <div className="mt-8 space-y-4">
                {brands.length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed border-[var(--slate-100)] rounded-2xl">
                    <p className="text-sm text-[var(--slate-400)] italic">No brands created yet.</p>
                  </div>
                )}
                {brands.map((brand) => (
                  <div
                    key={brand._id}
                    className="rounded-2xl border border-[var(--slate-200)] bg-white/50 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[var(--slate-800)]">{brand.name}</h4>
                      <div className="flex gap-3">
                        <button
                          onClick={() => archiveBrand({ brandId: brand._id })}
                          className="text-[10px] font-bold uppercase text-[var(--slate-400)] hover:text-[var(--purple-strong)]"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete brand?')) softDeleteBrand({ brandId: brand._id });
                          }}
                          className="text-[10px] font-bold uppercase text-red-300 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[var(--slate-100)]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--slate-400)] mb-3">
                        Client Visibility
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {clientsInAgency.length === 0 ? (
                          <p className="text-[11px] text-[var(--slate-400)] italic">
                            No clients in agency. Add them in Team Access.
                          </p>
                        ) : (
                          clientsInAgency.map((client) => {
                            const hasAccess = brand.clientIds.includes(client._id);
                            return (
                              <button
                                key={client._id}
                                onClick={() => toggleClientAccess(brand._id, client._id, hasAccess)}
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all border',
                                  hasAccess
                                    ? 'bg-[var(--purple-soft)] border-[var(--purple-border)] text-[var(--purple-strong)]'
                                    : 'bg-white border-[var(--slate-200)] text-[var(--slate-500)] hover:border-[var(--slate-300)]',
                                )}
                              >
                                {hasAccess && <IconCheck />}
                                {client.name}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--slate-900)]">Project Catalog</h3>
                <select
                  value={selectedBrandForProject}
                  onChange={(e) => setSelectedBrandForProject(e.target.value as Id<'brands'>)}
                  className="text-xs font-bold bg-white border border-[var(--slate-200)] rounded-lg px-2 py-1 outline-none"
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBrandForProject ? (
                <>
                  <form onSubmit={handleCreateProject} className="space-y-3 mb-6">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full rounded-xl border border-[var(--slate-200)] bg-white px-4 py-2 text-sm outline-none"
                      placeholder="Project name"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        className="flex-1 rounded-xl border border-[var(--slate-200)] bg-white px-4 py-2 text-sm outline-none"
                        placeholder="Description (optional)"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-[var(--slate-900)] px-4 py-2 text-xs font-bold text-white whitespace-nowrap"
                      >
                        New Project
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    {projects.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-[var(--slate-100)] text-sm"
                      >
                        <span className="font-medium">{p.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => archiveProject({ projectId: p._id })}
                            className="text-[10px] font-bold text-[var(--slate-400)]"
                          >
                            Archive
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete?')) softDeleteProject({ projectId: p._id });
                            }}
                            className="text-[10px] font-bold text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center opacity-40">
                  <p className="text-sm italic">Select a brand to manage its projects.</p>
                </div>
              )}
            </GlassPanel>
          </div>

          {/* 2. Team & Role Management */}
          <div className="space-y-6">
            <GlassPanel className="p-6">
              <h3 className="text-lg font-bold text-[var(--slate-900)] mb-2">Team Access</h3>
              <p className="text-xs text-[var(--slate-500)] mb-6">
                Invite members and assign system-wide permissions.
              </p>

              <form
                onSubmit={handleInviteUser}
                className="space-y-4 p-5 rounded-2xl bg-[var(--slate-50)] border border-[var(--slate-100)] mb-8"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--slate-500)]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-xl border border-[var(--slate-200)] bg-white px-4 py-2.5 text-sm outline-none"
                    placeholder="teammate@agency.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--slate-500)]">
                      System Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full rounded-xl border border-[var(--slate-200)] bg-white px-4 py-2.5 text-sm outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Creative Manager">Creative Manager</option>
                      <option value="Creator">Creator</option>
                      <option value="Client">Client</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full h-[46px] rounded-xl bg-[var(--slate-900)] text-sm font-bold text-white shadow-md hover:bg-black transition-all"
                    >
                      Invite Member
                    </button>
                  </div>
                </div>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                  <thead className="text-[10px] font-bold uppercase text-[var(--slate-400)]">
                    <tr>
                      <th className="px-4 pb-2">Name</th>
                      <th className="px-4 pb-2">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agencyUsers.map((user) => (
                      <tr key={user._id} className="bg-white/60 group">
                        <td className="px-4 py-3 rounded-l-2xl border-y border-l border-[var(--slate-100)]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[var(--slate-800)]">{user.name}</span>
                            <span className="text-[11px] text-[var(--slate-500)]">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 rounded-r-2xl border-y border-r border-[var(--slate-100)] text-right">
                          <select
                            value={user.role}
                            disabled={user._id === currentUser?._id}
                            onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                            className="text-xs font-bold bg-white border border-[var(--slate-200)] rounded-lg px-2 py-1.5 outline-none transition-all focus:border-[var(--purple-border)]"
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
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// Helper for conditional classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
