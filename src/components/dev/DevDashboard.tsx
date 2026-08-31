import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  KanbanSquare,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  Lock,
  Plus,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';
import { Project, Task } from '../../types';

interface DevDashboardProps {
  onOpenKanban: (projectId: string) => void;
  onOpenCreateTask: (projectId: string) => void;
}

export const DevDashboard: React.FC<DevDashboardProps> = ({
  onOpenKanban,
  onOpenCreateTask,
}) => {
  const {
    currentUser,
    getAccessibleProjects,
    tasks,
    timeLogs,
    users,
    invoices,
    getDevRate,
    getDevContracts,
    getDevInvoices,
    setDevTab,
    setSelectedProjectId,
  } = useApp();

  if (!currentUser) return null;

  const assignedProjects = getAccessibleProjects();
  const projectIds = new Set(assignedProjects.map((p) => p.id));

  // Filter tasks in assigned projects
  const myProjectsTasks = tasks.filter((t) => projectIds.has(t.project_id));
  const tasksAssignedToMe = myProjectsTasks.filter((t) => t.assigned_to === currentUser.id);
  const myPendingTasks = tasksAssignedToMe.filter((t) => t.status !== 'DONE');
  const myInReviewTasks = tasksAssignedToMe.filter((t) => t.status === 'REVIEW');

  // Time logged by me
  const myTimeLogs = timeLogs.filter((l) => l.user_id === currentUser.id);
  const myTotalHours = myTimeLogs.reduce((sum, l) => sum + l.hours, 0);

  // Contracts and rates
  const myContracts = getDevContracts ? getDevContracts(currentUser.id) : [];
  const totalContractedAmount = myContracts.reduce((sum, c) => sum + c.total_amount_ht, 0);
  const rateConfig = getDevRate ? getDevRate(currentUser.id) : { hourly_rate: 65, daily_rate: 480, iban_masked: '', legal_status: '' };

  return (
    <div id="dev-dashboard-view" className="space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Espace Développeur : {currentUser.name}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700">
              {currentUser.job_title || 'Ingénieur Logiciel'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Suivez vos tâches de sprint, gérez la visibilité client de vos tickets et saisissez vos temps de travail.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-dev-goto-timelog"
            onClick={() => setDevTab('time_tracking')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-300 transition-colors shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Saisir du Temps
          </button>
          {assignedProjects.length > 0 && (
            <button
              id="btn-dev-quick-kanban"
              onClick={() => {
                setSelectedProjectId(assignedProjects[0].id);
                setDevTab('kanban');
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <KanbanSquare className="w-4 h-4" />
              Ouvrir le Kanban
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projets Assignés</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {assignedProjects.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Projets et missions actives</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mes Tâches Actives</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
            {myPendingTasks.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {myInReviewTasks.length} en attente de revue de code
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mon Temps Saisi</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 font-mono">
            {myTotalHours} h
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Sur {myTimeLogs.length} sessions enregistrées</p>
        </div>
      </div>

      {/* Remuneration & Payout Quick Banner */}
      {(() => {
        const myPayouts = invoices.filter(
          (i) => i.type === 'DEV_PAYOUT' && i.dev_id === currentUser.id
        );
        const pendingAmount = myPayouts
          .filter((i) => i.status !== 'PAID')
          .reduce((sum, i) => sum + i.amount_ttc, 0);

        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Rémunération & Forfaits</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    {rateConfig.hourly_rate} € / h équiv.
                  </span>
                  {totalContractedAmount > 0 && (
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                      {totalContractedAmount.toLocaleString('fr-FR')} € HT contractualisés
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Valeur temps tracké : <strong className="font-mono text-slate-900">{(myTotalHours * rateConfig.hourly_rate).toLocaleString('fr-FR')} €</strong> • En attente de virement : <strong className="font-mono text-amber-700">{pendingAmount.toLocaleString('fr-FR')} €</strong>
                </p>
              </div>
            </div>

            <button
              id="btn-dev-dash-goto-finance"
              onClick={() => setDevTab('finance')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Espace Honoraires <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      {/* Assigned Projects List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-600" />
          Vos Projets Actifs ({assignedProjects.length})
        </h2>

        {assignedProjects.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs shadow-xs">
            Vous n'avez aucun projet assigné pour le moment. Contactez un administrateur.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedProjects.map((project) => {
              const projectTasks = tasks.filter((t) => t.project_id === project.id);
              const myTasksInProject = projectTasks.filter((t) => t.assigned_to === currentUser.id);
              const client = users.find((u) => u.id === project.client_id);

              return (
                <div
                  key={project.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition-all flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{project.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Client : <strong className="text-slate-800">{client ? client.name : 'N/A'}</strong></span>
                      <span className="font-mono text-slate-900">{project.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${project.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {myTasksInProject.length} tâche(s) pour vous ({projectTasks.length} au total)
                    </span>
                    <button
                      id={`btn-open-kanban-for-${project.id}`}
                      onClick={() => onOpenKanban(project.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <KanbanSquare className="w-3.5 h-3.5" />
                      Tableau Kanban
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Urgent / Assigned Tasks section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          Mes Tâches Assignées en Cours
        </h2>

        {tasksAssignedToMe.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Aucune tâche assignée pour le moment.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasksAssignedToMe.map((task) => {
              const proj = assignedProjects.find((p) => p.id === task.project_id);
              return (
                <div key={task.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs">{task.title}</span>
                      {task.is_client_visible ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                          <Eye className="w-2.5 h-2.5" /> Visible Client
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <Lock className="w-2.5 h-2.5" /> Interne
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Projet : <strong className="text-slate-700">{proj?.name || 'Projet'}</strong></span>
                      {task.due_date && <span>• Échéance : {new Date(task.due_date).toLocaleDateString('fr-FR')}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {task.status}
                    </span>
                    <button
                      id={`btn-view-task-${task.id}`}
                      onClick={() => onOpenKanban(task.project_id)}
                      className="text-xs text-indigo-700 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      Kanban <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
