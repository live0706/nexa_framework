import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  UserPlus,
  Shield,
  Code2,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { UserRole } from '../../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose }) => {
  const { createUser } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<UserRole>('DEV');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    createUser({
      name: name.trim(),
      email: email.trim(),
      role,
      job_title: jobTitle.trim() || undefined,
    });

    setName('');
    setEmail('');
    setJobTitle('');
    setRole('DEV');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <div
        id="create-user-modal"
        className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-slate-900" />
            <h3 className="font-bold text-slate-900 text-sm">Ajouter un Utilisateur & Définir son Rôle</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-800 font-semibold mb-1">Nom complet *</label>
            <input
              id="input-new-user-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Alexia Vasseur"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-1">Adresse e-mail professionnelle *</label>
            <input
              id="input-new-user-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: alexia.vasseur@intranet.corp"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-1">Poste ou Organisation</label>
            <input
              id="input-new-user-job"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="ex: Lead Tech Backend / Responsable Achats Client"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-2">Rôle & Privilèges RBAC *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="select-role-admin-btn"
                onClick={() => setRole('ADMIN')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'ADMIN'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                <span className="font-bold block">ADMIN</span>
                <span className="text-[9px] opacity-75">Accès total</span>
              </button>

              <button
                type="button"
                id="select-role-dev-btn"
                onClick={() => setRole('DEV')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'DEV'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Code2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span className="font-bold block">DEV</span>
                <span className="text-[9px] opacity-75">Projets assignés</span>
              </button>

              <button
                type="button"
                id="select-role-client-btn"
                onClick={() => setRole('CLIENT')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'CLIENT'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                <span className="font-bold block">CLIENT</span>
                <span className="text-[9px] opacity-75">Validation & suivi</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              id="btn-submit-create-user"
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Créer l'utilisateur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
