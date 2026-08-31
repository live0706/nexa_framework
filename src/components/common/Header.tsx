import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Shield,
  Briefcase,
  Code2,
  Building2,
  Users,
  LogOut,
  ChevronDown,
  Check,
} from 'lucide-react';
import { UserRole } from '../../types';
import { NexaLogo } from './NexaLogo';

export const Header: React.FC = () => {
  const { currentUser, users, switchUser, logout, resetAllData } = useApp();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  if (!currentUser) return null;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          label: 'Super Admin',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-600',
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
        };
      case 'ADMIN':
        return {
          label: 'Administrateur',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-600',
          icon: <Shield className="w-3.5 h-3.5" />,
        };
      case 'PROJECT_MANAGER':
        return {
          label: 'Gestionnaire de Projet (PM)',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-600',
          icon: <Briefcase className="w-3.5 h-3.5" />,
        };
      case 'DEV':
        return {
          label: 'Développeur (Forfait)',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-600',
          icon: <Code2 className="w-3.5 h-3.5" />,
        };
      case 'CLIENT':
        return {
          label: 'Client / Partenaire',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-600',
          icon: <Building2 className="w-3.5 h-3.5" />,
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <NexaLogo size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base tracking-tight">NEXA</span>
              <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                Workspace
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Gestion de Projets & Collaborations
            </p>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Badge & Profile Menu */}
          <div className="relative">
            <button
              id="btn-user-switcher-dropdown"
              onClick={() => setShowSwitchMenu(!showSwitchMenu)}
              className="flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-800 transition-colors shadow-xs"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{currentUser.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${roleInfo.dot}`} />
                  <span className="text-[10px] text-slate-500">{roleInfo.label}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border md:hidden ${roleInfo.bg} flex items-center gap-1`}>
                {roleInfo.icon}
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showSwitchMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSwitchMenu(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium ${roleInfo.bg}`}>
                        {roleInfo.icon}
                        {roleInfo.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {currentUser.id}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      id="btn-logout"
                      onClick={() => {
                        logout();
                        setShowSwitchMenu(false);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors font-semibold cursor-pointer w-full justify-center"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Se déconnecter
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Logout button directly visible */}
          <button
            id="btn-header-quick-logout"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-medium transition-colors shadow-xs"
            title="Se déconnecter de la session active"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};
