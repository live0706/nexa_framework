import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  Eye,
  Lock,
  Calendar,
  CheckCircle2,
  ListPlus,
} from 'lucide-react';
import { TaskStatus, TaskPriority } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
}) => {
  const {
    currentUser,
    getAccessibleProjects,
    createTask,
    getProjectDevs,
  } = useApp();

  const accessibleProjects = getAccessibleProjects();

  const [projectId, setProjectId] = useState<string>(
    defaultProjectId || accessibleProjects[0]?.id || ''
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [isClientVisible, setIsClientVisible] = useState<boolean>(true);
  const [dueDate, setDueDate] = useState<string>('');

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    } else if (accessibleProjects.length > 0 && !projectId) {
      setProjectId(accessibleProjects[0].id);
    }
  }, [defaultProjectId, accessibleProjects]);

  if (!isOpen) return null;

  const projectDevs = projectId ? getProjectDevs(projectId) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    createTask({
      project_id: projectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      is_client_visible: isClientVisible,
      created_by: currentUser?.id || 'usr_dev_1',
      assigned_to: assignedTo || undefined,
      due_date: dueDate || undefined,
      logged_hours: 0,
    });

    setTitle('');
    setDescription('');
    setStatus('TODO');
    setPriority('MEDIUM');
    setDueDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <div
        id="create-task-modal"
        className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-slate-900" />
            <h3 className="font-bold text-slate-900 text-sm">Créer une Tâche Technique</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {accessibleProjects.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              <p className="font-semibold mb-1">Aucun projet actif</p>
              <p>Veuillez d'abord créer un projet depuis le tableau de bord avant d'y ajouter des tâches.</p>
            </div>
          ) : (
            <>
              {/* Project select */}
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Projet *</label>
                <select
                  id="select-task-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  {accessibleProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Title */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1">Intitulé de la Tâche *</label>
            <input
              id="input-new-task-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Implémentation du protocole d’authentification JWT"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1">Description & Spécifications</label>
            <textarea
              id="textarea-new-task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Critères d'acceptation, consignes techniques..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 leading-relaxed"
            />
          </div>

          {/* Assignee & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-semibold mb-1">Assigner à</label>
              <select
                id="select-new-task-assignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="">Non assigné</option>
                {projectDevs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.job_title || 'Dev'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1">Priorité</label>
              <select
                id="select-new-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="LOW">Normal (Low)</option>
                <option value="MEDIUM">Moyen (Medium)</option>
                <option value="HIGH">Urgent (High)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-semibold mb-1">Colonne Initiale</label>
              <select
                id="select-new-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="REVIEW">En Revue</option>
                <option value="DONE">Terminé</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1">Échéance</label>
              <input
                id="input-new-task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Crucial RBAC Toggle: Visible Client vs Interne */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                {isClientVisible ? (
                  <Eye className="w-4 h-4 text-sky-600" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-500" />
                )}
                Visibilité de la tâche
              </span>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="toggle-client-visible-task-checkbox"
                  type="checkbox"
                  checked={isClientVisible}
                  onChange={(e) => setIsClientVisible(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              {isClientVisible
                ? '✅ Visible Client : Le client pourra suivre l’état d’avancement de cette fonctionnalité dans son portail.'
                : '🔒 Interne : Réservé exclusivement à l’équipe technique et aux administrateurs (invisible pour le client).'}
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              id="btn-submit-create-task"
              type="submit"
              disabled={accessibleProjects.length === 0}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Créer la tâche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
