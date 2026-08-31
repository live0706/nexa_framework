import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Shield,
  Code2,
  Building,
  Trash2,
  Search,
  Filter,
  Briefcase,
  Layers,
  KeyRound,
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface AdminUsersTableProps {
  onOpenCreateUser: () => void;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({ onOpenCreateUser }) => {
  const {
    users,
    projects,
    projectMembers,
    updateUser,
    deleteUser,
    currentUser,
    switchUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.job_title && u.job_title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            Admin
          </span>
        );
      case 'DEV':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Code2 className="w-3 h-3 text-emerald-600" />
            Développeur
          </span>
        );
      case 'CLIENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Building className="w-3 h-3 text-amber-600" />
            Client
          </span>
        );
    }
  };

  const getAssignedProjectsCount = (user: User) => {
    if (user.role === 'ADMIN') {
      return `${projects.length} (Totalité)`;
    }
    if (user.role === 'DEV') {
      const count = projectMembers.filter((m) => m.user_id === user.id).length;
      return `${count} projet${count > 1 ? 's' : ''}`;
    }
    if (user.role === 'CLIENT') {
      const count = projects.filter((p) => p.client_id === user.id).length;
      return `${count} projet${count > 1 ? 's' : ''}`;
    }
    return '0';
  };

  return (
    <div id="admin-users-table-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestion des Utilisateurs & Rôles RBAC</h1>
          <p className="text-xs text-slate-500 mt-1">
            Création, modification des attributions de rôles (Admin, Dev, Client) et gouvernance des accès.
          </p>
        </div>
        <button
          id="btn-admin-add-user-top"
          onClick={onOpenCreateUser}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter un Utilisateur
        </button>
      </div>

      {/* Toolbar Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3 shadow-xs">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="input-search-users"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, email ou poste..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            id="select-filter-user-role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900 w-full md:w-auto"
          >
            <option value="ALL">Tous les rôles ({users.length})</option>
            <option value="ADMIN">Administrateurs ({users.filter((u) => u.role === 'ADMIN').length})</option>
            <option value="DEV">Développeurs ({users.filter((u) => u.role === 'DEV').length})</option>
            <option value="CLIENT">Clients ({users.filter((u) => u.role === 'CLIENT').length})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-medium">
                <th className="py-3.5 px-4 font-semibold">Utilisateur</th>
                <th className="py-3.5 px-4 font-semibold">Poste / Organisation</th>
                <th className="py-3.5 px-4 font-semibold">Rôle RBAC Actuel</th>
                <th className="py-3.5 px-4 font-semibold">Projets Assignés</th>
                <th className="py-3.5 px-4 font-semibold">Modifier le Rôle</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isMe = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    {/* User profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.name}
                            {isMe && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono border border-slate-200">
                                Vous
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Job title */}
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                      {u.job_title || 'Non renseigné'}
                    </td>

                    {/* Current Role */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRoleBadge(u.role)}
                    </td>

                    {/* Assigned projects count */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded text-[11px] border border-slate-200">
                        {getAssignedProjectsCount(u)}
                      </span>
                    </td>

                    {/* Change Role Live Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        id={`select-role-for-${u.id}`}
                        value={u.role}
                        onChange={(e) => {
                          const newRole = e.target.value as UserRole;
                          updateUser(u.id, { role: newRole });
                        }}
                        className="bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="DEV">DEV</option>
                        <option value="CLIENT">CLIENT</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-impersonate-${u.id}`}
                          onClick={() => switchUser(u.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-medium border border-slate-200 transition-colors shadow-xs"
                          title="Tester l'application avec ce compte"
                        >
                          Incarner
                        </button>
                        {!isMe && (
                          <button
                            id={`btn-delete-user-${u.id}`}
                            onClick={() => {
                              if (confirm(`Êtes-vous certain de vouloir supprimer l'utilisateur ${u.name} ?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
