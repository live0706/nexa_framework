import React from 'react';
import { Invoice, User, Project } from '../../types';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  CreditCard,
  Layers,
  FileText,
} from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  project?: Project;
  clientUser?: User;
  devUser?: User;
  onClose: () => void;
  onPay?: (invoice: Invoice) => void;
  canPay?: boolean;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  project,
  clientUser,
  devUser,
  onClose,
  onPay,
  canPay = false,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (invoice.status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Payée {invoice.paid_at && `le ${new Date(invoice.paid_at).toLocaleDateString('fr-FR')}`}
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            En attente de règlement
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Échéance Dépassée
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Brouillon
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div
        id="invoice-detail-modal"
        className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl my-8 overflow-hidden flex flex-col"
      >
        {/* Top Action Bar (Non-printable toolbar) */}
        <div className="print:hidden px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-slate-900 text-xs font-mono">
              {invoice.invoice_number}
            </span>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-print-invoice"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer / PDF
            </button>

            {canPay && invoice.status !== 'PAID' && onPay && (
              <button
                id="btn-modal-pay-now"
                onClick={() => onPay(invoice)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Régler en ligne
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-8 sm:p-10 space-y-8 text-xs text-slate-800">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight">NEXA SOLUTIONS SAS</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                42 Boulevard de la Technologie, 75008 Paris<br />
                SIREN : 894 120 789 • RCS Paris<br />
                TVA Intracommunautaire : FR 48 894120789<br />
                contact@nexa-solutions.corp • +33 1 40 20 80 00
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                {invoice.type === 'CLIENT_INVOICE' ? 'FACTURE' : 'NOTE D’HONORAIRES'}
              </h2>
              <p className="text-xs font-mono font-bold text-slate-700">
                N° {invoice.invoice_number}
              </p>
              <p className="text-[11px] text-slate-500">
                Date d'émission : <strong className="text-slate-800">{new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Date d'échéance : <strong className="text-slate-800">{new Date(invoice.due_date).toLocaleDateString('fr-FR')}</strong>
              </p>
            </div>
          </div>

          {/* Parties Info: Issuer & Client / Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {invoice.type === 'CLIENT_INVOICE' ? 'Émetteur' : 'Prestataire / Bénéficiaire'}
              </span>
              {invoice.type === 'CLIENT_INVOICE' ? (
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Nexa Solutions IT</p>
                  <p className="text-[11px] text-slate-600">Pôle Projets & Ingénierie Logicielle</p>
                  <p className="text-[11px] text-slate-500">Intranet de gestion de projets</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">{devUser?.name || 'Développeur Prestataire'}</p>
                  <p className="text-[11px] text-slate-600">{devUser?.job_title || 'Ingénieur Logiciel'}</p>
                  <p className="text-[11px] text-slate-500">{devUser?.email}</p>
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {invoice.type === 'CLIENT_INVOICE' ? 'Destinataire / Facturé à' : 'Donneur d’ordre'}
              </span>
              {invoice.type === 'CLIENT_INVOICE' ? (
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">{clientUser?.name || 'Entreprise Partenaire'}</p>
                  <p className="text-[11px] text-slate-600">{clientUser?.job_title || 'Client'}</p>
                  <p className="text-[11px] text-slate-500">{clientUser?.email}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Projet : {project?.name || 'Projet'}</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Nexa Solutions SAS</p>
                  <p className="text-[11px] text-slate-600">Projet : {project?.name || 'Projet'}</p>
                  <p className="text-[11px] text-slate-500">Service Comptabilité & Trésorerie</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Subject Title */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Objet de la Facturation
            </span>
            <p className="text-sm font-bold text-slate-900">{invoice.title}</p>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3">Désignation / Prestation</th>
                  <th className="p-3 text-center">Quantité</th>
                  <th className="p-3 text-right">Prix Unitaire HT</th>
                  <th className="p-3 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-medium text-slate-800">{item.description}</td>
                    <td className="p-3 text-center font-mono text-slate-600">{item.quantity}</td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {item.unit_price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {item.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1 max-w-sm">
              <p className="text-[11px] font-semibold text-slate-700">Conditions de règlement :</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {invoice.notes || 'Paiement par virement bancaire SEPA ou carte bancaire sous 30 jours à réception de la présente facture.'}
              </p>
              {invoice.payment_method && (
                <p className="text-[11px] text-slate-600 pt-1">
                  Mode de règlement : <strong className="font-semibold text-slate-800">{invoice.payment_method.replace('_', ' ')}</strong>
                </p>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total HT :</span>
                <span className="font-mono font-semibold">
                  {invoice.amount_ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>TVA ({invoice.tva_rate}%) :</span>
                <span className="font-mono font-semibold">
                  {(invoice.amount_ttc - invoice.amount_ht).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Net à payer TTC :</span>
                <span className="font-mono text-base">
                  {invoice.amount_ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </span>
              </div>
            </div>
          </div>

          {/* Footer Legal notice */}
          <div className="border-t border-slate-200 pt-6 text-[10px] text-slate-400 text-center leading-relaxed">
            <p>Nexa Solutions SAS au capital de 100 000 € • Document certifié conforme émis par le système Nexa Dashboard.</p>
            <p>En cas de retard de paiement, une indemnité forfaitaire pour frais de recouvrement de 40 € sera exigible selon la loi L. 441-6.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
