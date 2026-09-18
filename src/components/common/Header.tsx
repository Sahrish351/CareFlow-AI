import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { NotificationPopover } from '../notifications/NotificationPopover';
import { Activity, ShieldCheck, UserCheck, Stethoscope, Menu, LogOut, Search } from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, role, switchDemoRole, signOut } = useAuth();
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-teal-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base">CareFlow</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 tracking-wider">AI</span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Smart Hospital Navigation</p>
          </div>
        </Link>
      </div>

      {/* Global Search Shortcut Button */}
      <button
        onClick={() => setShowGlobalSearch(true)}
        className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-500 transition max-w-xs w-full"
      >
        <Search className="w-3.5 h-3.5 text-teal-600" />
        <span className="flex-1 text-left truncate">Search doctors, care, hospitals...</span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400">⌘K</kbd>
      </button>

      {/* Center: Interactive Demo Role Switcher for seamless evaluation */}
      <div className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">Role:</span>
        {(['patient', 'doctor', 'admin'] as UserRole[]).map((r) => {
          const isActive = role === r;
          return (
            <button
              key={r}
              onClick={() => switchDemoRole(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all duration-150 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white text-teal-800 shadow-sm font-bold ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {r === 'patient' && <UserCheck className="w-3.5 h-3.5 text-teal-600" />}
              {r === 'doctor' && <Stethoscope className="w-3.5 h-3.5 text-blue-600" />}
              {r === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
              {r}
            </button>
          );
        })}
      </div>

      {/* Right Side: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowGlobalSearch(true)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <NotificationPopover />

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || 'User'}`}
            alt={user?.full_name || 'User'}
            className="w-8 h-8 rounded-full ring-2 ring-teal-500/20 object-cover bg-slate-100"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
              {user?.full_name}
            </p>
            <p className="text-[10px] text-teal-600 font-medium capitalize flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              {role} portal
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          title="Sign Out"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
    <GlobalSearchModal
      isOpen={showGlobalSearch}
      onClose={() => setShowGlobalSearch(false)}
    />
    </>
  );
};

