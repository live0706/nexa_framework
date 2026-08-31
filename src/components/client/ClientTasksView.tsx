import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  Building2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { TaskStatus } from '../../types';

export const ClientTasksView: React.FC = () => {
  const {
    currentUser,
    getAccessibleProjects,
    selectedProjectId,
    setSelectedProjectId,
    getAccessibleTasks,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const clientProjects = getAccessibleProjects();
  const activeProject =
    clientProjects.find((p) => p.id === selectedProjectId) || clientProjects[0];

  if (!activeProject) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
        <p className="text-xs">Aucun projet actif sélectionné.</p>
      </div>
    );
  }

  // Get strictly client-visible tasks for the active project
  const visibleTasks = getAccessibleTasks(activeProject.id);

  const filteredTasks = visibleTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Terminé & Livré
          </span>
        );
      case 'REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> En Cours de Recette
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3" /> En Développement
          </span>
        );
      case 'TODO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Planifié
          </span>
        );
    }
  };

  return (
    <div id="client-tasks-roadmap-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Planning & Tâches Publiques</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1 font-semibold">
              <Eye className="w-3 h-3" /> Visibilité Client
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Transparence sur l'avancement technique de vos fonctionnalités et livrables.
          </p>
        </div>

        {clientProjects.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">Projet :</label>
            <select
              id="select-roadmap-project"
              value={activeProject.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-white border border-slate-300 font-bold text-xs text-slate-900 rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-900"
            >
              {clientProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Toolbar Search & Status Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3 shadow-xs">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="input-search-client-tasks"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher parmi les fonctionnalités..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            id="select-filter-client-task-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900 w-full md:w-auto"
          >
            <option value="ALL">Tous les statuts ({visibleTasks.length})</option>
            <option value="DONE">Terminé & Livré</option>
            <option value="REVIEW">En Recette</option>
            <option value="IN_PROGRESS">En Développement</option>
            <option value="TODO">Planifié</option>
          </select>
        </div>
      </div>

      {/* Visible Tasks Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-slate-500 text-xs shadow-xs">
            Aucune tâche visible ne correspond aux critères.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-xs">{task.title}</h3>
                  {task.priority === 'HIGH' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Prioritaire
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                    {task.description}
                  </p>
                )}
                {task.due_date && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <Calendar className="w-3 h-3" />
                    Échéance estimée : {new Date(task.due_date).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-3">
                {getStatusBadge(task.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
