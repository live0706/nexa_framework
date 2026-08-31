import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Clock, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types';

interface TimeLogModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TimeLogModal: React.FC<TimeLogModalProps> = ({ task, isOpen, onClose }) => {
  const { logTime, projects } = useApp();

  const [hours, setHours] = useState<number>(2);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isOpen || !task) return null;

  const project = projects.find((p) => p.id === task.project_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hours <= 0) return;

    logTime({
      project_id: task.project_id,
      task_id: task.id,
      hours: Number(hours),
      description: description.trim() || 'Session de travail technique',
      date,
    });

    setDescription('');
    setHours(2);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <div
        id="quick-time-log-modal"
        className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-900" />
            <h3 className="font-bold text-slate-900 text-sm">Saisir du Temps sur la Tâche</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500">Tâche ciblée :</p>
            <p className="font-bold text-slate-900 text-xs">{task.title}</p>
            <p className="text-[10px] text-slate-500 font-mono">Projet : {project?.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-semibold mb-1">Nombre d'heures</label>
              <input
                id="input-quick-log-hours"
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
                id="input-quick-log-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-1">Description / Travail effectué</label>
            <textarea
              id="textarea-quick-log-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex: Implémentation du composant, correction d'un bug sur le scroll..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              id="btn-submit-quick-time-log"
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Valider la Saisie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
