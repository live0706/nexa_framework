import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contract, ContractTranche, ContractType } from '../../types';
import {
  FileText,
  Plus,
  Trash2,
  DollarSign,
  Layers,
  ShieldCheck,
  Calendar,
  Check,
} from 'lucide-react';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ContractType;
  defaultProjectId?: string;
}

export const CreateContractModal: React.FC<CreateContractModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'DEV_SERVICE_CONTRACT',
  defaultProjectId,
}) => {
  const { projects, users, milestones, createContract, showToast } = useApp();

  const [type, setType] = useState<ContractType>(defaultType);
  const [projectId, setProjectId] = useState<string>(
    defaultProjectId || projects[0]?.id || ''
  );
  const [contractNumber, setContractNumber] = useState<string>(
    `CTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 800 + 200)}`
  );
  const [title, setTitle] = useState<string>('');
  const [devId, setDevId] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [totalAmountHT, setTotalAmountHT] = useState<number>(5000);
  const [tvaRate, setTvaRate] = useState<number>(20);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
  );
  const [terms, setTerms] = useState<string>(
    `Prestation forfaitaire réalisée conformément aux spécifications techniques. Rémunération échelonnée selon la validation effective des jalons contractuels.`
  );

  // Tranches
  const [tranches, setTranches] = useState<
    Array<{
      id: string;
      title: string;
      percentage: number;
      milestone_id?: string;
      description: string;
    }>
  >([
    {
      id: 'tr_1',
      title: 'Acompte de Démarrage',
      percentage: 30,
      description: 'Validation cadrage et lancement initial',
    },
    {
      id: 'tr_2',
      title: 'Jalon Intermédiaire V1',
      percentage: 40,
      description: 'Livraison de la version bêta fonctionnelle',
    },
    {
      id: 'tr_3',
      title: 'Solde de Recette Finale',
      percentage: 30,
      description: 'Recette sans réserve et mise en production',
    },
  ]);

  if (!isOpen) return null;

  const devs = users.filter((u) => u.role === 'DEV');
  const clients = users.filter((u) => u.role === 'CLIENT');
  const projectMilestones = milestones.filter((m) => m.project_id === projectId);

  const selectedDev = devs.find((d) => d.id === devId) || devs[0];
  const selectedClient = clients.find((c) => c.id === clientId) || clients[0];

  const totalPercentage = tranches.reduce((sum, t) => sum + Number(t.percentage || 0), 0);

  const handleAddTranche = () => {
    setTranches((prev) => [
      ...prev,
      {
        id: 'tr_' + Date.now(),
        title: `Tranche ${prev.length + 1}`,
        percentage: 0,
        description: 'Livrable et validation',
      },
    ]);
  };

  const handleRemoveTranche = (id: string) => {
    if (tranches.length <= 1) {
      showToast('Attention', 'Le contrat doit comporter au moins 1 tranche.', 'warning');
      return;
    }
    setTranches((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTranche = (id: string, field: string, value: any) => {
    setTranches((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (totalPercentage !== 100) {
      showToast(
        'Erreur d’échelonnement',
        `La somme des pourcentages des tranches doit être exactement égale à 100% (Actuellement: ${totalPercentage}%).`,
        'error'
      );
      return;
    }

    const calculatedTranches: ContractTranche[] = tranches.map((t, idx) => {
      const amount_ht = Math.round((totalAmountHT * (t.percentage / 100)) * 100) / 100;
      const amount_ttc = Math.round((amount_ht * (1 + tvaRate / 100)) * 100) / 100;
      return {
        id: 'tra_' + Date.now() + '_' + idx,
        title: t.title,
        percentage: t.percentage,
        amount_ht,
        amount_ttc,
        milestone_id: t.milestone_id,
        status: idx === 0 ? 'PENDING' : 'PENDING',
        description: t.description,
      };
    });

    createContract({
      contract_number: contractNumber,
      title: title || (type === 'DEV_SERVICE_CONTRACT' ? `Contrat Forfaitaire - ${selectedDev?.name}` : `Contrat Cadre - ${selectedClient?.name}`),
      type,
      project_id: projectId,
      dev_id: type === 'DEV_SERVICE_CONTRACT' ? (devId || selectedDev?.id) : undefined,
      client_id: type === 'CLIENT_MASTER_CONTRACT' ? (clientId || selectedClient?.id) : undefined,
      total_amount_ht: totalAmountHT,
      tva_rate: tvaRate,
      status: 'DRAFT',
      start_date: startDate,
      end_date: endDate,
      tranches: calculatedTranches,
      terms,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6 text-xs">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Élaboration d'un Nouveau Contrat Forfaitaire</h3>
              <p className="text-[11px] text-slate-400">
                Paiement échelonné par tranches conditionnées aux jalons
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Contract Type & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Type de Contrat</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContractType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
              >
                <option value="DEV_SERVICE_CONTRACT">Contrat Prestataire Développeur</option>
                <option value="CLIENT_MASTER_CONTRACT">Contrat Cadre Client</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Projet de Rattachement</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">N° de Référence</label>
              <input
                type="text"
                required
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Title and Counterpart */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Intitulé du Contrat</label>
              <input
                type="text"
                placeholder="Ex: Forfait Développement Module Core & API"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {type === 'DEV_SERVICE_CONTRACT' ? 'Développeur Prestataire' : 'Client Contractant'}
              </label>
              {type === 'DEV_SERVICE_CONTRACT' ? (
                <select
                  value={devId || selectedDev?.id}
                  onChange={(e) => setDevId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                >
                  {devs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.job_title})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={clientId || selectedClient?.id}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.job_title})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Amounts & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Montant Forfait HT (€)</label>
              <input
                type="number"
                min="100"
                step="100"
                required
                value={totalAmountHT}
                onChange={(e) => setTotalAmountHT(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Taux TVA (%)</label>
              <input
                type="number"
                min="0"
                max="33"
                value={tvaRate}
                onChange={(e) => setTvaRate(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date de début</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date d'échéance finale</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Staggered Tranches Setup */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                  Échelonnement des Tranches de Paiement
                </span>
                <span className="text-[11px] text-slate-500">
                  Découpage du forfait selon les livrables et jalons du projet
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    totalPercentage === 100
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  Total : {totalPercentage} % / 100 %
                </span>
                <button
                  type="button"
                  onClick={handleAddTranche}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter tranche
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {tranches.map((tranche, index) => {
                const amountTranche = Math.round(totalAmountHT * (tranche.percentage / 100));
                return (
                  <div
                    key={tranche.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 text-xs">Tranche #{index + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-700 font-bold">
                          {amountTranche.toLocaleString('fr-FR')} € HT
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTranche(tranche.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Titre de la tranche (ex: Acompte)"
                          value={tranche.title}
                          onChange={(e) => handleUpdateTranche(tranche.id, 'title', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            required
                            placeholder="Pourcentage %"
                            value={tranche.percentage}
                            onChange={(e) =>
                              handleUpdateTranche(tranche.id, 'percentage', Number(e.target.value) || 0)
                            }
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono text-slate-900"
                          />
                          <span className="text-slate-500 font-bold">%</span>
                        </div>
                      </div>

                      <div>
                        <select
                          value={tranche.milestone_id || ''}
                          onChange={(e) =>
                            handleUpdateTranche(tranche.id, 'milestone_id', e.target.value || undefined)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs"
                        >
                          <option value="">-- Sans jalon (Démarrage) --</option>
                          {projectMilestones.map((m) => (
                            <option key={m.id} value={m.id}>
                              Jalon : {m.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terms & Clauses */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Clauses Contractuelles & Conditions de Réalisation
            </label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              Créer & Enregistrer le Contrat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
