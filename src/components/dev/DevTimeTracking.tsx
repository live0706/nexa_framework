import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Plus,
  Calendar,
  Briefcase,
  CheckCircle2,
  ListTodo,
  FileText,
} from 'lucide-react';
import { Task } from '../../types';

export const DevTimeTracking: React.FC = () => {
  const {
    currentUser,
    getAccessibleProjects,
    tasks,
    timeLogs,
    logTime,
  } = useApp();

  const accessibleProjects = getAccessibleProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    accessibleProjects[0]?.id || ''
  );
  const projectTasks = tasks.filter((t) => t.project_id === selectedProjectId);

  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    projectTasks[0]?.id || ''
  );
  const [hours, setHours] = useState<number>(2);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Update selected task if project changes
  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    const available = tasks.filter((t) => t.project_id === projId);
    setSelectedTaskId(available[0]?.id || '');
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedTaskId || hours <= 0) return;

    logTime({
      project_id: selectedProjectId,
      task_id: selectedTaskId,
      hours: Number(hours),
      description: description || 'Développement & intégration',
      date,
    });

    setDescription('');
    setHours(2);
  };

  if (!currentUser) return null;

  // Filter logs for current dev
  const myLogs = timeLogs.filter((l) => l.user_id === currentUser.id);
  const totalMyHours = myLogs.reduce((sum, l) => sum + l.hours, 0);

  return (
    <div id="dev-time-tracking-view" className="space-y-6">
      {/* Top Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Saisie & Suivi des Temps Passés</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enregistrez les heures consacrées à vos tâches de développement pour le reporting projet.
        </p>
      </div>

      {/* Main Layout: Form (Left) + History Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Entry Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-900" />
            Nouvelle Saisie d'Heures
          </h2>

          <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
            {/* Project Picker */}
            <div>
              <label className="block text-slate-800 font-semibold mb-1">Projet</label>
              <select
                id="select-timelog-project"
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {accessibleProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Picker */}
            <div>
              <label className="block text-slate-800 font-semibold mb-1">Tâche Associée</label>
              <select
                id="select-timelog-task"
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {projectTasks.length === 0 ? (
                  <option value="">Aucune tâche disponible</option>
                ) : (
                  projectTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.status}] {t.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Hours & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Heures (h)</label>
                <input
                  id="input-timelog-hours"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  required
                  value={hours}
                  onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Date</label>
                <input
                  id="input-timelog-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-800 font-semibold mb-1">Description de l'activité</label>
              <textarea
                id="textarea-timelog-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ex: Implémentation du composant, refactoring des requêtes API, tests unitaires..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 leading-relaxed"
              />
            </div>

            {/* Submit */}
            <button
              id="btn-submit-time-log"
              type="submit"
              disabled={!selectedTaskId || hours <= 0}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Enregistrer le Temps
            </button>
          </form>
        </div>

        {/* Historical Logs List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Historique de mes Saisies</h2>
                <p className="text-xs text-slate-500">Total cumulé : <strong className="text-emerald-600 font-mono">{totalMyHours} h</strong></p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {myLogs.length} saisie{myLogs.length > 1 ? 's' : ''}
              </span>
            </div>

            {myLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                Vous n'avez pas encore enregistré d'heures.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
                {myLogs.map((log) => {
                  const project = accessibleProjects.find((p) => p.id === log.project_id);
                  const task = tasks.find((t) => t.id === log.task_id);

                  return (
                    <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {task?.title || 'Tâche supprimée'}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {project?.name || 'Projet'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {log.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(log.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          +{log.hours} h
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
