import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InvoiceType, InvoiceItem } from '../../types';
import { X, Plus, Trash2, FileText, Check } from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose }) => {
  const { projects, users, createInvoice } = useApp();

  const [type, setType] = useState<InvoiceType>('CLIENT_INVOICE');
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [clientId, setClientId] = useState<string>(
    users.find((u) => u.role === 'CLIENT')?.id || ''
  );
  const [devId, setDevId] = useState<string>(
    users.find((u) => u.role === 'DEV')?.id || ''
  );
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [tvaRate, setTvaRate] = useState<number>(20);
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    {
      description: 'Prestation de développement logiciel & livrable',
      quantity: 1,
      unit_price: 5000,
      total: 5000,
    },
  ]);
  const [notes, setNotes] = useState('Paiement à 30 jours date d’émission.');

  if (!isOpen) return null;

  const clients = users.filter((u) => u.role === 'CLIENT');
  const devs = users.filter((u) => u.role === 'DEV');

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { description: 'Nouvelle ligne de prestation', quantity: 1, unit_price: 1000, total: 1000 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          const qty = Number(field === 'quantity' ? value : updated.quantity) || 0;
          const price = Number(field === 'unit_price' ? value : updated.unit_price) || 0;
          updated.total = qty * price;
        }
        return updated;
      })
    );
  };

  const totalHT = items.reduce((sum, item) => sum + item.total, 0);
  const totalTTC = totalHT * (1 + tvaRate / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const invoiceNumber =
      type === 'CLIENT_INVOICE'
        ? `FAC-2026-${Math.floor(Math.random() * 900 + 100)}`
        : `HON-2026-${Math.floor(Math.random() * 900 + 100)}`;

    const formattedItems: InvoiceItem[] = items.map((item, i) => ({
      id: `item_${Date.now()}_${i}`,
      ...item,
    }));

    createInvoice({
      invoice_number: invoiceNumber,
      type,
      title: title || (type === 'CLIENT_INVOICE' ? 'Facture de prestation' : 'Note d’honoraires développeur'),
      project_id: projectId,
      client_id: type === 'CLIENT_INVOICE' ? clientId : undefined,
      dev_id: type === 'DEV_PAYOUT' ? devId : undefined,
      amount_ht: totalHT,
      tva_rate: tvaRate,
      amount_ttc: totalTTC,
      status: 'PENDING',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      items: formattedItems,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="create-invoice-modal"
        className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl my-8 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Émettre une Nouvelle Facture / Note</h2>
              <p className="text-[11px] text-slate-500">Module de facturation et gestion financière</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType('CLIENT_INVOICE');
                setTvaRate(20);
              }}
              className={`p-3 rounded-xl border text-center transition-all ${
                type === 'CLIENT_INVOICE'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="font-semibold">Facture Client (Entrante)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Pour entreprise partenaire</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('DEV_PAYOUT');
                setTvaRate(0);
              }}
              className={`p-3 rounded-xl border text-center transition-all ${
                type === 'DEV_PAYOUT'
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="font-semibold">Honoraires Développeur (Sortante)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Rémunération prestataire</div>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Projet rattaché</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                {projects.length === 0 ? (
                  <option value="">-- Aucun projet (Optionnel) --</option>
                ) : (
                  <>
                    <option value="">Sélectionner un projet...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {type === 'CLIENT_INVOICE' ? (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Client Facturé</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  {clients.length === 0 ? (
                    <option value="">-- Aucun client créé --</option>
                  ) : (
                    <>
                      <option value="">Sélectionner un client...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.job_title || 'Client'})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Développeur Bénéficiaire</label>
                <select
                  value={devId}
                  onChange={(e) => setDevId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  {devs.length === 0 ? (
                    <option value="">-- Aucun développeur créé --</option>
                  ) : (
                    <>
                      <option value="">Sélectionner un développeur...</option>
                      {devs.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.job_title || 'Dev'})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Libellé / Titre de la facture</label>
              <input
                type="text"
                required
                placeholder="Ex: Acompte 30% ou Sprint 3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date d'échéance</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Taux TVA (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tvaRate}
                  onChange={(e) => setTvaRate(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800">Lignes de Prestations</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Ajouter une ligne
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto p-1">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    required
                    placeholder="Description de la prestation"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qté"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono text-center text-slate-800"
                  />
                  <div className="relative w-28">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      placeholder="Prix HT"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono text-right text-slate-800 pr-5"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-slate-400">€</span>
                  </div>
                  <span className="w-24 text-right font-mono font-bold text-slate-900 text-xs">
                    {item.total.toLocaleString('fr-FR')} €
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Preview */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
            <div className="text-xs space-y-0.5">
              <div>Total HT : <strong className="font-mono text-slate-200">{totalHT.toLocaleString('fr-FR')} €</strong></div>
              <div className="text-slate-400 text-[11px]">TVA ({tvaRate}%) : {((totalHT * tvaRate) / 100).toLocaleString('fr-FR')} €</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Net TTC</span>
              <span className="text-xl font-extrabold font-mono text-emerald-400">
                {totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes / Conditions particulières</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              Émettre la Facture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
