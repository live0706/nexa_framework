import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  KanbanSquare,
  Plus,
  Eye,
  Lock,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Project } from '../../types';

interface DevKanbanProps {
  onOpenCreateTask: (projectId: string) => void;
  onSelectTaskDetail: (task: Task) => void;
}

export const DevKanban: React.FC<DevKanbanProps> = ({
  onOpenCreateTask,
  onSelectTaskDetail,
}) => {
  const {
    currentUser,
    getAccessibleProjects,
    selectedProjectId,
    setSelectedProjectId,
    tasks,
    updateTaskStatus,
    users,
    getProjectDevs,
  } = useApp();

  const accessibleProjects = getAccessibleProjects();
  const activeProject =
    accessibleProjects.find((p) => p.id === selectedProjectId) || accessibleProjects[0];

  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [filterVisibility, setFilterVisibility] = useState<string>('ALL');

  if (!activeProject) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
        <KanbanSquare className="w-10 h-10 mx-auto mb-2 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-900">Aucun projet assigné</h3>
        <p className="text-xs mt-1">Vous n'avez pas encore été affecté à un projet actif.</p>
      </div>
    );
  }

  // Filter tasks for the selected project
  const projectTasks = tasks.filter((t) => t.project_id === activeProject.id);
  const filteredTasks = projectTasks.filter((t) => {
    const matchesAssignee = filterAssignee === 'ALL' || t.assigned_to === filterAssignee;
    const matchesVisibility =
      filterVisibility === 'ALL' ||
      (filterVisibility === 'CLIENT' && t.is_client_visible) ||
      (filterVisibility === 'INTERNAL' && !t.is_client_visible);
    return matchesAssignee && matchesVisibility;
  });

  const columns: { id: TaskStatus; title: string; color: string; border: string; bg: string }[] = [
    {
      id: 'TODO',
      title: 'À faire',
      color: 'text-slate-700',
      border: 'border-slate-200',
      bg: 'bg-slate-100/60',
    },
    {
      id: 'IN_PROGRESS',
      title: 'En cours',
      color: 'text-indigo-700',
      border: 'border-indigo-200',
      bg: 'bg-indigo-50/40',
    },
    {
      id: 'REVIEW',
      title: 'En Revue (Code Review / QA)',
      color: 'text-amber-800',
      border: 'border-amber-200',
      bg: 'bg-amber-50/40',
    },
    {
      id: 'DONE',
      title: 'Terminé',
      color: 'text-emerald-700',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/40',
    },
  ];

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">URGENT</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 text-amber-800 border border-amber-200">Moyen</span>;
      case 'LOW':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-700 border border-slate-200">Normal</span>;
    }
  };

  const projectDevs = getProjectDevs(activeProject.id);

  const moveTask = (task: Task, direction: 'prev' | 'next') => {
    const order: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const currentIndex = order.indexOf(task.status);
    if (direction === 'prev' && currentIndex > 0) {
      updateTaskStatus(task.id, order[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < order.length - 1) {
      updateTaskStatus(task.id, order[currentIndex + 1]);
    }
  };

  return (
    <div id="dev-kanban-board-view" className="space-y-5">
      {/* Kanban Top Header & Project Picker */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <KanbanSquare className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">Projet :</label>
              <select
                id="select-kanban-project"
                value={activeProject.id}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-white border border-slate-300 font-bold text-sm text-slate-900 rounded-lg px-2.5 py-1 focus:outline-none focus:border-slate-900"
              >
                {accessibleProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.progress_percent}%)
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {projectTasks.length} tâches techniques au sprint
            </p>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Assignee */}
          <select
            id="filter-kanban-assignee"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-900"
          >
            <option value="ALL">Tous les développeurs</option>
            {projectDevs.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name}
              </option>
            ))}
          </select>

          {/* Filter Visibility */}
          <select
            id="filter-kanban-visibility"
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
            className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-900"
          >
            <option value="ALL">Toutes les visibilités</option>
            <option value="CLIENT">Visible Client uniquement</option>
            <option value="INTERNAL">Interne équipe uniquement</option>
          </select>

          {/* Create Task Button */}
          <button
            id="btn-create-task-kanban"
            onClick={() => onOpenCreateTask(activeProject.id)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer une Tâche
          </button>
        </div>
      </div>

      {/* 4 Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.border} ${col.bg} p-3.5 flex flex-col gap-3 min-h-[500px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${col.color}`}>{col.title}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks Cards inside column */}
              <div className="space-y-2.5 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">
                    Aucune tâche
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assignee = users.find((u) => u.id === task.assigned_to);

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTaskDetail(task)}
                        className="bg-white border border-slate-200 hover:border-slate-300 p-3.5 rounded-xl shadow-xs transition-all cursor-pointer group space-y-2.5"
                      >
                        {/* Top card bar: Badges & Visibility */}
                        <div className="flex items-center justify-between gap-1.5">
                          {task.is_client_visible ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-50 text-sky-700 border border-sky-200" title="Visible par le client sur son portail">
                              <Eye className="w-2.5 h-2.5" /> Visible Client
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200" title="Usage interne uniquement">
                              <Lock className="w-2.5 h-2.5" /> Interne
                            </span>
                          )}

                          {getPriorityBadge(task.priority)}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-semibold text-slate-900 text-xs group-hover:text-indigo-700 transition-colors leading-snug">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Footer info: Assignee, Hours, Comments */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            {assignee ? (
                              <div className="flex items-center gap-1.5" title={assignee.name}>
                                <img
                                  src={assignee.avatar}
                                  alt={assignee.name}
                                  className="w-5 h-5 rounded-full object-cover border border-slate-200"
                                />
                                <span className="text-[10px] text-slate-700 font-medium truncate max-w-[70px]">
                                  {assignee.name.split(' ')[0]}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Non assigné</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {(task.logged_hours || 0) > 0 && (
                              <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-0.5" title="Temps passé">
                                <Clock className="w-3 h-3" /> {task.logged_hours}h
                              </span>
                            )}

                            {(task.comments?.length || 0) > 0 && (
                              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5" title="Commentaires">
                                <MessageSquare className="w-3 h-3" /> {task.comments?.length}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Column Shift Buttons */}
                        <div
                          className="pt-1.5 flex items-center justify-between border-t border-slate-100 opacity-70 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            id={`shift-left-task-${task.id}`}
                            disabled={col.id === 'TODO'}
                            onClick={() => moveTask(task, 'prev')}
                            className={`p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-[10px] flex items-center gap-1 transition-colors ${
                              col.id === 'TODO' ? 'invisible' : ''
                            }`}
                          >
                            <ChevronLeft className="w-3 h-3" /> Reculer
                          </button>

                          <button
                            id={`shift-right-task-${task.id}`}
                            disabled={col.id === 'DONE'}
                            onClick={() => moveTask(task, 'next')}
                            className={`p-1 rounded text-slate-500 hover:text-indigo-700 hover:bg-slate-100 text-[10px] flex items-center gap-1 transition-colors ${
                              col.id === 'DONE' ? 'invisible' : ''
                            }`}
                          >
                            Avancer <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
