import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceStatus, Contract } from '../../types';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Building2,
  FileText,
  Eye,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Check,
  Send,
  Layers,
} from 'lucide-react';
import { InvoiceDetailModal } from '../modals/InvoiceDetailModal';
import { ContractDetailModal } from '../contracts/ContractDetailModal';

export const DevFinance: React.FC = () => {
  const {
    currentUser,
    projects,
    invoices,
    contracts,
    getDevContracts,
    getDevProfile,
    updateDevProfile,
    showToast,
  } = useApp();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditingIban, setIsEditingIban] = useState(false);

  if (!currentUser) return null;

  const myProfile = getDevProfile(currentUser.id) || {
    user_id: currentUser.id,
    legal_status: 'Micro-Entreprise (BNC)',
    company_name: `${currentUser.name} Engineering`,
    siret: '892 341 002 00018',
    vat_number: 'Non assujetti (Art. 293 B)',
    iban: 'FR76 3000 4000 5000 6000 7000 123',
    bic: 'BNPAFR21',
    address: '14 Rue de la Paix, 75002 Paris',
  };

  const [ibanInput, setIbanInput] = useState(myProfile.iban);

  const myContracts = getDevContracts(currentUser.id);
  const totalContractedAmount = myContracts.reduce((sum, c) => sum + c.total_amount_ht, 0);

  const myPayouts = invoices.filter(
    (i) => i.type === 'DEV_PAYOUT' && i.dev_id === currentUser.id
  );

  const totalPaid = myPayouts
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount_ttc, 0);

  const totalPending = myPayouts
    .filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.amount_ttc, 0);

  const handleSaveIban = () => {
    if (!ibanInput.trim()) return;
    updateDevProfile({
      ...myProfile,
      iban: ibanInput.trim(),
    });
    setIsEditingIban(false);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Virement Exécuté
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> En traitement comptable
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> Retard
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="dev-finance-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Espace Rémunération & Notes d'Honoraires</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Rémunération par Forfait Contractuel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Paiements échelonnés selon les jalons validés de vos contrats de prestation forfaitaires.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Contract total */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Forfaits Contractualisés</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {totalContractedAmount.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-500">HT</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sur <strong>{myContracts.length} contrat(s) signé(s)</strong>
          </p>
        </div>

        {/* Card 2: Received payouts */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Honoraires Reçus</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
            {totalPaid.toLocaleString('fr-FR')} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {myPayouts.filter((i) => i.status === 'PAID').length} règlements acquittés
          </p>
        </div>

        {/* Card 3: Pending Payouts */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Virements En Cours</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 font-mono">
            {totalPending.toLocaleString('fr-FR')} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Échéance validée par la direction
          </p>
        </div>

        {/* Card 4: Remaining to unlock */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Solde Restant à Débloquer</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-2 font-mono">
            {(totalContractedAmount - totalPaid - totalPending).toLocaleString('fr-FR')} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Lié aux jalons techniques à livrer
          </p>
        </div>
      </div>

      {/* Bank details info banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs">Compte de Virement SEPA Enregistré ({myProfile.company_name})</div>
            <div className="font-mono text-xs text-slate-300 mt-0.5">{myProfile.iban}</div>
            <div className="text-[11px] text-slate-400">Statut : {myProfile.legal_status} • SIRET : {myProfile.siret}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditingIban ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ibanInput}
                onChange={(e) => setIbanInput(e.target.value)}
                placeholder="FR76 •••• •••• ••••"
                className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-xs font-mono text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-400"
              />
              <button
                onClick={handleSaveIban}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setIsEditingIban(false)}
                className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIbanInput(myProfile.iban);
                setIsEditingIban(true);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Modifier mes coordonnées bancaires
            </button>
          )}
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Historique des Règlements & Notes d'Honoraires</h3>
            <p className="text-[11px] text-slate-500">Toutes vos notes d'honoraires émises au titre de vos tranches forfaitaires</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">N° Note & Date</th>
                <th className="p-4">Projet & Intitulé de la Tranche</th>
                <th className="p-4 text-right">Montant Brut</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Justificatif / Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myPayouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Aucune note d'honoraires générée pour le moment.
                  </td>
                </tr>
              ) : (
                myPayouts.map((pay) => {
                  const project = projects.find((p) => p.id === pay.project_id);
                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900">{pay.invoice_number}</div>
                        <div className="text-[11px] text-slate-500">{new Date(pay.issue_date).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{pay.title}</div>
                        <div className="text-[11px] text-slate-500">{project?.name || 'Projet'}</div>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-900">
                        {pay.amount_ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>
                      <td className="p-4">{getStatusBadge(pay.status)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(pay)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Consulter / PDF
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          project={projects.find((p) => p.id === selectedInvoice.project_id)}
          devUser={currentUser}
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
    </div>
  );
};
