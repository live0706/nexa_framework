import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Clock,
  MessageSquare,
  Eye,
  Lock,
  UserCheck,
  Calendar,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../../types';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onOpenTimeLog: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onOpenTimeLog,
}) => {
  const {
    currentUser,
    updateTask,
    updateTaskStatus,
    deleteTask,
    addTaskComment,
    users,
    projects,
    getProjectDevs,
  } = useApp();

  const [newCommentText, setNewCommentText] = useState('');
  const [commentIsInternal, setCommentIsInternal] = useState(true);

  if (!task) return null;

  const project = projects.find((p) => p.id === task.project_id);
  const projectDevs = project ? getProjectDevs(project.id) : [];
  const assignee = users.find((u) => u.id === task.assigned_to);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addTaskComment(task.id, newCommentText.trim(), commentIsInternal);
    setNewCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <div
        id="task-detail-modal"
        className="bg-white border border-slate-200 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {project?.name || 'Projet'}
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {task.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {currentUser?.role === 'DEV' || currentUser?.role === 'ADMIN' ? (
              <button
                id="btn-delete-task-modal"
                onClick={() => {
                  if (confirm('Voulez-vous supprimer cette tâche ?')) {
                    deleteTask(task.id);
                    onClose();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Supprimer la tâche"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : null}
            <button
              id="btn-close-task-modal"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">{task.title}</h2>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {task.description || 'Aucune description fournie.'}
            </p>
          </div>

          {/* Controls Bar: Status, Priority, Visibility, Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {/* Status */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Statut Sprint</label>
              <select
                id="select-task-status-modal"
                value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="REVIEW">En Revue</option>
                <option value="DONE">Terminé</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Priorité</label>
              <select
                id="select-task-priority-modal"
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="LOW">Normal (Low)</option>
                <option value="MEDIUM">Moyen (Medium)</option>
                <option value="HIGH">Urgent (High)</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Assigné à</label>
              <select
                id="select-task-assignee-modal"
                value={task.assigned_to || ''}
                onChange={(e) => updateTask(task.id, { assigned_to: e.target.value || undefined })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="">Non assigné</option>
                {projectDevs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility Toggle (Crucial RBAC feature) */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Visibilité de la tâche</label>
              <button
                id="btn-toggle-client-visibility-modal"
                type="button"
                onClick={() => updateTask(task.id, { is_client_visible: !task.is_client_visible })}
                className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  task.is_client_visible
                    ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {task.is_client_visible ? (
                  <>
                    <Eye className="w-3.5 h-3.5" /> Visible Client
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Interne Dev
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Time Tracking Widget on task */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Temps passé : <span className="font-mono text-emerald-600 font-bold">{task.logged_hours || 0} h</span>
                </p>
                <p className="text-[11px] text-slate-500">Saisie simplifiée des heures pour ce ticket</p>
              </div>
            </div>

            <button
              id="btn-trigger-time-log-modal"
              onClick={() => onOpenTimeLog(task)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 shadow-xs"
            >
              + Saisir du temps
            </button>
          </div>

          {/* Internal Developer Comments Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-900" />
                Commentaires & Notes Internes
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {task.comments?.length || 0} note(s)
              </span>
            </div>

            {/* Comments list */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {!task.comments || task.comments.length === 0 ? (
                <p className="text-slate-500 text-[11px] italic py-2">
                  Aucun commentaire. Ajoutez une note technique ou un compte-rendu ci-dessous.
                </p>
              ) : (
                task.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      comment.is_internal
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-sky-50 border-sky-200 text-sky-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <strong className="font-bold text-slate-900">{comment.user_name}</strong>
                        <span className="text-[9px] font-mono px-1 rounded bg-slate-200 text-slate-700">
                          {comment.user_role}
                        </span>
                        {comment.is_internal ? (
                          <span className="text-[9px] text-slate-500 flex items-center gap-0.5 font-medium">
                            <Lock className="w-2.5 h-2.5" /> Interne
                          </span>
                        ) : (
                          <span className="text-[9px] text-sky-700 flex items-center gap-0.5 font-medium">
                            <Eye className="w-2.5 h-2.5" /> Public
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed pt-0.5">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add comment form */}
            <form onSubmit={handleAddComment} className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Ajouter une note :</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={commentIsInternal}
                    onChange={(e) => setCommentIsInternal(e.target.checked)}
                    className="rounded border-slate-300 bg-white text-slate-900 focus:ring-0"
                  />
                  <span>Note interne (réservée à l'équipe)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  id="input-new-task-comment"
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Écrire un commentaire technique, une remarque ou un compte-rendu..."
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                />
                <button
                  id="btn-send-task-comment"
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
