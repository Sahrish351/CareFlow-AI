import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  ShieldCheck, 
  Building2, 
  Cpu, 
  Lock, 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle,
  HeartHandshake,
  Sparkles,
  Award,
  Globe2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AboutPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-base tracking-tight">CareFlow AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/hospitals"
              className="text-xs font-semibold text-slate-600 hover:text-teal-700 transition hidden sm:inline-flex"
            >
              Hospitals
            </Link>
            <Link
              to="/doctors"
              className="text-xs font-semibold text-slate-600 hover:text-teal-700 transition hidden sm:inline-flex"
            >
              Doctors
            </Link>
            <Link
              to="/services"
              className="text-xs font-semibold text-slate-600 hover:text-teal-700 transition hidden sm:inline-flex"
            >
              Specialties
            </Link>
            {user ? (
              <Link
                to="/portal"
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition shadow-xs"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950 text-white py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:28px_28px] opacity-15"></div>
        <div className="relative max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Healthcare Technology Reimagined
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Your Intelligent Guide Through Healthcare
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CareFlow AI is engineered to bridge the critical gap between patients and specialized hospital care. By combining conversational clinical routing with multi-hospital scheduling and live queue tracking, we eliminate uncertainty and wait times.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* The Problem & Our Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              The Mission
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Solving Healthcare Fragmentation with Responsible AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every day, thousands of patients struggle with a common dilemma: they experience symptoms but do not know which medical specialty or hospital department to consult. This leads to misdirected visits, overcrowded emergency departments, double-booked slots, and hours spent in waiting rooms.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              CareFlow AI provides a verified, non-diagnostic digital concierge that translates natural language symptom descriptions into optimal clinical pathways, verified physician schedules, and digital queue tickets.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Core Principles We Live By
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Safety First, Always</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We never diagnose disease or prescribe medications. Our AI acts solely as a navigation guide toward accredited human physicians.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Respect for Patient Time</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time slot reservation guarantees zero double-booking, and our live queue tracking keeps patients informed every minute.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Ironclad Data Sovereignty</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Medical reports and personal records are encrypted and protected by Supabase Row Level Security (RLS) policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Architectural Pillars */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              The Four Pillars of CareFlow AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              A modern healthcare platform designed from first principles for reliability and patient confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Gemini Clinical Router</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Powered by Google Gemini with strict prompt guardrails to parse natural symptoms into 23+ medical specialties without medical claims.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Hospital Grid</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Unified scheduling across tertiary institutions in Lahore, Islamabad, Rawalpindi, and Karachi with synchronized doctor rosters.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Live Virtual Queue</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated queue tokens and real-time wait estimation that let patients arrive when their turn is near rather than waiting in clinics.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Encrypted Document Vault</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Secure cloud storage for diagnostic scans, blood tests, and physician notes, accessible only to authorized patients and care providers.
              </p>
            </div>
          </div>
        </div>

        {/* Safety & Non-Diagnostic Guarantee */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-200 p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950">
                Non-Diagnostic Safety Architecture & Guardrails
              </h3>
              <p className="text-xs text-amber-800">
                How CareFlow AI prevents hallucinations and preserves clinical ethics.
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            CareFlow AI is engineered under strict clinical informatics boundaries. Under no circumstances will our AI provide a diagnostic label (e.g. "You have pneumonia") or recommend specific pharmaceutical dosages. Instead, our model identifies the physiological body system involved, suggests the appropriate medical specialty (e.g., Pulmonology), highlights relevant questions to ask your physician, and flags emergency red-flag symptoms that require immediate emergency room attention.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-white/80 rounded-xl border border-amber-200/80 text-xs">
              <span className="font-bold text-amber-950 block mb-0.5">No Prescription Guidance</span>
              <span className="text-amber-800 text-[11px]">Medications can only be prescribed by a licensed MD after in-person clinical examination.</span>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-amber-200/80 text-xs">
              <span className="font-bold text-amber-950 block mb-0.5">Emergency Preemption</span>
              <span className="text-amber-800 text-[11px]">Chest pain, stroke signs, and trauma immediately trigger prominent emergency diversion banners.</span>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-amber-200/80 text-xs">
              <span className="font-bold text-amber-950 block mb-0.5">Physician-in-the-Loop</span>
              <span className="text-amber-800 text-[11px]">All doctors are verified by hospital administrators before appearing in patient directories.</span>
            </div>
          </div>
        </div>

        {/* Technology Foundation */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">Modern Cloud & AI Stack</h3>
            <p className="text-xs text-slate-500">Engineered for low-latency clinical operations and high availability.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
            {[
              { name: 'React + Vite', role: 'Reactive Frontend' },
              { name: 'TypeScript', role: 'Type Safety' },
              { name: 'Tailwind CSS', role: 'Design System' },
              { name: 'Supabase DB', role: 'PostgreSQL Engine' },
              { name: 'Google Gemini', role: 'Clinical AI Logic' },
              { name: 'Supabase Auth', role: 'Identity & RLS' },
            ].map((tech, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-900">{tech.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{tech.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-teal-700 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Ready to Experience Seamless Healthcare?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              Discover verified doctors across premier regional hospitals and reserve your consultation in less than 60 seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/doctors"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-xs text-center"
            >
              Browse Specialists
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-xs text-center"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

