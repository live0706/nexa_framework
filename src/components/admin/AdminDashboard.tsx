import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers,
  DollarSign,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { ProjectStatus } from '../../types';

interface AdminDashboardProps {
  onOpenCreateProject: () => void;
  onOpenCreateUser: () => void;
  onSelectProject: (projectId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenCreateProject,
  onOpenCreateUser,
  onSelectProject,
}) => {
  const {
    projects,
    users,
    tasks,
    milestones,
    timeLogs,
    invoices,
    setAdminTab,
    setDevTab,
    setSelectedProjectId,
  } = useApp();

  // Metrics
  const activeProjects = projects.filter((p) => p.status !== 'ARCHIVE');
  const inProgressProjects = projects.filter((p) => p.status === 'EN_COURS');
  const recetteProjects = projects.filter((p) => p.status === 'RECETTE');
  const totalLoggedHours = timeLogs.reduce((acc, log) => acc + log.hours, 0);
  const pendingMilestones = milestones.filter((m) => m.status === 'PENDING');
  const changesRequestedMilestones = milestones.filter((m) => m.status === 'CHANGES_REQUESTED');

  const avgProgress =
    activeProjects.length > 0
      ? Math.round(
          activeProjects.reduce((acc, p) => acc + p.progress_percent, 0) /
            activeProjects.length
        )
      : 0;

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'EN_COURS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">En cours</span>;
      case 'RECETTE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">En Recette</span>;
      case 'A_VENIR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">À venir</span>;
      case 'TERMINE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Terminé</span>;
      case 'ARCHIVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Archivé</span>;
    }
  };

  return (
    <div id="admin-dashboard-view" className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Tableau de Bord Global Administrateur</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 border border-purple-200 text-purple-700 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3" /> Accès Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervision stratégique de l'ensemble des projets, ressources humaines et jalons clients.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="btn-admin-quick-new-user"
            onClick={onOpenCreateUser}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-300 transition-colors shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-slate-600" />
            + Nouvel Utilisateur
          </button>
          <button
            id="btn-admin-quick-new-project"
            onClick={onOpenCreateProject}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer un Projet
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Projects */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projets Actifs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{activeProjects.length}</div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className="text-emerald-700 font-semibold">{inProgressProjects.length} en cours</span>
              <span>•</span>
              <span className="text-sky-700 font-semibold">{recetteProjects.length} en recette</span>
            </div>
          </div>
        </div>

        {/* Card 2: Average Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progression Moyenne</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{avgProgress}%</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${avgProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Card 3: Time Tracking */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Temps Consommé</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{totalLoggedHours} h</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Sur {tasks.length} tâches ({timeLogs.length} entrées de temps)
            </p>
          </div>
        </div>

        {/* Card 4: Milestones & Client validation status */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jalons & Recettes</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {milestones.filter((m) => m.status === 'VALIDATED').length}/{milestones.length}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              {changesRequestedMilestones.length > 0 ? (
                <span className="text-rose-700 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3 h-3" /> {changesRequestedMilestones.length} modif. requise
                </span>
              ) : (
                <span className="text-slate-500">{pendingMilestones.length} en attente</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Quick Banner */}
      {invoices && invoices.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Synthèse Financière & Trésorerie</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  Temps Réel
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Facturé client : <strong className="font-mono text-slate-800">
                  {invoices.filter((i) => i.type === 'CLIENT_INVOICE').reduce((s, i) => s + i.amount_ttc, 0).toLocaleString('fr-FR')} € TTC
                </strong> • Encaissé : <strong className="font-mono text-emerald-700">
                  {invoices.filter((i) => i.type === 'CLIENT_INVOICE' && i.status === 'PAID').reduce((s, i) => s + i.amount_ttc, 0).toLocaleString('fr-FR')} €
                </strong> • En attente : <strong className="font-mono text-amber-700">
                  {invoices.filter((i) => i.type === 'CLIENT_INVOICE' && i.status !== 'PAID').reduce((s, i) => s + i.amount_ttc, 0).toLocaleString('fr-FR')} €
                </strong>
              </p>
            </div>
          </div>

          <button
            id="btn-admin-dash-goto-finance"
            onClick={() => setAdminTab('finance')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Receipt className="w-3.5 h-3.5" />
            Consulter la Finance <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Projects Overview + Activity / Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Table summary (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Portefeuille des Projets</h2>
              <p className="text-xs text-slate-500">État d'avancement et responsables</p>
            </div>
            <button
              id="btn-admin-see-all-projects"
              onClick={() => setAdminTab('projects')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1"
            >
              Gérer tous les projets <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 my-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Aucun projet pour le moment</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Votre espace est totalement vierge et prêt. Commencez par créer votre premier projet pour assigner des développeurs et des tâches.
              </p>
              <button
                id="btn-admin-empty-create-project"
                onClick={onOpenCreateProject}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Créer un Premier Projet
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium pb-2">
                    <th className="pb-2.5 font-semibold">Projet</th>
                    <th className="pb-2.5 font-semibold">Statut</th>
                    <th className="pb-2.5 font-semibold">Client</th>
                    <th className="pb-2.5 font-semibold">Échéance</th>
                    <th className="pb-2.5 font-semibold">Avancement</th>
                    <th className="pb-2.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((project) => {
                    const client = users.find((u) => u.id === project.client_id);
                    return (
                      <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="font-semibold text-slate-900">{project.name}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{project.description}</div>
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap">
                          {getStatusBadge(project.status)}
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap">
                          <span className="text-slate-800 font-medium">{client ? client.name : 'Non assigné'}</span>
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                          {new Date(project.deadline).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-2 w-32">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-mono text-slate-700 font-semibold">{project.progress_percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
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
                        </td>
                        <td className="py-3 pl-2 text-right whitespace-nowrap">
                          <button
                            id={`btn-open-project-${project.id}`}
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setAdminTab('projects');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: User distribution & Team overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Équipe & Rôles</h2>
                <p className="text-xs text-slate-500">{users.length} comptes configurés</p>
              </div>
              <button
                id="btn-admin-manage-users-tab"
                onClick={() => setAdminTab('users')}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold"
              >
                Gérer
              </button>
            </div>

            {/* Quick role counters */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
                <span className="text-xs font-bold text-purple-800 font-mono">
                  {users.filter((u) => u.role === 'ADMIN').length}
                </span>
                <p className="text-[10px] text-slate-600 mt-0.5">Admin</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800 font-mono">
                  {users.filter((u) => u.role === 'DEV').length}
                </span>
                <p className="text-[10px] text-slate-600 mt-0.5">Devs</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-xs font-bold text-amber-900 font-mono">
                  {users.filter((u) => u.role === 'CLIENT').length}
                </span>
                <p className="text-[10px] text-slate-600 mt-0.5">Clients</p>
              </div>
            </div>

            {/* User quick list */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{u.job_title || u.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-100 border-purple-200 text-purple-800'
                        : u.role === 'DEV'
                        ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                        : 'bg-amber-100 border-amber-200 text-amber-900'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Sécurité de l'espace</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Accès Sécurisé
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
