import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  UserPlus,
  Shield,
  Code2,
  Building,
  Briefcase,
  CheckCircle2,
  Lock,
  UserCheck,
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUser?: User | null;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, initialUser }) => {
  const { createUser, updateUser } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<UserRole>('DEV');

  useEffect(() => {
    if (initialUser) {
      setName(initialUser.name || '');
      setEmail(initialUser.email || '');
      setPassword(initialUser.password || '');
      setJobTitle(initialUser.job_title || '');
      setRole(initialUser.role || 'DEV');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setJobTitle('');
      setRole('DEV');
    }
  }, [initialUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (initialUser) {
      updateUser(initialUser.id, {
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || initialUser.password || 'Adm@n2026',
        role,
        job_title: jobTitle.trim() || undefined,
      });
    } else {
      createUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || 'Nexa2026!',
        role,
        job_title: jobTitle.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <div
        id="create-user-modal"
        className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {initialUser ? (
              <UserCheck className="w-5 h-5 text-slate-900" />
            ) : (
              <UserPlus className="w-5 h-5 text-slate-900" />
            )}
            <h3 className="font-bold text-slate-900 text-sm">
              {initialUser ? 'Modifier le Compte & Identifiants' : 'Créer un Nouvel Utilisateur'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-semibold mb-1">Adresse e-mail de connexion *</label>
              <input
                id="input-new-user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@entreprise.fr"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-800 font-semibold mb-1">
                {initialUser ? 'Nouveau mot de passe' : 'Mot de passe initial *'}
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  id="input-new-user-password"
                  type="text"
                  required={!initialUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={initialUser ? 'Laisser vide pour conserver' : 'Mot de passe'}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-1">Poste ou Organisation</label>
            <input
              id="input-new-user-job"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="ex: Directeur Technique / Responsable Projet"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-2">Rôle & Niveau d'Accès *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                id="select-role-admin-btn"
                onClick={() => setRole('ADMIN')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  role === 'ADMIN' || role === 'SUPER_ADMIN'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-xs ring-1 ring-purple-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                <span className="font-bold block text-xs">ADMIN</span>
                <span className="text-[9px] opacity-75">Accès total</span>
              </button>

              <button
                type="button"
                id="select-role-pm-btn"
                onClick={() => setRole('PROJECT_MANAGER')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  role === 'PROJECT_MANAGER'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs ring-1 ring-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Briefcase className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="font-bold block text-xs">PM</span>
                <span className="text-[9px] opacity-75">Projets & Sprints</span>
              </button>

              <button
                type="button"
                id="select-role-dev-btn"
                onClick={() => setRole('DEV')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  role === 'DEV'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs ring-1 ring-emerald-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Code2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span className="font-bold block text-xs">DEV</span>
                <span className="text-[9px] opacity-75">Tâches & Forfait</span>
              </button>

              <button
                type="button"
                id="select-role-client-btn"
                onClick={() => setRole('CLIENT')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  role === 'CLIENT'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs ring-1 ring-amber-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                <span className="font-bold block text-xs">CLIENT</span>
                <span className="text-[9px] opacity-75">Validation & Factures</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              id="btn-submit-create-user"
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {initialUser ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
