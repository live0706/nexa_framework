import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceStatus, PaymentMethod } from '../../types';
import {
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers,
  FileCheck,
} from 'lucide-react';
import { InvoiceDetailModal } from '../modals/InvoiceDetailModal';
import { PaymentModal } from '../modals/PaymentModal';

export const ClientFinance: React.FC = () => {
  const {
    currentUser,
    projects,
    invoices,
    milestones,
    payInvoice,
    showToast,
  } = useApp();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<Invoice | null>(null);

  if (!currentUser) return null;

  // Filter client's invoices and projects
  const myProjects = projects.filter((p) => p.client_id === currentUser.id);
  const myInvoices = invoices.filter(
    (i) => i.type === 'CLIENT_INVOICE' && i.client_id === currentUser.id
  );

  const totalBudget = myProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalInvoicedTTC = myInvoices.reduce((sum, i) => sum + i.amount_ttc, 0);

  const totalPaidTTC = myInvoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount_ttc, 0);

  const totalDueTTC = myInvoices
    .filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.amount_ttc, 0);

  const pendingInvoices = myInvoices.filter(
    (i) => i.status === 'PENDING' || i.status === 'OVERDUE'
  );

  const handleConfirmPayment = (invoiceId: string, method: PaymentMethod) => {
    payInvoice(invoiceId, method);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Réglée
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> À Régler
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> Échéance Dépassée
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="client-finance-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Espace Facturation & Règlements</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Paiement Sécurisé
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consultez vos factures de prestations, téléchargez vos reçus et effectuez vos règlements en toute conformité.
          </p>
        </div>

        {pendingInvoices.length > 0 && (
          <button
            id="btn-client-quick-pay"
            onClick={() => setPaymentTargetInvoice(pendingInvoices[0])}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            Régler la facture en attente ({pendingInvoices[0].amount_ttc.toLocaleString('fr-FR')} €)
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Budget global */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget Global Engagé</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {totalBudget.toLocaleString('fr-FR')} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sur {myProjects.length} projets contractualisés
          </p>
        </div>

        {/* Card 2: Total facturé */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facturé à ce jour</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 font-mono">
            {totalInvoicedTTC.toLocaleString('fr-FR')} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Montant TTC émis ({myInvoices.length} factures)
          </p>
        </div>

        {/* Card 3: Already paid */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Réglé</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
            {totalPaidTTC.toLocaleString('fr-FR')} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalInvoicedTTC > 0 ? Math.round((totalPaidTTC / totalInvoicedTTC) * 100) : 0}% des factures acquittées
          </p>
        </div>

        {/* Card 4: Remaining due */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Solde Restant Dû</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-2 font-mono">
            {totalDueTTC.toLocaleString('fr-FR')} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {pendingInvoices.length} facture(s) en attente de paiement
          </p>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Vos Factures & Règlements</h3>
            <p className="text-[11px] text-slate-500">Historique complet des avis de paiement et justificatifs acquittés</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">N° Facture & Date</th>
                <th className="p-4">Projet & Intitulé</th>
                <th className="p-4 text-right">Montant HT</th>
                <th className="p-4 text-right">Montant TTC</th>
                <th className="p-4">Échéance</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Aucune facture enregistrée pour votre compte.
                  </td>
                </tr>
              ) : (
                myInvoices.map((inv) => {
                  const project = projects.find((p) => p.id === inv.project_id);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900">{inv.invoice_number}</div>
                        <div className="text-[11px] text-slate-500">{new Date(inv.issue_date).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{inv.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{project?.name || 'Projet'}</div>
                      </td>
                      <td className="p-4 text-right font-mono text-slate-700">
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Facture PDF
                          </button>

                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => setPaymentTargetInvoice(inv)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Payer
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

      {/* Payment Schedule Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Échéancier & Modalités Contractuelles de Règlements
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Les échéances financières sont corrélées à la validation des jalons et livrables techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phase 1 : Cadrage</div>
            <div className="font-bold text-slate-900">Acompte de Démarrage (30%)</div>
            <p className="text-[11px] text-slate-500">Émis à la signature du devis et validation du cahier des charges.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phase 2 : Sprint & V1</div>
            <div className="font-bold text-slate-900">Échéance Jalon Intermédiaire (35%)</div>
            <p className="text-[11px] text-slate-500">Émis lors de la mise à disposition de l'environnement de staging.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phase 3 : Clôture</div>
            <div className="font-bold text-slate-900">Solde de Recette Finale (35%)</div>
            <p className="text-[11px] text-slate-500">Émis après signature du procès-verbal de recette et mise en production.</p>
          </div>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          project={projects.find((p) => p.id === selectedInvoice.project_id)}
          clientUser={currentUser}
          onClose={() => setSelectedInvoice(null)}
          canPay={true}
          onPay={(inv) => {
            setSelectedInvoice(null);
            setPaymentTargetInvoice(inv);
          }}
        />
      )}

      {/* Payment Modal */}
      {paymentTargetInvoice && (
        <PaymentModal
          isOpen={!!paymentTargetInvoice}
          invoice={paymentTargetInvoice}
          onClose={() => setPaymentTargetInvoice(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}
    </div>
  );
};
