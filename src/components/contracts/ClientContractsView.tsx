import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contract, ContractTranche } from '../../types';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  PenTool,
  Calendar,
  Layers,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { ContractDetailModal } from './ContractDetailModal';

export const ClientContractsView: React.FC = () => {
  const { currentUser, projects, milestones, getClientContracts } = useApp();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  if (!currentUser) return null;

  const myContracts = getClientContracts(currentUser.id);
  const totalEngagementHT = myContracts.reduce((sum, c) => sum + c.total_amount_ht, 0);

  return (
    <div id="client-contracts-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Vos Conventions & Contrats Cadres</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Signature Électronique Certifiée
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consultez les engagements contractuels, les échéanciers financiers adossés aux jalons et signez vos avenants.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contrats Actifs</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {myContracts.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {myContracts.filter((c) => c.status === 'ACTIVE_SIGNED').length} convention(s) signée(s)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget Global Contractualisé</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 font-mono">
            {totalEngagementHT.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-500">HT</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Modalités de paiement échelonnées
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Garantie & SLA</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-mono text-lg">Inclus</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Recette et garantie contractuelle 3 mois
          </p>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {myContracts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Aucun contrat client n'est associé à votre compte.
          </div>
        ) : (
          myContracts.map((contract) => {
            const project = projects.find((p) => p.id === contract.project_id);
            const hasSigned = contract.signatures.some((s) => s.user_id === currentUser.id);

            return (
              <div
                key={contract.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{contract.contract_number}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          contract.status === 'ACTIVE_SIGNED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {contract.status === 'ACTIVE_SIGNED' ? 'Contrat Signé' : 'Signature Requise'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs mt-0.5">{contract.title}</div>
                    <div className="text-[11px] text-slate-500">Projet : <strong className="text-slate-700">{project?.name}</strong></div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total HT</div>
                      <div className="font-mono font-extrabold text-base text-slate-900">
                        {contract.total_amount_ht.toLocaleString('fr-FR')} €
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedContract(contract)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {hasSigned ? 'Consulter le Contrat' : 'Signer Électroniquement'}
                    </button>
                  </div>
                </div>

                {/* Staggered Tranches */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Échéancier & Livrables ({contract.tranches.length} Échéances Forfaitaires)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {contract.tranches.map((tranche) => {
                      const milestone = milestones.find((m) => m.id === tranche.milestone_id);
                      return (
                        <div
                          key={tranche.id}
                          className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{tranche.title}</span>
                            <span className="font-mono font-bold text-[11px] px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-700">
                              {tranche.percentage}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">{tranche.description}</p>
                          {milestone && (
                            <div className="text-[11px] text-indigo-700 font-medium flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {milestone.title}
                            </div>
                          )}
                          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                            <span className="font-mono font-bold text-slate-900">
                              {tranche.amount_ttc.toLocaleString('fr-FR')} € TTC
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {tranche.status === 'PAID' ? 'Acquitté' : 'Facturation à validation'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
};
