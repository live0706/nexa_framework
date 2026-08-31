import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contract, ContractTranche, ContractSignature } from '../../types';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  PenTool,
  Building2,
  UserCheck,
  DollarSign,
  Layers,
  Sparkles,
  Calendar,
  AlertCircle,
  Hash,
  Send,
} from 'lucide-react';

interface ContractDetailModalProps {
  contract: Contract | null;
  onClose: () => void;
  onOpenSign?: (contract: Contract) => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  contract,
  onClose,
  onOpenSign,
}) => {
  const { currentUser, users, projects, milestones, triggerTranchePayout, signContract, showToast } = useApp();
  const [signatureMode, setSignatureMode] = useState<'VIEW' | 'SIGN'>('VIEW');
  const [signerName, setSignerName] = useState(currentUser?.name || '');
  const [signatureType, setSignatureType] = useState<'TYPED' | 'DRAWN' | 'ELECTRONIC_CERT'>('ELECTRONIC_CERT');

  if (!contract) return null;

  const project = projects.find((p) => p.id === contract.project_id);
  const clientUser = users.find((u) => u.id === contract.client_id);
  const devUser = users.find((u) => u.id === contract.dev_id);

  const isDevContract = contract.type === 'DEV_SERVICE_CONTRACT';
  const hasUserSigned = currentUser
    ? contract.signatures.some((s) => s.user_id === currentUser.id)
    : false;

  const canSign =
    currentUser &&
    !hasUserSigned &&
    (currentUser.role === 'SUPER_ADMIN' ||
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'PROJECT_MANAGER' ||
      (isDevContract && currentUser.id === contract.dev_id) ||
      (!isDevContract && currentUser.id === contract.client_id));

  const handlePrint = () => {
    window.print();
  };

  const handleExecuteSign = (e: React.FormEvent) => {
    e.preventDefault();
    signContract(contract.id, signatureType, signerName);
    setSignatureMode('VIEW');
  };

  const getTrancheBadge = (status: ContractTranche['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Réglé / Versé
          </span>
        );
      case 'PAYOUT_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Send className="w-3 h-3" /> Échéance Déclenchée
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> En attente jalon
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{contract.contract_number}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-semibold">
                  {isDevContract ? 'CONTRAT PRESTATAIRE DÉVELOPPEUR' : 'CONTRAT CLIENT CADRE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md">{contract.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Imprimer ou enregistrer en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Content / Paper Document view */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800 bg-slate-50/50">
          {/* Paper Canvas */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6 max-w-3xl mx-auto">
            {/* Header / Letterhead */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <div className="font-extrabold text-lg tracking-tight text-slate-900">NEXA DIGITAL AGENCY</div>
                <p className="text-[11px] text-slate-500">Plateforme de gouvernance & ingénierie logicielle</p>
                <p className="text-[11px] text-slate-500 font-mono">SIRET 892 341 002 00018 • TVA FR 82 892341002</p>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-sm text-slate-900">{contract.contract_number}</div>
                <div className="text-[11px] text-slate-500">
                  Date d’émission : {new Date(contract.created_at).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-[11px] text-slate-500">
                  Période : {new Date(contract.start_date).toLocaleDateString('fr-FR')} au {new Date(contract.end_date).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Donneur d'ordre / Émetteur
                </span>
                <div className="font-bold text-slate-900">Nexa Digital SAS</div>
                <div className="text-[11px] text-slate-600">Projet : <strong className="text-slate-800">{project?.name}</strong></div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  {isDevContract ? 'Prestataire Développeur' : 'Client Bénéficiaire'}
                </span>
                <div className="font-bold text-slate-900">
                  {isDevContract ? devUser?.name : clientUser?.name}
                </div>
                <div className="text-[11px] text-slate-600">
                  {isDevContract ? devUser?.job_title : clientUser?.job_title}
                </div>
                <div className="text-[11px] text-slate-500">{isDevContract ? devUser?.email : clientUser?.email}</div>
              </div>
            </div>

            {/* Object of contract */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
                Article 1 — Objet de la Convention & Modalités Forfaitaires
              </h4>
              <p className="text-slate-700 leading-relaxed text-xs">
                {contract.terms ||
                  `La présente convention forfaitaire a pour objet l'exécution des prestations d'ingénierie et de développement informatique pour le compte du projet "${project?.name}". Conformément aux dispositions arrêtées, la rémunération n'est pas assujettie à un décompte horaire mais s'opère par échelonnement forfaitaire adossé à la validation formelle des jalons techniques.`}
              </p>
            </div>

            {/* Staggered Tranches Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Article 2 — Échéancier de Paiement Échelonné ({contract.tranches.length} Tranches)
                </h4>
                <span className="text-xs font-mono font-bold text-slate-900">
                  Total Forfait HT : {contract.total_amount_ht.toLocaleString('fr-FR')} €
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-600">
                    <tr>
                      <th className="p-3">Phase / Tranche</th>
                      <th className="p-3">Jalon Associé</th>
                      <th className="p-3 text-right">Quote-part (%)</th>
                      <th className="p-3 text-right">Montant HT</th>
                      <th className="p-3 text-right">Montant TTC</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contract.tranches.map((tranche, idx) => {
                      const milestone = milestones.find((m) => m.id === tranche.milestone_id);
                      return (
                        <tr key={tranche.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{tranche.title}</div>
                            <div className="text-[10px] text-slate-500">{tranche.description}</div>
                          </td>
                          <td className="p-3">
                            {milestone ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                <Layers className="w-3 h-3 text-indigo-600" />
                                {milestone.title}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Signature devis</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            {tranche.percentage}%
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-slate-800">
                            {tranche.amount_ht.toLocaleString('fr-FR')} €
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {tranche.amount_ttc.toLocaleString('fr-FR')} €
                          </td>
                          <td className="p-3">{getTrancheBadge(tranche.status)}</td>
                          <td className="p-3 text-right">
                            {tranche.status === 'PENDING' && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'PROJECT_MANAGER' || currentUser?.role === 'ADMIN') && (
                              <button
                                onClick={() => triggerTranchePayout(contract.id, tranche.id)}
                                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold transition-colors"
                              >
                                Déclencher
                              </button>
                            )}
                            {tranche.status === 'PAYOUT_REQUESTED' && (
                              <span className="text-[10px] font-mono text-indigo-600 font-semibold">
                                Transmis comptabilité
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-slate-600 space-y-0.5">
                <div>Régime TVA applicable : <strong>{contract.tva_rate}%</strong></div>
                <div>Règlement par virement bancaire SEPA sous 15 jours suivant validation d'échéance.</div>
              </div>

              <div className="text-right font-mono space-y-0.5">
                <div className="text-xs text-slate-600">
                  Total HT : <strong>{contract.total_amount_ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong>
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  Total TTC : {(contract.total_amount_ht * (1 + contract.tva_rate / 100)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </div>
              </div>
            </div>

            {/* Signatures & Certification block */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Signatures Électroniques & Horodatage Certifié
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Norme eIDAS / SHA-256</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Agency Signature */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Pour Nexa Digital SAS</div>
                  {contract.signatures.find(
                    (s) => s.user_role === 'SUPER_ADMIN' || s.user_role === 'PROJECT_MANAGER' || s.user_role === 'ADMIN'
                  ) ? (
                    <div className="space-y-1">
                      <div className="font-mono text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Signé Électroniquement
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Par {contract.signatures[0].user_name} ({contract.signatures[0].user_role})
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {contract.signatures[0].checksum || 'SHA256:8f4c...91b'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(contract.signatures[0].signed_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-700 italic">En attente de signature direction</div>
                  )}
                </div>

                {/* Counterpart Signature */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-slate-500">
                    Pour {isDevContract ? `le Prestataire (${devUser?.name})` : `le Client (${clientUser?.name})`}
                  </div>
                  {contract.signatures.find(
                    (s) => (isDevContract && s.user_id === contract.dev_id) || (!isDevContract && s.user_id === contract.client_id)
                  ) ? (
                    <div className="space-y-1">
                      <div className="font-mono text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Signé Électroniquement
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Par {isDevContract ? devUser?.name : clientUser?.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {contract.signatures[1]?.checksum || 'SHA256:3a1b...77f'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(contract.signatures[1]?.signed_at || contract.created_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-amber-700 italic">Signature en attente</div>
                      {canSign && signatureMode === 'VIEW' && (
                        <button
                          id="btn-trigger-signature-inline"
                          onClick={() => setSignatureMode('SIGN')}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                          Signer ce contrat
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Input Form if in SIGN mode */}
              {signatureMode === 'SIGN' && (
                <form
                  onSubmit={handleExecuteSign}
                  className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-4 mt-4"
                >
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-indigo-700" />
                    <h5 className="font-bold text-slate-900 text-xs">
                      Validation de la Signature Électronique
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nom complet du signataire
                      </label>
                      <input
                        type="text"
                        required
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Procédé de certification
                      </label>
                      <select
                        value={signatureType}
                        onChange={(e) => setSignatureType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                      >
                        <option value="ELECTRONIC_CERT">Certificat Numérique Sécurisé (Recommandé)</option>
                        <option value="TYPED">Signature Texte Validée</option>
                        <option value="DRAWN">Tracé Manuscrit Numérisé</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-indigo-100 text-[11px] text-slate-600 leading-relaxed">
                    En cochant et validant ci-dessous, vous reconnaissez avoir pris connaissance des clauses forfaitaires, des livrables et de l'échéancier financier échelonné.
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSignatureMode('VIEW')}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirmer la Signature & Horodater
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            ID: {contract.id} • Statut : <strong className="text-slate-800">{contract.status}</strong>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
