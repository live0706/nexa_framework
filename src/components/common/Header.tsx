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
  RotateCcw,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { UserRole } from '../../types';

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
        {/* Brand & RBAC status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-5 h-5 text-slate-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base tracking-tight">NEXA DASHBOARD</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-slate-100 border border-slate-200 text-slate-600">
                RBAC v2.5
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              SuperAdmin • Gestionnaire de Projets • Développeurs • Clients
            </p>
          </div>
        </div>

        {/* Quick Role & Persona Switcher Simulator */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Fast Role Quick-Pills for desktop */}
          <div className="hidden xl:flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 px-2 py-1 flex items-center gap-1 font-medium text-[11px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Rôle de test :
            </span>
            {users.map((u) => {
              const isActive = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  id={`quick-switch-${u.id}`}
                  onClick={() => switchUser(u.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? u.role === 'SUPER_ADMIN'
                        ? 'bg-rose-700 text-white shadow-xs font-semibold'
                        : u.role === 'PROJECT_MANAGER'
                        ? 'bg-blue-700 text-white shadow-xs font-semibold'
                        : u.role === 'ADMIN'
                        ? 'bg-purple-700 text-white shadow-xs font-semibold'
                        : u.role === 'DEV'
                        ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                        : 'bg-amber-700 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                  title={`${u.name} (${u.role}) - ${u.job_title}`}
                >
                  <span className="truncate max-w-[85px]">{u.name.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-75 font-mono">[{u.role}]</span>
                </button>
              );
            })}
          </div>

          {/* User Switcher Dropdown */}
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

                  {/* Persona Switch List */}
                  <div className="py-2">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Changer de rôle / utilisateur
                    </p>
                    <div className="space-y-0.5 max-h-56 overflow-y-auto">
                      {users.map((u) => {
                        const isCurrent = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            id={`select-user-${u.id}`}
                            onClick={() => {
                              switchUser(u.id);
                              setShowSwitchMenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                              isCurrent
                                ? 'bg-indigo-50 text-indigo-950 font-semibold border border-indigo-200'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div className="truncate">
                                <p className="font-medium text-xs text-slate-900 truncate">{u.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{u.job_title || u.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                  u.role === 'SUPER_ADMIN'
                                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                                    : u.role === 'PROJECT_MANAGER'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : u.role === 'ADMIN'
                                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                                    : u.role === 'DEV'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                                }`}
                              >
                                {u.role}
                              </span>
                              {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      id="btn-reset-demo-data"
                      onClick={() => {
                        resetAllData();
                        setShowSwitchMenu(false);
                      }}
                      className="text-[11px] text-slate-600 hover:text-amber-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                      title="Restaurer les projets et données de démo"
                    >
                      <RotateCcw className="w-3 h-3" /> Réinitialiser démo
                    </button>
                    <button
                      id="btn-logout"
                      onClick={() => {
                        logout();
                        setShowSwitchMenu(false);
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors font-medium"
                    >
                      <LogOut className="w-3 h-3" /> Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
