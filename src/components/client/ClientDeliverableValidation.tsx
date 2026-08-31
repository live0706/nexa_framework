import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  MessageSquare,
  FileCheck,
  Send,
  Calendar,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Milestone, MilestoneStatus } from '../../types';

export const ClientDeliverableValidation: React.FC = () => {
  const {
    currentUser,
    getAccessibleProjects,
    selectedProjectId,
    setSelectedProjectId,
    milestones,
    validateMilestone,
  } = useApp();

  const clientProjects = getAccessibleProjects();
  const activeProject =
    clientProjects.find((p) => p.id === selectedProjectId) || clientProjects[0];

  // Feedback modal state
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [actionType, setActionType] = useState<MilestoneStatus>('VALIDATED');
  const [feedbackText, setFeedbackText] = useState('');

  if (!activeProject) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
        <p className="text-xs">Aucun projet sélectionné.</p>
      </div>
    );
  }

  const projectMilestones = milestones.filter((m) => m.project_id === activeProject.id);

  const openValidationModal = (milestone: Milestone, type: MilestoneStatus) => {
    setSelectedMilestone(milestone);
    setActionType(type);
    setFeedbackText(milestone.client_feedback || '');
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    validateMilestone(selectedMilestone.id, actionType, feedbackText.trim());
    setSelectedMilestone(null);
    setFeedbackText('');
  };

  return (
    <div id="client-deliverable-validation-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Validation des Livrables & Jalons Clés</h1>
          <p className="text-xs text-slate-500 mt-1">
            Examinez les livrables techniques, validez leur conformité ou transmettez vos demandes de retouches.
          </p>
        </div>

        {clientProjects.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">Projet :</label>
            <select
              id="select-validation-project"
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

      {/* Deliverables List */}
      <div className="space-y-4">
        {projectMilestones.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-slate-500 text-xs shadow-xs">
            Aucun jalon contractualisé pour ce projet.
          </div>
        ) : (
          projectMilestones.map((milestone) => {
            const isValidated = milestone.status === 'VALIDATED';
            const isChangesRequested = milestone.status === 'CHANGES_REQUESTED';
            const isPending = milestone.status === 'PENDING';

            return (
              <div
                key={milestone.id}
                className={`rounded-2xl border p-5 transition-all space-y-4 shadow-xs ${
                  isValidated
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : isChangesRequested
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Header of milestone */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{milestone.title}</h3>
                      {milestone.deliverable_tag && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {milestone.deliverable_tag}
                        </span>
                      )}
                    </div>
                    {milestone.description && (
                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {milestone.description}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {isValidated && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Validé le {milestone.feedback_date ? new Date(milestone.feedback_date).toLocaleDateString('fr-FR') : ''}
                      </span>
                    )}
                    {isChangesRequested && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Modifications Demandées
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        En Attente de Votre Validation
                      </span>
                    )}
                  </div>
                </div>

                {/* Deliverable Resource Link & Due Date */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      Échéance : {new Date(milestone.due_date).toLocaleDateString('fr-FR')}
                    </span>

                    {milestone.deliverable_url && (
                      <a
                        href={milestone.deliverable_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-900 font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ouvrir le livrable (Pré-prod / Document)
                      </a>
                    )}
                  </div>

                  {/* Actions for Client */}
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-request-changes-milestone-${milestone.id}`}
                      onClick={() => openValidationModal(milestone, 'CHANGES_REQUESTED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                        isChangesRequested
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-300 hover:border-rose-300 shadow-xs'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Demande de modifications
                    </button>

                    <button
                      id={`btn-validate-milestone-${milestone.id}`}
                      onClick={() => openValidationModal(milestone, 'VALIDATED')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                        isValidated
                          ? 'bg-slate-900 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isValidated ? 'Re-confirmer la validation' : 'Valider ce livrable'}
                    </button>
                  </div>
                </div>

                {/* Client Feedback Commentary history if exists */}
                {milestone.client_feedback && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        Remarque transmise par le client :
                      </span>
                      {milestone.feedback_date && (
                        <span className="text-slate-500 font-mono text-[10px]">
                          {new Date(milestone.feedback_date).toLocaleDateString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed italic">
                      "{milestone.client_feedback}"
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Validation / Request Changes Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {actionType === 'VALIDATED' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                )}
                <h3 className="font-bold text-slate-900 text-sm">
                  {actionType === 'VALIDATED' ? 'Validation du Jalon' : 'Demande de Retouches'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="p-6 space-y-4 text-xs">
              <div>
                <p className="font-semibold text-slate-900 text-sm mb-1">{selectedMilestone.title}</p>
                <p className="text-slate-600 leading-relaxed">
                  {actionType === 'VALIDATED'
                    ? 'Vous vous apprêtez à valider ce livrable. Cela mettra à jour la progression globale du projet.'
                    : 'Précisez ci-dessous les ajustements, correctifs ou précisions attendus par votre équipe.'}
                </p>
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1.5">
                  {actionType === 'VALIDATED'
                    ? 'Commentaire / Note d’approbation (Optionnel)'
                    : 'Détail des modifications requises (Requis)'}
                </label>
                <textarea
                  id="textarea-milestone-feedback"
                  rows={4}
                  required={actionType === 'CHANGES_REQUESTED'}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={
                    actionType === 'VALIDATED'
                      ? 'ex: Livrable conforme au cahier des charges, excellente fluidité.'
                      : 'ex: Merci de corriger la taille des polices sur mobile et d’accélérer la vitesse de génération PDF.'
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  id="btn-confirm-milestone-action"
                  type="submit"
                  className={`px-4 py-2 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs ${
                    actionType === 'VALIDATED'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {actionType === 'VALIDATED' ? 'Confirmer la Validation' : 'Transmettre la Demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
