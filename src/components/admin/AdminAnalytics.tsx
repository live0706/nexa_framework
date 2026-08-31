import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { projects, users, tasks, timeLogs } = useApp();

  const devs = users.filter((u) => u.role === 'DEV');
  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);

  // Group hours by project
  const hoursPerProject = projects.map((p) => {
    const projectLogs = timeLogs.filter((l) => l.project_id === p.id);
    const total = projectLogs.reduce((sum, l) => sum + l.hours, 0);
    return {
      project: p,
      hours: total,
      logsCount: projectLogs.length,
    };
  });

  // Group hours by developer
  const hoursPerDev = devs.map((dev) => {
    const devLogs = timeLogs.filter((l) => l.user_id === dev.id);
    const total = devLogs.reduce((sum, l) => sum + l.hours, 0);
    return {
      dev,
      hours: total,
      logsCount: devLogs.length,
    };
  });

  return (
    <div id="admin-analytics-view" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Métriques d'Équipe & Suivi des Temps</h1>
        <p className="text-xs text-slate-500 mt-1">
          Analyse de l'effort technique consenti par projet et répartition de la charge de travail.
        </p>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Heures Traçées</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">{totalHours} h</div>
          <p className="text-[11px] text-slate-500 mt-1">Cumul sur l'ensemble des projets actifs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre de Saisies</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">{timeLogs.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Entrées de time tracking validées</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Moyenne par Développeur</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 font-mono">
            {devs.length > 0 ? (totalHours / devs.length).toFixed(1) : 0} h
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Charge moyenne répartie sur {devs.length} ingénieurs</p>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hours per project */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Ventilation des heures par Projet</h3>
          <p className="text-xs text-slate-500 mb-4">Volume horaire total consommé</p>

          <div className="space-y-4">
            {hoursPerProject.map(({ project, hours, logsCount }) => {
              const percentage = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0;
              return (
                <div key={project.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{project.name}</span>
                    <span className="font-mono text-slate-900 font-bold">{hours} h ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hours per Developer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Temps saisi par Développeur</h3>
          <p className="text-xs text-slate-500 mb-4">Contribution de chaque membre d'équipe</p>

          <div className="space-y-4">
            {hoursPerDev.map(({ dev, hours, logsCount }) => {
              const percentage = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0;
              return (
                <div key={dev.id} className="flex items-center gap-3">
                  <img src={dev.avatar} alt={dev.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate">{dev.name}</span>
                      <span className="font-mono text-emerald-600 font-bold shrink-0">{hours} h</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
