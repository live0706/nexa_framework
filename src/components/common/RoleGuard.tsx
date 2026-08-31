import React, { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { currentUser, setAdminTab, setDevTab, setClientTab } = useApp();

  if (!currentUser) return null;

  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <div id="rbac-access-denied-view" className="p-8 max-w-xl mx-auto my-12 text-center bg-slate-900/90 border border-rose-500/30 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Accès Non Autorisé</h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Votre profil (<span className="font-semibold text-rose-400">{currentUser.name}</span>) ne dispose pas des droits requis pour consulter cet espace.
          Cette restriction garantit l'isolation stricte des données entre Administrateurs, Développeurs et Clients.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            id="btn-return-home-role"
            onClick={() => {
              if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'PROJECT_MANAGER') {
                setAdminTab('dashboard');
              } else if (currentUser.role === 'DEV') {
                setDevTab('my_projects');
              } else if (currentUser.role === 'CLIENT') {
                setClientTab('overview');
              }
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retourner à mon tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
