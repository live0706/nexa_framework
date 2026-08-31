import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contract, ContractTranche, DevContractProfile } from '../../types';
import {
  FileText,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  PenTool,
  ShieldCheck,
  Building2,
  Landmark,
  Layers,
  Edit2,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';
import { ContractDetailModal } from './ContractDetailModal';

export const DevContractsView: React.FC = () => {
  const {
    currentUser,
    projects,
    milestones,
    getDevContracts,
    getDevProfile,
    updateDevProfile,
    getDevInvoices,
    showToast,
  } = useApp();

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  if (!currentUser) return null;

  const myContracts = getDevContracts(currentUser.id);
  const totalContractedAmount = myContracts.reduce((sum, c) => sum + c.total_amount_ht, 0);

  const myProfile: DevContractProfile = getDevProfile(currentUser.id) || {
    user_id: currentUser.id,
    legal_status: 'Micro-Entreprise (BNC)',
    company_name: `${currentUser.name} Engineering`,
    siren_siret: '892 341 002 00018',
    siret: '892 341 002 00018',
    vat_number: 'Non assujetti (Art. 293 B du CGI)',
    iban_masked: 'FR76 •••• •••• •••• 7000 123',
    iban: 'FR76 3000 4000 5000 6000 7000 123',
    bic: 'BNPAFR21',
    address: '14 Rue de la Paix, 75002 Paris',
    active_contracts_count: myContracts.length,
    total_contracted_amount: totalContractedAmount,
    total_paid_amount: 0,
  };

  const [profileForm, setProfileForm] = useState<DevContractProfile>(myProfile);

  // Tranches aggregation
  const allTranches = myContracts.flatMap((c) => c.tranches);
  const paidTranches = allTranches.filter((t) => t.status === 'PAID');
  const totalPaid = paidTranches.reduce((sum, t) => sum + t.amount_ht, 0);

  const readyTranches = allTranches.filter((t) => t.status === 'PAYOUT_REQUESTED');
  const totalReady = readyTranches.reduce((sum, t) => sum + t.amount_ht, 0);

  const pendingTranches = allTranches.filter((t) => t.status === 'PENDING');
  const totalPending = pendingTranches.reduce((sum, t) => sum + t.amount_ht, 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateDevProfile(profileForm);
    setIsEditingProfile(false);
  };

  return (
    <div id="dev-contracts-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Espace Contrats & Rémunérations Forfaitaires</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Contrat Forfaitaire Échelonné
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Votre rémunération est régie par contrat forfaitaire signé, échelonnée et débloquée à chaque jalon validé.
          </p>
        </div>

        <button
          onClick={() => setIsEditingProfile(true)}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Building2 className="w-4 h-4" />
          Gérer mon Profil Juridique & IBAN
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Forfaits */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Forfaits Contractualisés</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {totalContractedAmount.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-500">HT</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sur {myContracts.length} contrat(s) signé(s)
          </p>
        </div>

        {/* Card 2: Déjà Versé */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Honoraires Reçus</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
            {totalPaid.toLocaleString('fr-FR')} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {paidTranches.length} tranche(s) acquittée(s)
          </p>
        </div>

        {/* Card 3: Prêt au versement */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jalons Validés (Virement en cours)</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 font-mono">
            {totalReady.toLocaleString('fr-FR')} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {readyTranches.length} tranche(s) en traitement comptable
          </p>
        </div>

        {/* Card 4: En attente jalon */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Solde Restant à Débloquer</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-2 font-mono">
            {totalPending.toLocaleString('fr-FR')} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Conditionné à la livraison des jalons
          </p>
        </div>
      </div>

      {/* Freelance & Bank Profile Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{myProfile.company_name || currentUser.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-mono">
                {myProfile.legal_status}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-0.5">
              SIRET : {myProfile.siret} • IBAN : {myProfile.iban}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditingProfile(true)}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Modifier coordonnées
        </button>
      </div>

      {/* Contracts and Staggered Tranches Detail */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Vos Contrats de Prestation Forfaitaires</h3>
          <span className="text-xs text-slate-500 font-mono">{myContracts.length} contrat(s) actif(s)</span>
        </div>

        {myContracts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Aucun contrat de prestation ne vous est actuellement attribué.
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
                {/* Contract Summary Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {contract.contract_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          contract.status === 'ACTIVE_SIGNED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {contract.status === 'ACTIVE_SIGNED' ? 'Contrat Signé & Actif' : 'En Attente de Signature'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs mt-0.5">{contract.title}</div>
                    <div className="text-[11px] text-slate-500">Projet : <strong className="text-slate-700">{project?.name}</strong></div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Montant Forfaitaire</div>
                      <div className="font-mono font-extrabold text-base text-slate-900">
                        {contract.total_amount_ht.toLocaleString('fr-FR')} € HT
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedContract(contract)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {hasSigned ? 'Consulter le Contrat' : 'Signer le Contrat'}
                    </button>
                  </div>
                </div>

                {/* Staggered Tranches for this contract */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Échelonnement des Tranches ({contract.tranches.length} Échéances)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {contract.tranches.map((tranche, idx) => {
                      const milestone = milestones.find((m) => m.id === tranche.milestone_id);
                      return (
                        <div
                          key={tranche.id}
                          className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                            tranche.status === 'PAID'
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : tranche.status === 'PAYOUT_REQUESTED'
                              ? 'bg-indigo-50/60 border-indigo-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{tranche.title}</span>
                            <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-700">
                              {tranche.percentage}%
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-snug">{tranche.description}</p>

                          {milestone && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                              <Layers className="w-3 h-3 text-indigo-600" />
                              <span>Jalon : {milestone.title}</span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                            <span className="font-mono font-extrabold text-slate-900">
                              {tranche.amount_ht.toLocaleString('fr-FR')} € HT
                            </span>

                            {tranche.status === 'PAID' && (
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Virement Reçu
                              </span>
                            )}
                            {tranche.status === 'PAYOUT_REQUESTED' && (
                              <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Ordre de Virement
                              </span>
                            )}
                            {tranche.status === 'PENDING' && (
                              <span className="text-[10px] font-medium text-slate-500">
                                Débloqué à validation
                              </span>
                            )}
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

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Profil Juridique & Coordonnées Bancaires</h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Raison Sociale / Nom Commercial</label>
                <input
                  type="text"
                  required
                  value={profileForm.company_name}
                  onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statut Juridique</label>
                  <input
                    type="text"
                    value={profileForm.legal_status}
                    onChange={(e) => setProfileForm({ ...profileForm, legal_status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Numéro SIRET</label>
                  <input
                    type="text"
                    required
                    value={profileForm.siret}
                    onChange={(e) => setProfileForm({ ...profileForm, siret: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">IBAN de Versement SEPA</label>
                <input
                  type="text"
                  required
                  value={profileForm.iban}
                  onChange={(e) => setProfileForm({ ...profileForm, iban: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code BIC / SWIFT</label>
                  <input
                    type="text"
                    value={profileForm.bic}
                    onChange={(e) => setProfileForm({ ...profileForm, bic: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">TVA Intracommunautaire</label>
                  <input
                    type="text"
                    value={profileForm.vat_number}
                    onChange={(e) => setProfileForm({ ...profileForm, vat_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  Enregistrer les Coordonnées
                </button>
              </div>
            </form>
          </div>
        </div>
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
