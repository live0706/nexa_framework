import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Receipt,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';
import { ProjectStatus, MilestoneStatus } from '../../types';

interface ClientDashboardProps {
  onGoToValidation: () => void;
  onGoToRoadmap: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onGoToValidation,
  onGoToRoadmap,
}) => {
  const {
    currentUser,
    getAccessibleProjects,
    selectedProjectId,
    setSelectedProjectId,
    milestones,
    tasks,
    invoices,
    setClientTab,
  } = useApp();

  if (!currentUser) return null;

  const clientProjects = getAccessibleProjects();
  const activeProject =
    clientProjects.find((p) => p.id === selectedProjectId) || clientProjects[0];

  if (!activeProject) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
        <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-900">Aucun projet associé</h3>
        <p className="text-xs mt-1">Votre compte client n'a pas encore de projet actif rattaché.</p>
      </div>
    );
  }

  // Milestones & visible tasks for this project
  const projectMilestones = milestones.filter((m) => m.project_id === activeProject.id);
  const validatedMilestones = projectMilestones.filter((m) => m.status === 'VALIDATED');
  const pendingValidationMilestones = projectMilestones.filter((m) => m.status === 'PENDING');
  const changesRequestedMilestones = projectMilestones.filter((m) => m.status === 'CHANGES_REQUESTED');

  const visibleTasks = tasks.filter(
    (t) => t.project_id === activeProject.id && t.is_client_visible
  );
  const completedVisibleTasks = visibleTasks.filter((t) => t.status === 'DONE');

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'EN_COURS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">En cours de production</span>;
      case 'RECETTE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">Phase de Recette</span>;
      case 'A_VENIR':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Cadrage Initial</span>;
      case 'TERMINE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Projet Livré</span>;
      case 'ARCHIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Archivé</span>;
    }
  };

  return (
    <div id="client-portal-overview-view" className="space-y-6">
      {/* Client Welcome Header & Project Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Espace Partenaire : {currentUser.name}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
              Accès Client Protégé
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Suivi transparent de vos livrables, validation des jalons contractuels et avancement temps réel.
          </p>
        </div>

        {/* Project Selector if client has more than 1 project */}
        {clientProjects.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
            <span className="text-xs text-slate-500 px-2 font-medium">Vos Projets :</span>
            <select
              id="select-client-active-project"
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

      {/* Financial Status Quick Banner */}
      {(() => {
        const clientInvoices = invoices.filter(
          (i) => i.type === 'CLIENT_INVOICE' && i.client_id === currentUser.id
        );
        const pendingCount = clientInvoices.filter((i) => i.status !== 'PAID').length;
        const totalPendingAmount = clientInvoices
          .filter((i) => i.status !== 'PAID')
          .reduce((sum, i) => sum + i.amount_ttc, 0);

        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Situation Comptable & Facturation</span>
                  {pendingCount > 0 ? (
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                      {pendingCount} facture(s) à régler
                    </span>
                  ) : (
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      À jour de paiement
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Solde à régler : <strong className="font-mono text-slate-900">{totalPendingAmount.toLocaleString('fr-FR')} € TTC</strong> • Règlements en ligne par carte bancaire ou virement SEPA.
                </p>
              </div>
            </div>

            <button
              id="btn-client-dash-goto-finance"
              onClick={() => setClientTab('finance')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Espace Facturation <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      {/* Action Required Banner for Pending Validations */}
      {pendingValidationMilestones.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-900">
                Action requise : {pendingValidationMilestones.length} livrable(s) en attente de votre validation
              </h3>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Prochaine étape : « {pendingValidationMilestones[0].title} ». Merci de tester et de confirmer la conformité.
              </p>
            </div>
          </div>

          <button
            id="btn-client-banner-validate-now"
            onClick={onGoToValidation}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
          >
            Accéder aux livrables <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Project Status & Progress Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Gauge Card (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{activeProject.name}</h2>
                {getStatusBadge(activeProject.status)}
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {activeProject.description}
              </p>
            </div>
          </div>

          {/* Large Progress Bar & Milestone stats */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Taux d'accomplissement global</span>
              <span className="font-mono font-bold text-lg text-emerald-600">
                {activeProject.progress_percent}%
              </span>
            </div>

            <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${activeProject.progress_percent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block uppercase tracking-wider">Jalons Validés</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {validatedMilestones.length}/{projectMilestones.length}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block uppercase tracking-wider">Livrables Livrés</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">
                  {completedVisibleTasks.length}/{visibleTasks.length}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block uppercase tracking-wider">Date de Clôture</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {new Date(activeProject.deadline).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Footer Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              id="btn-client-view-deliverables"
              onClick={onGoToValidation}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1.5"
            >
              Consulter la liste des livrables <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-client-view-roadmap"
              onClick={onGoToRoadmap}
              className="text-xs text-indigo-700 hover:text-indigo-800 font-semibold flex items-center gap-1.5"
            >
              Voir le planning détaillé <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Deliverables Timeline Widget (1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Calendrier des Jalons Clés
            </h3>
            <p className="text-xs text-slate-500 mb-4">Étapes majeures du projet</p>

            <div className="space-y-4">
              {projectMilestones.map((m, idx) => {
                const isValidated = m.status === 'VALIDATED';
                const isChangesRequested = m.status === 'CHANGES_REQUESTED';
                const isPending = m.status === 'PENDING';

                return (
                  <div key={m.id} className="relative pl-6 pb-2 border-l border-slate-200 last:border-l-0">
                    {/* Status Dot */}
                    <div
                      className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        isValidated
                          ? 'bg-emerald-600 text-white'
                          : isChangesRequested
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {isValidated && <CheckCircle2 className="w-2.5 h-2.5" />}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 leading-snug">{m.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-mono">{new Date(m.due_date).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span
                          className={`font-semibold ${
                            isValidated
                              ? 'text-emerald-700'
                              : isChangesRequested
                              ? 'text-rose-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {isValidated
                            ? 'Validé'
                            : isChangesRequested
                            ? 'Modifications'
                            : 'En cours'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Données contractuelles certifiées
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
