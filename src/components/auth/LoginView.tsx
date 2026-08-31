import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Code2,
  Building2,
  Layers,
  ArrowRight,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const { users, login } = useApp();
  const [selectedUserForLogin, setSelectedUserForLogin] = useState<string>(users[0]?.id || '');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('••••••••');
  const [activeMode, setActiveMode] = useState<'persona' | 'manual'>('persona');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = users.find(
      (u) => u.email.toLowerCase() === customEmail.toLowerCase()
    );
    if (matched) {
      login(matched.id);
    } else {
      // If user not in seed list, pick the first user with matching domain or default to admin
      login(users[0].id);
    }
  };

  const getRoleCardStyle = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          border: 'border-purple-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50/70',
          badge: 'bg-purple-100 border-purple-200 text-purple-800',
          icon: <ShieldAlert className="w-5 h-5 text-purple-700" />,
        };
      case 'DEV':
        return {
          border: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/70',
          badge: 'bg-emerald-100 border-emerald-200 text-emerald-800',
          icon: <Code2 className="w-5 h-5 text-emerald-700" />,
        };
      case 'CLIENT':
        return {
          border: 'border-amber-200 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50/70',
          badge: 'bg-amber-100 border-amber-200 text-amber-900',
          icon: <Building2 className="w-5 h-5 text-amber-700" />,
        };
    }
  };

  return (
    <div id="login-view-screen" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 text-center px-4">
        {/* App Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 shadow-md mb-4 text-white">
          <Layers className="w-8 h-8 text-slate-100" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          NEXA DASHBOARD
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          Plateforme d'entreprise de gestion et pilotage de projets avec contrôle d'accès strict par rôles (RBAC).
        </p>

        {/* Mode switcher tabs */}
        <div className="mt-6 inline-flex p-1 bg-slate-100 border border-slate-200 rounded-xl shadow-xs">
          <button
            id="tab-persona-selector"
            type="button"
            onClick={() => setActiveMode('persona')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeMode === 'persona'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Sélection Rapide des Profils (1-Clic)
          </button>
          <button
            id="tab-manual-login"
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeMode === 'manual'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            Formulaire de Connexion
          </button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 relative z-10">
        {activeMode === 'persona' ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Choisissez un compte de test RBAC</h3>
                <p className="text-xs text-slate-500">Cliquez sur un profil pour explorer l'interface avec ses restrictions dédiées.</p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono">
                {users.length} comptes prêts
              </span>
            </div>

            {/* Persona Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {users.map((user) => {
                const style = getRoleCardStyle(user.role);
                return (
                  <button
                    key={user.id}
                    id={`login-as-persona-${user.id}`}
                    onClick={() => login(user.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 group relative overflow-hidden ${style.border}`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                          {user.name}
                        </p>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${style.badge}`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate leading-snug">
                        {user.job_title || user.email}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 truncate font-mono">
                        {user.email}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-all shrink-0 self-center group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>

            {/* Summary of RBAC Privileges */}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-200">
                <span className="font-semibold text-purple-900 block mb-0.5">Admin</span>
                Totalité des projets, gestion des utilisateurs & KPIs.
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <span className="font-semibold text-emerald-900 block mb-0.5">Développeur</span>
                Projets assignés, Kanban, suivi du temps & notes internes.
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                <span className="font-semibold text-amber-900 block mb-0.5">Client</span>
                Ses projets seuls, validation jalons & tâches visibles.
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleManualLogin}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adresse e-mail d'entreprise</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="input-login-email"
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="ex: sarah.dubois@intranet.corp"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="input-login-password"
                  type="password"
                  required
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ou sélectionner un utilisateur existant</label>
              <select
                id="select-existing-user"
                value={selectedUserForLogin}
                onChange={(e) => {
                  setSelectedUserForLogin(e.target.value);
                  const u = users.find((item) => item.id === e.target.value);
                  if (u) setCustomEmail(u.email);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) - {u.email}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="btn-submit-manual-login"
              type="submit"
              className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Se connecter à l'intranet
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
