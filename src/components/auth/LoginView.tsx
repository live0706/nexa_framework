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
} from 'lucide-react';
import { NexaLogo } from '../common/NexaLogo';

export const LoginView: React.FC = () => {
  const { loginWithCredentials } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <div id="login-view-screen" className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
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

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
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
                  placeholder="nom@entreprise.com"
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

        {/* Security badge footer */}
        <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Accès sécurisé par contrôle de rôle (Admin, PM, Développeur, Client)</span>
        </div>
      </div>
    </div>
  );
};
