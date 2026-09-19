import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Stethoscope, 
  UserCheck, 
  Lock, 
  Mail, 
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, role, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMessage = (location.state as any)?.message;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to appropriate role portal
  useEffect(() => {
    if (user) {
      if (role === 'doctor') navigate('/doctor/dashboard', { replace: true });
      else if (role === 'receptionist') navigate('/receptionist/dashboard', { replace: true });
      else if (role === 'hospital_admin') navigate('/hospital-admin/dashboard', { replace: true });
      else if (role === 'super_admin' || role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/patient/dashboard', { replace: true });
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Invalid login credentials') || msg.includes('invalid_grant')) {
        setError('Incorrect email or password. Please verify your credentials.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Email not yet confirmed. Please verify your email via the confirmation link sent by Supabase.');
      } else {
        setError(msg || 'Unable to sign in. Please verify your healthcare login credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillCredentials = (targetRole: 'patient' | 'doctor' | 'admin') => {
    setError(null);
    if (targetRole === 'patient') {
      setEmail('patient.ahmed@careflow.ai');
      setPassword('password123');
    } else if (targetRole === 'doctor') {
      setEmail('dr.sarah.farooq@careflow.ai');
      setPassword('password123');
    } else if (targetRole === 'admin') {
      setEmail('admin.kamran@careflow.ai');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-slate-900 font-sans">
      {/* Left Column: Premium Healthcare Branding Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Real Hospital Exterior / Interior Photography Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80"
            alt="Modern Hospital Architecture"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl text-white tracking-tight">CareFlow</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">AI</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Hospital Ecosystem</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            "Your intelligent guide through healthcare."
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            CareFlow AI connects symptoms with verified hospital departments, real-time doctor slots, live queue countdowns, and encrypted medical records.
          </p>

          <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Real-time clinic waiting queue transparency</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Deterministic emergency red-flag safety routing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Strict double-booking prevention engine</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} CareFlow AI Technologies Inc. Secure Healthcare Infrastructure.
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full space-y-7">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900">CareFlow AI</span>
            </Link>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Sign in to CareFlow
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Access your personalized health dashboard and appointments.
            </p>
          </div>

          {/* Flash Redirect Message Banner */}
          {redirectMessage && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-start gap-3 text-amber-900 text-xs shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">Authentication Required</p>
                <p className="mt-0.5 text-amber-800">{redirectMessage}</p>
              </div>
            </div>
          )}

          {/* Quick Demo Credentials Autofill */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Demo Evaluation Accounts
              </span>
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-100 px-2 py-0.5 rounded">
                Click to Fill
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillCredentials('patient')}
                className="p-2.5 bg-white hover:bg-teal-600 text-teal-900 hover:text-white rounded-xl border border-teal-200 text-xs font-bold transition-all flex flex-col items-center gap-1 shadow-2xs group cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-teal-600 group-hover:text-white" />
                <span>Patient</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('doctor')}
                className="p-2.5 bg-white hover:bg-teal-600 text-teal-900 hover:text-white rounded-xl border border-teal-200 text-xs font-bold transition-all flex flex-col items-center gap-1 shadow-2xs group cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-blue-600 group-hover:text-white" />
                <span>Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('admin')}
                className="p-2.5 bg-white hover:bg-teal-600 text-teal-900 hover:text-white rounded-xl border border-teal-200 text-xs font-bold transition-all flex flex-col items-center gap-1 shadow-2xs group cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 group-hover:text-white" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">Or enter credentials</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient.alex@careflow.ai"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-teal-600 hover:text-teal-700 font-semibold text-[11px]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-xs text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span className="ml-2">Remember my session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In to Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
                Register as a Patient
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
