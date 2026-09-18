import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  BotMessageSquare,
  Search,
  CalendarDays,
  Clock3,
  FileText,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  Building2,
  Users2,
  SlidersHorizontal,
  X,
  Sparkles,
  Heart,
  Users,
  Activity,
  Pill,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarLink {
  to: string;
  label: string;
  icon: any;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, switchDemoRole } = useAuth();

  const patientLinks: SidebarLink[] = [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/passport', label: 'Care Passport', icon: ShieldCheck, highlight: true },
    { to: '/patient/ai-navigation', label: 'AI Navigation Agent', icon: BotMessageSquare },
    { to: '/patient/family', label: 'My Family Profiles', icon: Users },
    { to: '/patient/timeline', label: 'Health Timeline', icon: Activity },
    { to: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
    { to: '/patient/doctors', label: 'Find Doctors & Book', icon: Search },
    { to: '/patient/saved-doctors', label: 'Saved Doctors', icon: Heart },
    { to: '/patient/appointments', label: 'My Appointments', icon: CalendarDays },
    { to: '/patient/queue', label: 'Live Queue Tracker', icon: Clock3 },
    { to: '/patient/reports', label: 'Medical Reports', icon: FileText },
  ];

  const doctorLinks: SidebarLink[] = [
    { to: '/doctor/dashboard', label: 'Doctor Overview', icon: LayoutDashboard },
    { to: '/doctor/queue', label: 'Live Patient Queue', icon: Clock3 },
    { to: '/doctor/schedule', label: 'Schedule & Slots', icon: CalendarDays },
  ];

  const adminLinks: SidebarLink[] = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/analytics', label: 'Hospital Analytics', icon: BarChart3, highlight: true },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/doctors', label: 'Doctor Management', icon: Users2 },
    { to: '/admin/approvals', label: 'Doctor Approvals', icon: UserCheck },
    { to: '/admin/appointments', label: 'All Appointments', icon: SlidersHorizontal },
  ];

  const currentLinks = role === 'admin' ? adminLinks : role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <span className="text-sm font-semibold text-slate-800">CareFlow Navigation</span>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand section in sidebar for desktop */}
        <div className="hidden lg:flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-sm">CareFlow AI</h1>
            <p className="text-[10px] text-slate-400">Hospital Companion</p>
          </div>
        </div>

        {/* Role tag pill */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Active Portal</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${
              role === 'patient' ? 'bg-teal-50 text-teal-700' :
              role === 'doctor' ? 'bg-blue-50 text-blue-700' :
              'bg-purple-50 text-purple-700'
            }`}>
              {role}
            </span>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="flex-1 truncate">{link.label}</span>
                    {link.highlight && (
                      <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-teal-600 text-white animate-pulse">
                        AI
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Mobile Quick Role Switcher */}
        <div className="p-4 border-t border-slate-100 md:hidden bg-slate-50/50">
          <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">Switch Demo Role</p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => { switchDemoRole('patient'); onClose(); }}
              className={`p-1.5 text-center text-xs font-semibold rounded-lg border ${
                role === 'patient' ? 'bg-white border-teal-500 text-teal-700 shadow-xs' : 'border-slate-200 text-slate-600'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => { switchDemoRole('doctor'); onClose(); }}
              className={`p-1.5 text-center text-xs font-semibold rounded-lg border ${
                role === 'doctor' ? 'bg-white border-blue-500 text-blue-700 shadow-xs' : 'border-slate-200 text-slate-600'
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => { switchDemoRole('admin'); onClose(); }}
              className={`p-1.5 text-center text-xs font-semibold rounded-lg border ${
                role === 'admin' ? 'bg-white border-purple-500 text-purple-700 shadow-xs' : 'border-slate-200 text-slate-600'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Safety Footer note */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-[10px] text-slate-400 leading-relaxed text-center">
            CareFlow AI is an administrative navigation platform. In an emergency, dial 911 immediately.
          </p>
        </div>
      </aside>
    </>
  );
};
