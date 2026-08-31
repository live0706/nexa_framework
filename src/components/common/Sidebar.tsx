import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FolderKanban,
  Users2,
  BarChart3,
  KanbanSquare,
  Clock,
  Briefcase,
  CheckCircle2,
  CalendarCheck,
  ShieldCheck,
  ShieldAlert,
  Building,
  ChevronRight,
  FolderCheck,
  DollarSign,
  Receipt,
  FileText,
  Layers,
} from 'lucide-react';
import { SuperAdminTab, DevTab, ClientTab } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    adminTab,
    setAdminTab,
    devTab,
    setDevTab,
    clientTab,
    setClientTab,
    getAccessibleProjects,
    selectedProjectId,
    setSelectedProjectId,
    contracts,
  } = useApp();

  if (!currentUser) return null;

  const accessibleProjects = getAccessibleProjects();
  const isSuperAdminOrPM =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'PROJECT_MANAGER';

  return (
    <aside id="app-sidebar" className="w-full lg:w-64 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex flex-col gap-6">
      {/* Role Context Notification Banner */}
      <div
        className={`p-3 rounded-xl border text-xs ${
          currentUser.role === 'SUPER_ADMIN'
            ? 'bg-rose-50/80 border-rose-200 text-rose-950'
            : currentUser.role === 'PROJECT_MANAGER'
            ? 'bg-blue-50/80 border-blue-200 text-blue-950'
            : currentUser.role === 'ADMIN'
            ? 'bg-purple-50/80 border-purple-200 text-purple-950'
            : currentUser.role === 'DEV'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-center gap-2 font-semibold mb-1">
          {currentUser.role === 'SUPER_ADMIN' ? (
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 shrink-0" />
          )}
          <span>
            Espace{' '}
            {currentUser.role === 'SUPER_ADMIN'
              ? 'Super Admin'
              : currentUser.role === 'PROJECT_MANAGER'
              ? 'Chef de Projet'
              : currentUser.role === 'ADMIN'
              ? 'Direction'
              : currentUser.role === 'DEV'
              ? 'Développeur'
              : 'Client Partenaire'}
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-snug">
          {currentUser.role === 'SUPER_ADMIN' && 'Contrôle total : gouvernance, contrats forfaitaires, finances et utilisateurs.'}
          {currentUser.role === 'PROJECT_MANAGER' && 'Pilotage opérationnel : suivi des jalons, contrats et livrables.'}
          {currentUser.role === 'ADMIN' && 'Accès intégral : gouvernance, utilisateurs et projets.'}
          {currentUser.role === 'DEV' && 'Contrats forfaitaires par jalon, tableau Kanban et validation.'}
          {currentUser.role === 'CLIENT' && 'Conventions cadres, validation des jalons et factures.'}
        </p>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Navigation Principale
        </p>

        {/* SUPER_ADMIN / ADMIN / PROJECT_MANAGER NAV */}
        {isSuperAdminOrPM && (
          <>
            <button
              id="admin-nav-dashboard"
              onClick={() => setAdminTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                adminTab === 'dashboard'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Tableau de Bord Global</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              id="admin-nav-projects"
              onClick={() => setAdminTab('projects')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                adminTab === 'projects'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-4 h-4" />
                <span>Gestion des Projets</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                adminTab === 'projects' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {accessibleProjects.length}
              </span>
            </button>

            <button
              id="admin-nav-contracts"
              onClick={() => setAdminTab('contracts')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                adminTab === 'contracts'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Contrats & Forfaits</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono border border-indigo-200">
                {contracts.length}
              </span>
            </button>

            {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
              <button
                id="admin-nav-users"
                onClick={() => setAdminTab('users')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  adminTab === 'users'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users2 className="w-4 h-4" />
                  <span>Utilisateurs & Rôles</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            )}

            <button
              id="admin-nav-analytics"
              onClick={() => setAdminTab('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                adminTab === 'analytics'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Suivi Jalons & Délais</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
              <button
                id="admin-nav-finance"
                onClick={() => setAdminTab('finance')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  adminTab === 'finance'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Finance & Facturation</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">
                  Trésorerie
                </span>
              </button>
            )}
          </>
        )}

        {/* DEV NAV */}
        {currentUser.role === 'DEV' && (
          <>
            <button
              id="dev-nav-my-projects"
              onClick={() => setDevTab('my_projects')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                devTab === 'my_projects'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4" />
                <span>Mes Projets Assignés</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                devTab === 'my_projects' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {accessibleProjects.length}
              </span>
            </button>

            <button
              id="dev-nav-kanban"
              onClick={() => setDevTab('kanban')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                devTab === 'kanban'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <KanbanSquare className="w-4 h-4" />
                <span>Tableau Kanban Sprint</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              id="dev-nav-contracts"
              onClick={() => setDevTab('contracts')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                devTab === 'contracts'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Contrats & Forfaits</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">
                Forfait
              </span>
            </button>

            <button
              id="dev-nav-time-tracking"
              onClick={() => setDevTab('time_tracking')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                devTab === 'time_tracking'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>Journal d'Activité</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </>
        )}

        {/* CLIENT NAV */}
        {currentUser.role === 'CLIENT' && (
          <>
            <button
              id="client-nav-overview"
              onClick={() => setClientTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                clientTab === 'overview'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4" />
                <span>Synthèse & Progression</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              id="client-nav-validation"
              onClick={() => setClientTab('validation')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                clientTab === 'validation'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Validation des Livrables</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono border border-amber-200">
                Action
              </span>
            </button>

            <button
              id="client-nav-contracts"
              onClick={() => setClientTab('contracts')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                clientTab === 'contracts'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Conventions & Contrats</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              id="client-nav-roadmap"
              onClick={() => setClientTab('deliverables_roadmap')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                clientTab === 'deliverables_roadmap'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-4 h-4" />
                <span>Planning & Tâches Visibles</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              id="client-nav-finance"
              onClick={() => setClientTab('finance')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                clientTab === 'finance'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Facturation & Règlements</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">
                Paiement
              </span>
            </button>
          </>
        )}
      </div>

      {/* Active Project Selector */}
      {accessibleProjects.length > 0 && (
        <div className="pt-4 border-t border-slate-200 mt-auto">
          <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <FolderCheck className="w-3.5 h-3.5 text-indigo-600" />
            Projet actif ({accessibleProjects.length})
          </p>
          <div className="space-y-1">
            {accessibleProjects.map((p) => {
              const isSelected = p.id === selectedProjectId;
              return (
                <button
                  key={p.id}
                  id={`select-project-filter-${p.id}`}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col gap-1 border ${
                    isSelected
                      ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate text-[12px] text-slate-900">{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{p.progress_percent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        p.progress_percent >= 80
                          ? 'bg-emerald-600'
                          : p.progress_percent >= 40
                          ? 'bg-indigo-600'
                          : 'bg-amber-600'
                      }`}
                      style={{ width: `${p.progress_percent}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
