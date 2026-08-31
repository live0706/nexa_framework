import React, { useState } from 'react';
import { Invoice, PaymentMethod } from '../../types';
import {
  X,
  CreditCard,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onConfirmPayment: (invoiceId: string, method: PaymentMethod) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onConfirmPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CARTE_BANCAIRE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4532 8921 4455 9012');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('891');
  const [cardHolder, setCardHolder] = useState('ENTREPRISE PARTENAIRE');
  const [copiedIban, setCopiedIban] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleCopyIban = () => {
    navigator.clipboard.writeText('FR76 3000 4000 5000 6000 7000 894');
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      onConfirmPayment(invoice.id, selectedMethod);
      setTimeout(() => {
        setIsCompleted(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        id="payment-modal"
        className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Règlement Sécurisé de Facture</h2>
              <p className="text-[11px] text-slate-500 font-mono">Facture {invoice.invoice_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isCompleted ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Paiement Validé avec Succès !</h3>
            <p className="text-xs text-slate-600 max-w-xs">
              La transaction a été approuvée. La facture {invoice.invoice_number} est désormais marquée comme payée.
            </p>
            <span className="text-xs font-mono font-bold text-emerald-700">
              Montant acquitté : {invoice.amount_ttc.toLocaleString('fr-FR')} € TTC
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {/* Amount Banner */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Montant Total à Régler</span>
                <span className="text-xl font-extrabold font-mono text-emerald-400">
                  {invoice.amount_ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </span>
                <span className="text-[10px] text-slate-400 ml-1.5">TTC</span>
              </div>
              <div className="text-right text-[11px] text-slate-300">
                <span>HT : {invoice.amount_ht.toLocaleString('fr-FR')} €</span>
                <br />
                <span className="text-slate-400">TVA 20% incluse</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-2">Choisir le mode de règlement</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="method-card"
                  onClick={() => setSelectedMethod('CARTE_BANCAIRE')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    selectedMethod === 'CARTE_BANCAIRE'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs">Carte Bancaire / Corporate</span>
                </button>

                <button
                  type="button"
                  id="method-transfer"
                  onClick={() => setSelectedMethod('VIREMENT_BANCAIRE')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    selectedMethod === 'VIREMENT_BANCAIRE'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs">Virement SEPA Instantané</span>
                </button>
              </div>
            </div>

            {/* Method Details */}
            {selectedMethod === 'CARTE_BANCAIRE' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Titulaire de la carte</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Numéro de carte</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Expiration</label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/AA"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">CVC / Cryptogramme</label>
                    <input
                      type="text"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'VIREMENT_BANCAIRE' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700">Coordonnées SEPA Nexa :</span>
                  <button
                    type="button"
                    onClick={handleCopyIban}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    {copiedIban ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedIban ? 'IBAN copié !' : 'Copier IBAN'}
                  </button>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
                  <div><strong>IBAN :</strong> FR76 3000 4000 5000 6000 7000 894</div>
                  <div><strong>BIC / SWIFT :</strong> BNPAFRPPXXX</div>
                  <div><strong>Bénéficiaire :</strong> NEXA SOLUTIONS SAS</div>
                  <div><strong>Référence obligatoire :</strong> {invoice.invoice_number}</div>
                </div>

                <p className="text-[11px] text-slate-500">
                  En cliquant sur confirmer, vous attestez avoir initié l'ordre de virement auprès de votre banque. Le statut sera synchronisé instantanément.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Paiement sécurisé crypté SSL 256-bit conforme aux normes bancaires PCI-DSS.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                id="btn-confirm-payment-action"
                disabled={isProcessing}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Validation en cours...</span>
                ) : (
                  <>
                    <span>Confirmer le règlement ({invoice.amount_ttc.toLocaleString('fr-FR')} €)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
