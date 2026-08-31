import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Edit2,
  Archive,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
  UserCheck,
  Building,
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types';

interface AdminProjectsTableProps {
  onOpenCreateProject: () => void;
  onOpenEditProject: (project: Project) => void;
}

export const AdminProjectsTable: React.FC<AdminProjectsTableProps> = ({
  onOpenCreateProject,
  onOpenEditProject,
}) => {
  const {
    projects,
    users,
    projectMembers,
    tasks,
    milestones,
    archiveProject,
    updateProject,
    setSelectedProjectId,
    setDevTab,
    switchUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesClient = clientFilter === 'ALL' || p.client_id === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const clients = users.filter((u) => u.role === 'CLIENT');
  const devs = users.filter((u) => u.role === 'DEV');

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'EN_COURS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">En cours</span>;
      case 'RECETTE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">En Recette</span>;
      case 'A_VENIR':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">À venir</span>;
      case 'TERMINE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">Terminé</span>;
      case 'ARCHIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">Archivé</span>;
    }
  };

  return (
    <div id="admin-projects-table-view" className="space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestion Intégrale des Projets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Création, modification, affectation des développeurs et association des clients.
          </p>
        </div>
        <button
          id="btn-admin-add-project"
          onClick={onOpenCreateProject}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nouveau Projet
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3 shadow-xs">
        {/* Search input */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="input-search-projects"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par mot-clé, titre ou description..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            id="select-filter-project-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900 w-full md:w-auto"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="EN_COURS">En cours</option>
            <option value="RECETTE">En Recette</option>
            <option value="A_VENIR">À venir</option>
            <option value="TERMINE">Terminé</option>
            <option value="ARCHIVE">Archivé</option>
          </select>
        </div>

        {/* Client filter */}
        <div className="w-full md:w-auto">
          <select
            id="select-filter-project-client"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900 w-full md:w-auto"
          >
            <option value="ALL">Tous les clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Cards / Table */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-xs">
            <p className="text-sm font-semibold">Aucun projet ne correspond à vos critères.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setClientFilter('ALL');
              }}
              className="mt-2 text-xs text-indigo-700 hover:underline font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const client = users.find((u) => u.id === project.client_id);
            const assignedMemberIds = projectMembers
              .filter((m) => m.project_id === project.id)
              .map((m) => m.user_id);
            const assignedDevs = users.filter((u) => assignedMemberIds.includes(u.id));
            const projectTasks = tasks.filter((t) => t.project_id === project.id);
            const projectMilestones = milestones.filter((m) => m.project_id === project.id);

            return (
              <div
                key={project.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xs"
              >
                {/* Left: Project info & description */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{project.name}</span>
                    {getStatusBadge(project.status)}
                    {project.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {project.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    {/* Client attribution */}
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Client :</span>
                      {client ? (
                        <span className="font-medium text-slate-800">{client.name}</span>
                      ) : (
                        <span className="text-rose-600 font-medium">Aucun client</span>
                      )}
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Échéance :</span>
                      <span className="font-mono text-slate-700">
                        {new Date(project.deadline).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {/* Quick counts */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{projectTasks.length} tâches</span>
                      <span>•</span>
                      <span className="text-slate-500">{projectMilestones.length} jalons</span>
                    </div>
                  </div>
                </div>

                {/* Center: Team Avatars & Progress */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 lg:w-56 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  {/* Assigned Devs */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 mr-1">Équipe :</span>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {assignedDevs.length > 0 ? (
                        assignedDevs.map((dev) => (
                          <img
                            key={dev.id}
                            src={dev.avatar}
                            alt={dev.name}
                            title={`${dev.name} (${dev.role})`}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                        ))
                      ) : (
                        <span className="text-[10px] text-amber-700 italic">Aucun dev assigné</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Avancement</span>
                      <span className="font-mono font-bold text-slate-900">{project.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          project.progress_percent >= 80
                            ? 'bg-emerald-600'
                            : project.progress_percent >= 40
                            ? 'bg-indigo-600'
                            : 'bg-amber-600'
                        }`}
                        style={{ width: `${project.progress_percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <button
                    id={`btn-edit-project-${project.id}`}
                    onClick={() => onOpenEditProject(project)}
                    className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-300 shadow-xs"
                    title="Modifier et réassigner"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  {project.status !== 'ARCHIVE' && (
                    <button
                      id={`btn-archive-project-${project.id}`}
                      onClick={() => archiveProject(project.id)}
                      className="p-2 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded-lg text-xs font-medium transition-colors border border-slate-300 hover:border-rose-300 shadow-xs"
                      title="Archiver ce projet"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
