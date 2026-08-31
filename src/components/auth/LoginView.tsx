import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Mail,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Crown,
  Briefcase,
  Code2,
  Building2,
} from 'lucide-react';
import { NexaLogo } from '../common/NexaLogo';

const DEMO_ACCOUNTS = [
  {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    email: 'admin@nexa.com',
    password: 'Adm@n2026',
    icon: Crown,
    color: 'border-slate-800 bg-slate-900 text-white',
    badge: 'Contrôle Total',
  },
  {
    role: 'PROJECT_MANAGER',
    label: 'Chef de Projet',
    email: 'pm@nexa.com',
    password: 'Pm@2026',
    icon: Briefcase,
    color: 'border-blue-200 bg-blue-50 text-blue-900',
    badge: 'Gestion & Équipe',
  },
  {
    role: 'DEV',
    label: 'Développeur',
    email: 'dev@nexa.com',
    password: 'Dev@2026',
    icon: Code2,
    color: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    badge: 'Kanban & Code',
  },
  {
    role: 'CLIENT',
    label: 'Client',
    email: 'client@nexa.com',
    password: 'Client@2026',
    icon: Building2,
    color: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    badge: 'Validation & Suivi',
  },
];

export const LoginView: React.FC = () => {
  const { loginWithCredentials } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFillAccount = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setErrorMessage(null);
  };

  const handleDirectLogin = async (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const success = await loginWithCredentials(accEmail, accPass);
      if (!success) {
        setErrorMessage('Échec de connexion automatique.');
      }
    } catch {
      setErrorMessage('Une erreur est survenue lors de la tentative de connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Veuillez saisir votre adresse e-mail et votre mot de passe.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const success = await loginWithCredentials(email, password);
      if (!success) {
        setErrorMessage('Identifiants incorrects. Veuillez vérifier l\'adresse e-mail et le mot de passe.');
      }
    } catch {
      setErrorMessage('Une erreur est survenue lors de la tentative de connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-view-screen" className="min-h-screen bg-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* App Logo */}
        <div className="mb-3 flex justify-center">
          <NexaLogo size={58} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          NEXA
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Plateforme de pilotage et gestion de projets partagés
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Main Authentication Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Espace de Connexion</h2>
            </div>
            <span className="text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
              Portail Collaboratif
            </span>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="input-login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  id="input-login-email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nexa.com, pm@nexa.com, ..."
                  autoComplete="username email"
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-login-password" className="block text-xs font-semibold text-slate-700">
                  Mot de passe
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg pl-9 pr-11 py-2.5 text-sm sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-2 flex items-center justify-center text-slate-400 hover:text-slate-600 active:text-slate-900 cursor-pointer touch-manipulation"
                  title={showPassword ? 'Masquer' : 'Afficher'}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-submit-manual-login"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:opacity-75 text-white font-semibold py-3 sm:py-2.5 px-4 rounded-lg text-sm sm:text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer touch-manipulation min-h-[44px]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Demo Access Buttons for Mobile / Desktop */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
            <span>⚡ Accès Rapide par Rôle</span>
            <span className="text-[10px] font-normal text-slate-500">1-clic mobile</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const IconComponent = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDirectLogin(acc.email, acc.password)}
                  className="flex flex-col items-start text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-white active:bg-slate-100 transition-all cursor-pointer min-h-[56px] justify-center"
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <IconComponent className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span className="text-xs font-semibold text-slate-900 truncate">{acc.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate w-full">
                    {acc.email}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col gap-1">
            <div className="flex justify-between font-mono">
              <span>Admin: <strong className="text-slate-700">admin@nexa.com</strong> / <strong className="text-slate-700">Adm@n2026</strong></span>
            </div>
            <div className="flex justify-between font-mono">
              <span>PM: <strong className="text-slate-700">pm@nexa.com</strong> / <strong className="text-slate-700">Pm@2026</strong></span>
            </div>
            <div className="flex justify-between font-mono">
              <span>Dev: <strong className="text-slate-700">dev@nexa.com</strong> / <strong className="text-slate-700">Dev@2026</strong></span>
            </div>
            <div className="flex justify-between font-mono">
              <span>Client: <strong className="text-slate-700">client@nexa.com</strong> / <strong className="text-slate-700">Client@2026</strong></span>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Accès sécurisé et synchronisé en temps réel Cloud Firebase</span>
        </div>
      </div>
    </div>
  );
};
