import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contract, ContractType, ContractStatus } from '../../types';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  PenTool,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { ContractDetailModal } from './ContractDetailModal';
import { CreateContractModal } from './CreateContractModal';

export const ContractList: React.FC = () => {
  const {
    currentUser,
    contracts,
    projects,
    users,
    triggerTranchePayout,
    signContract,
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredContracts = contracts.filter((c) => {
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesQuery =
      c.contract_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesQuery;
  });

  const devContracts = contracts.filter((c) => c.type === 'DEV_SERVICE_CONTRACT');
  const clientContracts = contracts.filter((c) => c.type === 'CLIENT_MASTER_CONTRACT');

  const totalDevCommitments = devContracts.reduce((sum, c) => sum + c.total_amount_ht, 0);
  const totalClientCommitments = clientContracts.reduce((sum, c) => sum + c.total_amount_ht, 0);

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'ACTIVE_SIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Signé & Actif
          </span>
        );
      case 'PENDING_SIGNATURE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <PenTool className="w-3 h-3" /> En attente signature
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Soldé & Clôturé
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Brouillon
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="contract-governance-view" className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Gouvernance des Contrats & Forfaits</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold flex items-center gap-1">
              <FileText className="w-3 h-3" /> Échelonnement & Signatures
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestion intégrale des contrats forfaitaires développeurs et contrats-cadres clients avec jalons échelonnés.
          </p>
        </div>

        <button
          id="btn-create-contract"
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Rédiger un Nouveau Contrat
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Contrats Actifs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contrats Actifs</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {contracts.length}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
            <span className="text-emerald-700 font-semibold">
              {contracts.filter((c) => c.status === 'ACTIVE_SIGNED').length} signés
            </span>
            <span>•</span>
            <span className="text-amber-700">
              {contracts.filter((c) => c.status === 'PENDING_SIGNATURE' || c.status === 'DRAFT').length} en attente
            </span>
          </div>
        </div>

        {/* Card 2: Forfaits Dév */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Forfaits Développeurs</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 font-mono">
            {totalDevCommitments.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-500">HT</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {devContracts.length} contrats prestataires échelonnés
          </p>
        </div>

        {/* Card 3: Engagements Clients */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contrats Cadres Clients</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
            {totalClientCommitments.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-500">HT</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {clientContracts.length} conventions clients actives
          </p>
        </div>

        {/* Card 4: Signatures eIDAS */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certification Légale</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span className="font-mono text-lg">100% Conforme</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Horodatage SHA-256 certifié sur la plateforme
          </p>
        </div>
      </div>

      {/* Contracts Table and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Filters bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher référence, titre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
            >
              <option value="ALL">Tous les types de contrat</option>
              <option value="DEV_SERVICE_CONTRACT">Prestataires Développeurs</option>
              <option value="CLIENT_MASTER_CONTRACT">Contrats Cadres Clients</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE_SIGNED">Signés & Actifs</option>
              <option value="PENDING_SIGNATURE">En attente signature</option>
              <option value="DRAFT">Brouillons</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {filteredContracts.length} contrat(s) affiché(s)
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">N° Référence & Type</th>
                <th className="p-4">Projet & Intitulé</th>
                <th className="p-4">Signataire Principal</th>
                <th className="p-4 text-right">Montant HT</th>
                <th className="p-4">Échelonnement</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Aucun contrat ne correspond à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c) => {
                  const project = projects.find((p) => p.id === c.project_id);
                  const dev = users.find((u) => u.id === c.dev_id);
                  const client = users.find((u) => u.id === c.client_id);
                  const isDev = c.type === 'DEV_SERVICE_CONTRACT';

                  const paidTranches = c.tranches.filter((t) => t.status === 'PAID').length;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900">{c.contract_number}</div>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.2 rounded border ${
                            isDev
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}
                        >
                          {isDev ? 'Forfait Développeur' : 'Convention Client'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800">{c.title}</div>
                        <div className="text-[11px] text-slate-500">{project?.name || 'Projet'}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-900">
                          {isDev ? dev?.name : client?.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isDev ? dev?.job_title : client?.job_title}
                        </div>
                      </td>

                      <td className="p-4 text-right font-mono font-bold text-slate-900">
                        {c.total_amount_ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-700">
                          <span>{c.tranches.length} tranches</span>
                          <span className="text-[10px] text-slate-400">({paidTranches} réglées)</span>
                        </div>
                        <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{
                              width: `${(paidTranches / (c.tranches.length || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="p-4">{getStatusBadge(c.status)}</td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedContract(c)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Consulter
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Detail & Signature Modal */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}

      {/* Create Contract Modal */}
      <CreateContractModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
