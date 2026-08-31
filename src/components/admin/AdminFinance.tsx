import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceStatus, Contract } from '../../types';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Search,
  Filter,
  Eye,
  Send,
  Layers,
} from 'lucide-react';
import { InvoiceDetailModal } from '../modals/InvoiceDetailModal';
import { CreateInvoiceModal } from '../modals/CreateInvoiceModal';
import { ContractDetailModal } from '../contracts/ContractDetailModal';

export const AdminFinance: React.FC = () => {
  const {
    invoices,
    contracts,
    projects,
    users,
    updateInvoiceStatus,
    triggerTranchePayout,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'clients' | 'devs' | 'contracts_pnl'>('clients');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Financial Calculations
  const clientInvoices = invoices.filter((i) => i.type === 'CLIENT_INVOICE');
  const devPayouts = invoices.filter((i) => i.type === 'DEV_PAYOUT');

  const totalInvoicedHT = clientInvoices.reduce((sum, i) => sum + i.amount_ht, 0);
  const totalInvoicedTTC = clientInvoices.reduce((sum, i) => sum + i.amount_ttc, 0);

  const totalCollectedTTC = clientInvoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount_ttc, 0);

  const totalPendingTTC = clientInvoices
    .filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.amount_ttc, 0);

  const totalDevPayoutsPaid = devPayouts
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount_ttc, 0);

  const totalDevPayoutsPending = devPayouts
    .filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.amount_ttc, 0);

  const grossMargin = totalCollectedTTC - totalDevPayoutsPaid;
  const marginPercentage =
    totalCollectedTTC > 0 ? Math.round((grossMargin / totalCollectedTTC) * 100) : 0;

  // Filtered lists
  const filteredClientInvoices = clientInvoices.filter((inv) => {
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesQuery =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const filteredDevPayouts = devPayouts.filter((inv) => {
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesQuery =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Payée / Versée
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> En retard
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Brouillon
          </span>
        );
    }
  };

  const handleExecutePayout = (invoiceId: string) => {
    updateInvoiceStatus(invoiceId, 'PAID', 'VIREMENT_BANCAIRE');
    showToast('Virement exécuté', 'Ordre de virement SEPA validé avec succès.', 'success');
  };

  const handleSendReminder = (inv: Invoice) => {
    showToast('Relance transmise', `Notification de relance envoyée pour la facture ${inv.invoice_number}.`, 'info');
  };

  const devContracts = contracts.filter((c) => c.type === 'DEV_SERVICE_CONTRACT');

  return (
    <div id="admin-finance-view" className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Gouvernance Financière & Facturation</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Trésorerie & Marges Forfaitaires
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pilotage des flux entrants (facturation clients) et sortants (échéances des contrats prestataires développeurs).
          </p>
        </div>

        <button
          id="btn-admin-emit-invoice"
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Émettre une Facture / Note
        </button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CA Facturé */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chiffre d'Affaires</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {totalInvoicedTTC.toLocaleString('fr-FR')} €
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span>HT : <strong>{totalInvoicedHT.toLocaleString('fr-FR')} €</strong></span>
              <span className="text-slate-300">•</span>
              <span>{clientInvoices.length} factures</span>
            </div>
          </div>
        </div>

        {/* Card 2: Encaissé */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Règlements Encaissés</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-600 font-mono">
              {totalCollectedTTC.toLocaleString('fr-FR')} €
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span className="text-emerald-700 font-semibold">
                {totalInvoicedTTC > 0 ? Math.round((totalCollectedTTC / totalInvoicedTTC) * 100) : 0}% du CA encaissé
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: En attente / Retard */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Attente Client</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-600 font-mono">
              {totalPendingTTC.toLocaleString('fr-FR')} €
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span className="text-rose-600 font-medium">
                {clientInvoices.filter((i) => i.status === 'OVERDUE').length} en retard d'échéance
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Marge Brute Réalisée */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Marge Nette Forfaits</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-purple-600 font-mono">
              {grossMargin.toLocaleString('fr-FR')} €
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span>Taux de marge : <strong className="text-purple-700">{marginPercentage}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('clients')}
              className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'clients'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Facturation Clients</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono">
                {clientInvoices.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('devs')}
              className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'devs'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Échéances & Virements Forfaits Développeurs</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono">
                {devPayouts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('contracts_pnl')}
              className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'contracts_pnl'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Marge & Rentabilité par Projet</span>
            </button>
          </div>

          {activeTab !== 'contracts_pnl' && (
            <div className="flex items-center gap-3 py-2 sm:py-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher facture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 w-48"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value="ALL">Tous statuts</option>
                <option value="PAID">Payées</option>
                <option value="PENDING">En attente</option>
                <option value="OVERDUE">En retard</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Facturation Clients */}
        {activeTab === 'clients' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-4">N° Facture & Objet</th>
                  <th className="p-4">Client & Projet</th>
                  <th className="p-4 text-right">Montant HT</th>
                  <th className="p-4 text-right">Montant TTC</th>
                  <th className="p-4">Échéance</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClientInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Aucune facture client trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredClientInvoices.map((inv) => {
                    const project = projects.find((p) => p.id === inv.project_id);
                    const client = users.find((u) => u.id === inv.client_id);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-mono font-bold text-slate-900">{inv.invoice_number}</div>
                          <div className="text-slate-600 text-[11px] truncate max-w-xs">{inv.title}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{client?.name || 'Client'}</div>
                          <div className="text-[11px] text-slate-500">{project?.name || 'Projet'}</div>
                        </td>
                        <td className="p-4 text-right font-mono font-semibold text-slate-700">
                          {inv.amount_ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-slate-900">
                          {inv.amount_ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </td>
                        <td className="p-4 text-[11px] text-slate-600">
                          {new Date(inv.due_date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4">{getStatusBadge(inv.status)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              title="Voir / Imprimer la facture"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {inv.status !== 'PAID' && (
                              <>
                                <button
                                  onClick={() => handleSendReminder(inv)}
                                  title="Envoyer relance client"
                                  className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md transition-colors"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => updateInvoiceStatus(inv.id, 'PAID', 'VIREMENT_BANCAIRE')}
                                  title="Marquer comme encaissée"
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md font-semibold text-[11px] transition-colors"
                                >
                                  Acquitter
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Forfaits & Payouts Développeurs */}
        {activeTab === 'devs' && (
          <div className="p-5 space-y-6">
            {/* Active Dev Contracts Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Engagements Forfaitaires Actifs par Développeur
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Contrats signés avec tranches échelonnées conditionnées à la validation des jalons.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {devContracts.map((ctr) => {
                  const dev = users.find((u) => u.id === ctr.dev_id);
                  const project = projects.find((p) => p.id === ctr.project_id);
                  const paidCount = ctr.tranches.filter((t) => t.status === 'PAID').length;
                  const paidAmount = ctr.tranches
                    .filter((t) => t.status === 'PAID')
                    .reduce((sum, t) => sum + t.amount_ht, 0);

                  return (
                    <div key={ctr.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 text-xs">{dev?.name}</div>
                        <button
                          onClick={() => setSelectedContract(ctr)}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Contrat
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500">{project?.name}</div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                        <span className="font-mono text-slate-900 font-bold">{ctr.total_amount_ht.toLocaleString('fr-FR')} € HT</span>
                        <span className="text-[11px] text-slate-500 font-mono">{ctr.tranches.length} tranches</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg text-[11px] flex justify-between">
                        <span className="text-slate-600">Déjà réglé ({paidCount}/{ctr.tranches.length}) :</span>
                        <span className="font-mono font-bold text-emerald-700">{paidAmount.toLocaleString('fr-FR')} €</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payouts Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notes d'Honoraires & Demandes de Virement</span>
                <span className="text-[11px] text-slate-500">
                  En attente de virement : <strong className="text-amber-700 font-mono">{totalDevPayoutsPending.toLocaleString('fr-FR')} €</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="p-3.5">N° Note & Date</th>
                      <th className="p-3.5">Développeur Prestataire</th>
                      <th className="p-3.5">Désignation</th>
                      <th className="p-3.5 text-right">Montant</th>
                      <th className="p-3.5">Statut</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDevPayouts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          Aucune note d'honoraires enregistrée.
                        </td>
                      </tr>
                    ) : (
                      filteredDevPayouts.map((pay) => {
                        const dev = users.find((u) => u.id === pay.dev_id);
                        return (
                          <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5">
                              <div className="font-mono font-bold text-slate-900">{pay.invoice_number}</div>
                              <div className="text-[11px] text-slate-500">{new Date(pay.issue_date).toLocaleDateString('fr-FR')}</div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-semibold text-slate-800">{dev?.name || 'Développeur'}</div>
                              <div className="text-[11px] text-slate-500">{dev?.job_title}</div>
                            </td>
                            <td className="p-3.5 text-slate-700 text-xs max-w-xs truncate">{pay.title}</td>
                            <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                              {pay.amount_ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                            </td>
                            <td className="p-3.5">{getStatusBadge(pay.status)}</td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedInvoice(pay)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                                  title="Aperçu note d'honoraires"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {pay.status !== 'PAID' && (
                                  <button
                                    onClick={() => handleExecutePayout(pay.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                                  >
                                    <CreditCard className="w-3 h-3" />
                                    Exécuter Virement
                                  </button>
                                )}
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
          </div>
        )}

        {/* Tab 3: Rentabilité & PnL par Projet */}
        {activeTab === 'contracts_pnl' && (
          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-4">Projet & Client</th>
                  <th className="p-4 text-right">Budget Contracté HT</th>
                  <th className="p-4 text-right">Facturé Client HT</th>
                  <th className="p-4 text-right">Forfaits Dév Engagés</th>
                  <th className="p-4 text-right">Marge Forfaitaire Projet</th>
                  <th className="p-4 text-right">Rentabilité %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => {
                  const client = users.find((u) => u.id === project.client_id);
                  const projectInvoices = clientInvoices.filter((i) => i.project_id === project.id);
                  const invoicedHT = projectInvoices.reduce((sum, i) => sum + i.amount_ht, 0);

                  const projectDevContracts = devContracts.filter((c) => c.project_id === project.id);
                  const devCommitment = projectDevContracts.reduce((sum, c) => sum + c.total_amount_ht, 0);

                  const projectMargin = invoicedHT - devCommitment;
                  const rentability = invoicedHT > 0 ? Math.round((projectMargin / invoicedHT) * 100) : 0;

                  return (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{project.name}</div>
                        <div className="text-[11px] text-slate-500">{client?.name || 'Client'}</div>
                      </td>
                      <td className="p-4 text-right font-mono text-slate-700">
                        {project.budget ? `${project.budget.toLocaleString('fr-FR')} €` : 'N/A'}
                      </td>
                      <td className="p-4 text-right font-mono font-semibold text-slate-900">
                        {invoicedHT.toLocaleString('fr-FR')} €
                      </td>
                      <td className="p-4 text-right font-mono text-rose-600 font-medium">
                        {devCommitment.toLocaleString('fr-FR')} €
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-700">
                        {projectMargin.toLocaleString('fr-FR')} €
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                            rentability >= 50
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rentability >= 25
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {rentability}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          project={projects.find((p) => p.id === selectedInvoice.project_id)}
          clientUser={users.find((u) => u.id === selectedInvoice.client_id)}
          devUser={users.find((u) => u.id === selectedInvoice.dev_id)}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Contract Detail Modal */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
