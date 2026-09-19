import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const getRoleDashboard = () => {
    switch (role) {
      case 'doctor':
        return '/doctor/dashboard';
      case 'receptionist':
        return '/receptionist/dashboard';
      case 'hospital_admin':
        return '/hospital-admin/dashboard';
      case 'super_admin':
      case 'admin':
        return '/admin/dashboard';
      case 'patient':
      default:
        return '/patient/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">CareFlow</span>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">AI</span>
          </div>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold uppercase tracking-wider">
              <span>Error 403 · Access Forbidden</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Unauthorized Access
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Your current account does not hold the authorized healthcare credentials or role required to access this portal.
            </p>
          </div>

          {user && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Authenticated Account:</span>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Role:</span>
                <span className="font-bold text-teal-700 capitalize">{role}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate(getRoleDashboard())}
              className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Your Portal</span>
            </button>
            <Link
              to="/"
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        CareFlow AI Security & RBAC Guard · Access attempt logged securely.
      </footer>
    </div>
  );
};
