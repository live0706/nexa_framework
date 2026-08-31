import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Layers,
  Lock,
  Mail,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ArrowRight,
  UserPlus,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithCredentials } = useApp();
  const [email, setEmail] = useState('admin@nexa.com');
  const [password, setPassword] = useState('Adm@n2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleFillAdmin = () => {
    setEmail('admin@nexa.com');
    setPassword('Adm@n2026');
    setErrorMessage(null);
  };

  return (
    <div id="login-view-screen" className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* App Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 shadow-md mb-3 text-white">
          <Layers className="w-8 h-8 text-slate-100" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          NEXA DASHBOARD
        </h1>
        <p className="mt-1.5 text-xs text-slate-600">
          Espace de gestion vierge prêt pour la saisie et les tests réels
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Main Authentication Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Connexion Administrateur</h2>
            </div>
            <span className="text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-semibold">
              SUPER_ADMIN
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="input-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nexa.com"
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Mot de passe
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Adm@n2026"
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg pl-9 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  title={showPassword ? 'Masquer' : 'Afficher'}
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
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
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

        {/* Master Admin Info Box */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div
            onClick={handleFillAdmin}
            className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-all cursor-pointer flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-rose-100 border border-rose-200 shrink-0">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900 truncate">Accès Administrateur Unique</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono mt-0.5">
                  <span className="font-semibold text-slate-800">admin@nexa.com</span>
                  <span>•</span>
                  <span className="bg-white border border-rose-200 px-1 rounded font-bold text-rose-700">Adm@n2026</span>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex items-center text-rose-700 text-[11px] font-bold gap-1">
              <span>Remplir</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <UserPlus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Toutes les données statiques ont été purgées. Vous pouvez créer vos Chefs de projet, Développeurs et Clients directement depuis l'interface d'administration.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
