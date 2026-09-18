import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { aiService } from '../../services/aiService';
import { Doctor, Hospital, CareCategory, AiCareSearchResult } from '../../types';
import { AppointmentWizardModal } from '../../components/booking/AppointmentWizardModal';
import { VoiceSearchButton } from '../../components/common/VoiceSearchButton';
import {
  Activity,
  ArrowRight,
  Bot,
  Calendar,
  Clock,
  FileText,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  HeartPulse,
  Search,
  CheckCircle2,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Lock,
  Menu,
  X,
  Building2,
  MapPin,
  Phone,
  Bone,
  Baby,
  Brain,
  Eye,
  Smile,
  Flame,
  Wind,
  Droplet,
  ExternalLink,
  Loader2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [careCategories, setCareCategories] = useState<CareCategory[]>([]);

  // AI Care Search state in Hero
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<AiCareSearchResult | null>(null);

  // Guided 7-step Booking Wizard State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<string | undefined>(undefined);
  const [wizardHospitalId, setWizardHospitalId] = useState<string | undefined>(undefined);
  const [wizardDoctorId, setWizardDoctorId] = useState<string | undefined>(undefined);

  // Selected specialty filter in care grid
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('All');

  // Interactive AI Showcase state
  const [activeDemoQuery, setActiveDemoQuery] = useState<'derma' | 'cardio' | 'queue'>('derma');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadPlatformData = async () => {
      const [docs, hosps, cats] = await Promise.all([
        dbService.getDoctors(),
        dbService.getHospitals(),
        Promise.resolve(dbService.getCareCategories())
      ]);
      setDoctors(docs);
      setHospitals(hosps);
      setCareCategories(cats);
    };
    loadPlatformData();
  }, []);

  const handleHeroCta = () => {
    if (user) {
      if (role === 'doctor') navigate('/doctor/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } else {
      navigate('/login', { state: { message: 'Please log in to continue to your dashboard.' } });
    }
  };

  const executeAiSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setSearchQuery(queryText);
    setIsSearching(true);
    try {
      const result = await aiService.searchCarePathway(queryText);
      setSearchResult(result);
    } catch (err) {
      console.error('Error during AI care search:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const openBookingWithPreset = (preset: { category?: string; hospitalId?: string; doctorId?: string }) => {
    setWizardCategory(preset.category);
    setWizardHospitalId(preset.hospitalId);
    setWizardDoctorId(preset.doctorId);
    setWizardOpen(true);
  };

  const filteredCategories = selectedSpecialtyFilter === 'All'
    ? careCategories
    : careCategories.filter(c => c.name.toLowerCase().includes(selectedSpecialtyFilter.toLowerCase()) || c.specialty.toLowerCase().includes(selectedSpecialtyFilter.toLowerCase()));

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      {/* -------------------------------------------------------------
          1. NAVBAR (Sticky Glassmorphic)
      -------------------------------------------------------------- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-teal-500/30 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">CareFlow</span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 tracking-wider">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block -mt-1 font-medium">Healthcare Guide</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
            <a href="#care-search" className="hover:text-teal-600 transition-colors flex items-center gap-1">
              <span>Find Care</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            </a>
            <Link to="/hospitals" className="hover:text-teal-600 transition-colors">Hospitals</Link>
            <Link to="/doctors" className="hover:text-teal-600 transition-colors">Doctors</Link>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">How It Works</a>
            <Link to="/about" className="hover:text-teal-600 transition-colors">About</Link>
            <Link
              to={user ? (role === 'doctor' ? '/doctor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/patient/dashboard') : '/login'}
              state={!user ? { message: 'Please log in to continue to your dashboard.' } : undefined}
              className="hover:text-teal-600 transition-colors font-bold text-slate-700"
            >
              Account
            </Link>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => openBookingWithPreset({})}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/80 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={role === 'doctor' ? '/doctor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/patient/dashboard'}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Sign out of CareFlow"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  state={{ message: 'Please log in to continue to your dashboard.' }}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-700"
            >
              Home
            </Link>
            <a
              href="#care-search"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-700"
            >
              Find Care
            </a>
            <Link
              to="/hospitals"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-700"
            >
              Hospitals
            </Link>
            <Link
              to="/doctors"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-700"
            >
              Doctors
            </Link>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-700"
            >
              How It Works
            </a>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-700"
            >
              About
            </Link>
            <Link
              to={user ? (role === 'doctor' ? '/doctor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/patient/dashboard') : '/login'}
              state={!user ? { message: 'Please log in to continue to your dashboard.' } : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-teal-700"
            >
              Account
            </Link>
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              {user ? (
                <>
                  <Link
                    to={role === 'doctor' ? '/doctor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/patient/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-bold bg-slate-900 text-white rounded-xl"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="flex-1 py-2 text-center text-xs font-semibold bg-slate-100 text-rose-600 rounded-xl cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    state={{ message: 'Please log in to continue to your dashboard.' }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-bold bg-teal-600 text-white rounded-xl"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* -------------------------------------------------------------
          2. HERO SECTION WITH PROMINENT AI CARE SEARCH
      -------------------------------------------------------------- */}
      <section id="care-search" className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
        {/* Subtle decorative mesh background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-teal-100/40 via-sky-100/30 to-purple-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Multi-Hospital Healthcare Navigation • 23+ Specialties</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1]">
              Find the right care. <br />
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Book with confidence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Tell us what you need. We'll help you find the right care across Pakistan's premier reference hospitals and specialist doctors.
            </p>

            {/* Main Interactive AI Care Search Bar */}
            <div className="pt-4 max-w-2xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeAiSearch(searchQuery);
                }}
                className="relative bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 shadow-xl border border-slate-200/90 flex items-center gap-2 focus-within:ring-3 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all"
              >
                <div className="pl-3 text-teal-600">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="I have back pain and need a doctor tomorrow afternoon."
                  className="flex-1 bg-transparent py-2 px-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden font-medium"
                />
                <VoiceSearchButton
                  onTranscript={(transcript) => {
                    setSearchQuery(transcript);
                    executeAiSearch(transcript);
                  }}
                  className="shrink-0"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-5 py-3 rounded-xl sm:rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-70"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Matching Care...</span>
                    </>
                  ) : (
                    <>
                      <span>Find My Care</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs">
                <span className="text-slate-400 font-medium">Try asking (English / Roman Urdu):</span>
                {[
                  { label: '🇵🇰 Lahore Cardiologist kal', query: 'Mujhe Lahore mein cardiologist chahiye kal dopehr' },
                  { label: '🇵🇰 Islamabad Child Doctor', query: 'My daughter has high fever, need pediatrician in Islamabad' },
                  { label: '🇵🇰 Karachi Skin Specialist', query: 'Need a dermatologist in Karachi for skin rash and acne' },
                  { label: '🚨 Chest Pain (Emergency)', query: 'Severe crushing chest pain and shortness of breath' },
                  { label: '🦴 Kamar dard (Orthopedics)', query: 'Mujhe kamar dard hai aur doctor chahiye Lahore mein' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => executeAiSearch(chip.query)}
                    className="px-3 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 text-[11px] font-medium transition-colors border border-slate-200/60 cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* AI SEARCH RESULT: "WE UNDERSTOOD" & RECOMMENDED HOSPITALS */}
          {/* ========================================================= */}
          <AnimatePresence>
            {searchResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-12 max-w-5xl mx-auto space-y-6"
              >
                {/* Emergency Safety Alert or "We Understood" Guidance Card */}
                {searchResult.isEmergency ? (
                  <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 sm:p-8 shadow-xl text-left space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[11px] font-black uppercase tracking-wider">
                          Critical Emergency Detected
                        </span>
                        <h3 className="text-xl font-black text-rose-950 mt-1">Immediate Hospital Care Required</h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-medium">
                      {searchResult.explanation}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <a
                        href="tel:1122"
                        className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Dial 1122 (Rescue 1122 Pakistan 24/7)</span>
                      </a>
                      <a
                        href={`tel:${hospitals[0]?.emergency_phone || '+92518464646'}`}
                        className="px-6 py-3 rounded-2xl bg-white text-rose-700 border border-rose-300 font-bold text-xs sm:text-sm hover:bg-rose-100 flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Call Nearest Hospital ER Desk</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-teal-50/80 via-white to-sky-50/50 rounded-3xl p-6 sm:p-8 border border-teal-200/80 shadow-lg text-left space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-teal-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                              CareFlow Assessment
                            </span>
                            {searchResult.detectedLanguage && searchResult.detectedLanguage !== 'English' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                🗣️ {searchResult.detectedLanguage} Recognized
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-0.5">We Understood Your Request</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Recommended Specialty:</span>
                        <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-bold shadow-xs">
                          {searchResult.suggestedCare}
                        </span>
                      </div>
                    </div>

                    {/* Location-Aware & Intent Breakdown Pills */}
                    {(searchResult.extractedCare || searchResult.extractedCity || searchResult.extractedDate || searchResult.extractedTime || searchResult.extractedFamilyMember) && (
                      <div className="flex flex-wrap items-center gap-2 p-3 bg-teal-100/50 rounded-2xl border border-teal-200 text-xs">
                        <span className="font-bold text-teal-950 flex items-center gap-1.5 mr-1">
                          <Sparkles className="w-3.5 h-3.5 text-teal-700" /> Extracted Parameters:
                        </span>
                        {searchResult.extractedCare && (
                          <span className="px-2.5 py-1 bg-white rounded-lg font-semibold text-teal-900 shadow-xs border border-teal-200 flex items-center gap-1">
                            🩺 <span className="text-slate-500">Care:</span> {searchResult.extractedCare}
                          </span>
                        )}
                        {searchResult.extractedCity && (
                          <span className="px-2.5 py-1 bg-white rounded-lg font-semibold text-teal-900 shadow-xs border border-teal-200 flex items-center gap-1">
                            📍 <span className="text-slate-500">City:</span> {searchResult.extractedCity}
                          </span>
                        )}
                        {searchResult.extractedDate && (
                          <span className="px-2.5 py-1 bg-white rounded-lg font-semibold text-teal-900 shadow-xs border border-teal-200 flex items-center gap-1">
                            📅 <span className="text-slate-500">Date:</span> {searchResult.extractedDate}
                          </span>
                        )}
                        {searchResult.extractedTime && (
                          <span className="px-2.5 py-1 bg-white rounded-lg font-semibold text-teal-900 shadow-xs border border-teal-200 flex items-center gap-1">
                            ⏰ <span className="text-slate-500">Time:</span> {searchResult.extractedTime}
                          </span>
                        )}
                        {searchResult.extractedFamilyMember && (
                          <span className="px-2.5 py-1 bg-white rounded-lg font-semibold text-teal-900 shadow-xs border border-teal-200 flex items-center gap-1">
                            👤 <span className="text-slate-500">For:</span> {searchResult.extractedFamilyMember}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {searchResult.explanation}
                      </p>
                      <p className="text-[11px] text-slate-400 italic">
                        * Non-diagnostic clinical guidance. Outpatient appointments are shown below for verified reference healthcare network facilities.
                      </p>
                    </div>

                    {/* Quick Action Navigation Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('hospitals-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                          else navigate('/hospitals');
                        }}
                        className="p-3 rounded-xl bg-white border border-teal-200/80 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left flex items-center justify-between group shadow-2xs"
                      >
                        <div>
                          <span className="text-[10px] text-teal-600 font-bold block uppercase tracking-wide">Action 1</span>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">Find Hospitals</span>
                        </div>
                        <Building2 className="w-4 h-4 text-teal-600 group-hover:translate-x-0.5 transition" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('doctors-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                          else navigate('/doctors');
                        }}
                        className="p-3 rounded-xl bg-white border border-teal-200/80 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left flex items-center justify-between group shadow-2xs"
                      >
                        <div>
                          <span className="text-[10px] text-teal-600 font-bold block uppercase tracking-wide">Action 2</span>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">Find Doctors</span>
                        </div>
                        <Stethoscope className="w-4 h-4 text-teal-600 group-hover:translate-x-0.5 transition" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openBookingWithPreset({ category: searchResult.suggestedCare })}
                        className="p-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-all text-left flex items-center justify-between shadow-md shadow-teal-600/20 group"
                      >
                        <div>
                          <span className="text-[10px] text-teal-200 font-bold block uppercase tracking-wide">Action 3</span>
                          <span className="text-xs font-bold text-white">View Available Slots</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition" />
                      </button>
                    </div>

                    {/* Recommended Hospitals Section */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-teal-600" />
                          <span>Recommended Hospitals Offering {searchResult.suggestedCare}</span>
                        </h4>
                        <span className="text-[11px] text-teal-700 font-semibold">
                          {searchResult.recommendedHospitals.length} Facilities Available
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResult.recommendedHospitals.slice(0, 2).map((hosp) => (
                          <div
                            key={hosp.id}
                            className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div className="flex gap-3.5">
                              <img
                                src={hosp.thumbnail_image || hosp.hero_image}
                                alt={hosp.name}
                                className="w-24 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80';
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{hosp.name}</h5>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                                  <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                                  <span>{hosp.city} • {hosp.address}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                    Next: {hosp.next_available_slot || 'Today'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {hosp.doctor_count || 12} Doctors
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <Link
                                to={`/hospital/${hosp.id}`}
                                className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                              >
                                <span>View Hospital Profile</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                              <button
                                onClick={() => openBookingWithPreset({ category: searchResult.suggestedCare, hospitalId: hosp.id })}
                                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                              >
                                <span>Book at Hospital</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Matching Specialists Quick Action */}
                    {searchResult.doctors.length > 0 && (
                      <div className="pt-3 border-t border-teal-100">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <Stethoscope className="w-4 h-4 text-teal-600" />
                            <span>Available {searchResult.suggestedCare} Specialists</span>
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {searchResult.doctors.slice(0, 3).map((doc) => (
                            <div
                              key={doc.id}
                              className="bg-white/80 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={doc.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                                  alt={doc.profile?.full_name}
                                  className="w-10 h-10 rounded-full object-cover border border-teal-200 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80';
                                  }}
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{doc.profile?.full_name}</p>
                                  <p className="text-[10px] text-teal-700 truncate">{doc.specialty} • ${doc.consultation_fee}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => openBookingWithPreset({ category: doc.specialty, hospitalId: doc.hospital_id, doctorId: doc.id })}
                                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white text-[11px] font-bold transition-colors shrink-0"
                              >
                                Book
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2.5 INTERACTIVE WOW DEMONSTRATION SHOWCASE
      -------------------------------------------------------------- */}
      <section className="py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white relative overflow-hidden border-y border-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Live Interactive Architecture Demo
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              The CareFlow AI Experience
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">
              Test how natural language queries in English and Roman Urdu are safely triaged, matched to reference hospitals, and converted into confirmed live queue tickets.
            </p>

            {/* Interactive Query Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {[
                { id: 'cardio', label: '🇵🇰 Lahore • Cardiology (PIC Lahore)', query: 'Mujhe Lahore mein cardiologist chahiye kal dopehr' },
                { id: 'derma', label: '🇵🇰 Islamabad • Pediatrics (Shifa Int)', query: 'My child has high fever, need pediatrician in Islamabad' },
                { id: 'queue', label: '🇵🇰 Karachi • Orthopedics (Aga Khan)', query: 'Need orthopedic specialist in Karachi for severe back pain' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveDemoQuery(t.id as any);
                    executeAiSearch(t.query);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeDemoQuery === t.id
                      ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stepped Pipeline Showcase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Step 01 • Natural Input</span>
                <Bot className="w-4 h-4 text-teal-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Language & Location Parsing</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Extracts clinical need, Pakistani city (Lahore/Islamabad/Karachi), preferred time, and family member.
              </p>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-emerald-300">
                &gt; lang: Roman Urdu / EN<br />
                &gt; city: Resolved<br />
                &gt; safety: Deterministic
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Step 02 • Safety Gate</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Emergency Triage Layer</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rules out red-flag emergencies (chest pain, stroke, acute breathlessness) before outpatient booking.
              </p>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-teal-200">
                &gt; status: Outpatient safe<br />
                &gt; er_hotline: 1122 ready<br />
                &gt; claims: Non-diagnostic
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Step 03 • Network Match</span>
                <Building2 className="w-4 h-4 text-sky-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Reference Hospital & Doctor</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Checks real Supabase slot availability, doctor certifications, and consultation fees in PKR.
              </p>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-sky-300">
                &gt; double_booking: Protected<br />
                &gt; currency: PKR<br />
                &gt; slots: Real-time Supabase
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Step 04 • Outpatient Pass</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Live Queue & Visit Plan</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Issues token #104, provides required document checklist (CNIC, films), and directions to clinic.
              </p>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-emerald-300">
                &gt; token: Issued<br />
                &gt; wait: ~15 mins<br />
                &gt; passport: Encrypted sync
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. 23+ SPECIALTY CARE CATEGORY GRID ("Find care for what you need")
      -------------------------------------------------------------- */}
      <section id="specialties" className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Comprehensive Care Network
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Find Care for What You Need
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
              Covering 23+ clinical care pathways. Select any specialty to explore hospital options or book a consultation.
            </p>

            {/* Quick Specialty Pill Filter */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-2 max-w-3xl mx-auto">
              {['All', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Gynecology', 'Dentistry', 'ENT'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedSpecialtyFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedSpecialtyFilter === cat
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => openBookingWithPreset({ category: cat.name })}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-semibold text-teal-700 block mt-0.5">
                    {cat.specialty}
                  </span>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Outpatient Clinic</span>
                  <span className="font-bold text-teal-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Book Care</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. FEATURED HOSPITALS NETWORK (Real Images & Profile Links)
      -------------------------------------------------------------- */}
      <section id="hospitals" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-14">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
              Demo / Reference Healthcare Network
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Pakistan Reference Healthcare Facilities
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              Leading tertiary care medical centers across Lahore, Islamabad, Karachi, and Rawalpindi. Displayed strictly for platform demonstration, queue tracking simulations, and care pathway verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals
              .filter(h => !h.id.startsWith('hosp-lahore-') && !h.id.startsWith('hosp-isb-') && !h.id.startsWith('hosp-rwp-') && !h.id.startsWith('hosp-khi-'))
              .slice(0, 9)
              .map((hosp) => (
              <div
                key={hosp.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Hospital Image */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={hosp.hero_image || hosp.thumbnail_image}
                      alt={hosp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{hosp.city}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-teal-300 border border-teal-400/30 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      Reference / Demo
                    </div>
                  </div>

                  {/* Hospital Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-800">
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                          Tertiary Care Center
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {hosp.doctor_count || 24} Specialists
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors">
                        {hosp.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1.5">
                        {hosp.description}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate">{hosp.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-semibold text-rose-700">ER: {hosp.emergency_phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Departments */}
                    <div className="pt-2 border-t border-slate-100/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Key Departments
                      </span>
                      <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                        {(hosp.facilities || ['Cardiology', 'Emergency Trauma', 'Neurology']).slice(0, 3).map((f, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-5 pt-3 flex items-center justify-between border-t border-slate-100 mt-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Available Doctors: <strong className="text-slate-800">{hosp.doctor_count || 24}</strong>
                  </span>
                  <Link
                    to={`/hospital/${hosp.id}`}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 group-hover:shadow-md"
                  >
                    <span>View Hospital</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. HOW IT WORKS (4-Step Animated Visual Flow)
      -------------------------------------------------------------- */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            Intelligent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            How CareFlow AI Works
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto font-normal">
            Four streamlined steps connecting natural language directly with real hospital services.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 text-left group">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-extrabold text-lg flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900">Tell CareFlow what you need</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Describe symptoms, request an appointment date, or ask about existing lab results in plain language.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 text-left group">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-extrabold text-lg flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900">Safety check & understand</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our safety engine evaluates potential red-flag emergencies before matching you with the appropriate medical department.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 text-left group">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-extrabold text-lg flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900">Find care & book slot</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse verified specialists, select verified available time slots, and confirm your visit with zero double-booking risk.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 text-left group">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-extrabold text-lg flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                04
              </div>
              <h3 className="font-bold text-base text-slate-900">Track journey & queue</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitor your outpatient waiting ticket live, organize diagnostics reports, and receive timely visit reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          6. EMERGENCY SAFETY SECTION ("When every second matters")
      -------------------------------------------------------------- */}
      <section id="safety" className="py-20 md:py-24 bg-rose-50/70 border-y border-rose-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                Deterministic Triage Layer
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                When every second matters.
              </h2>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed max-w-xl">
                CareFlow AI is an administrative navigation companion — <strong>not a medical diagnosis system</strong>. If you describe potential warning signs such as severe chest pressure, stroke symptoms, or acute respiratory distress, our deterministic safety layer halts routine booking and routes you directly to emergency care.
              </p>

              <div className="p-4 bg-white rounded-2xl border border-rose-200/80 shadow-xs space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-rose-700">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Immediate Action Protocol</span>
                </div>
                <p className="text-slate-600">
                  "Some symptoms may require urgent medical attention. If you experience crushing chest pain, facial drooping, or breathing failure, dial 911 or visit the nearest ER immediately."
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-rose-200 shadow-md space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Safety Routing Logic Flow
              </h3>
              <div className="space-y-2.5 font-medium">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>1. Patient Message Input</span>
                  <span className="text-slate-400">Natural Language</span>
                </div>
                <div className="p-2.5 bg-rose-50 text-rose-900 rounded-xl border border-rose-200 flex items-center justify-between">
                  <span>2. Red-Flag Rule Check</span>
                  <span className="font-bold text-rose-700">Deterministic</span>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span>3. Non-Emergency?</span>
                  <span className="font-bold text-emerald-700">Care Pathway & Doctors</span>
                </div>
                <div className="p-2.5 bg-rose-600 text-white rounded-xl flex items-center justify-between font-bold">
                  <span>4. Emergency Detected?</span>
                  <span>Direct Hotline / 911</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          7. DOCTOR DISCOVERY SHOWCASE (Real Specialists)
      -------------------------------------------------------------- */}
      <section id="doctors" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-14">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
            Demo Profiles • Board Certified Physicians
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Meet Verified Specialists
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto font-normal">
            Demonstration medical specialist profiles with Pakistani qualifications, verified hospital affiliations, and transparent consultation fees.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.slice(0, 3).map(doctor => (
              <div
                key={doctor.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      Demo Profile
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      ★ {doctor.rating || 4.9} ({doctor.total_reviews || 120})
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <img
                      src={doctor.profile?.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"}
                      alt={doctor.profile?.full_name || 'Physician'}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150';
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{doctor.profile?.full_name}</h3>
                      <span className="inline-block text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md mt-0.5">
                        {doctor.specialty}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {Array.isArray(doctor.qualifications) ? doctor.qualifications.join(', ') : (doctor.qualifications || 'MBBS, FCPS')}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doctor.bio}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{doctor.experience_years} years exp</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      Rs. {(doctor.consultation_fee_pkr || doctor.consultation_fee * 280).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openBookingWithPreset({ category: doctor.specialty, hospitalId: doctor.hospital_id, doctorId: doctor.id })}
                  className="mt-5 w-full py-2.5 bg-slate-50 hover:bg-teal-600 text-teal-800 hover:text-white border border-teal-200 hover:border-teal-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => openBookingWithPreset({})}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700"
            >
              <span>Explore All Verified Specialists</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          8. STARTUP FOOTER
      -------------------------------------------------------------- */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-white">CareFlow AI</span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed">
                Multi-hospital patient navigation platform connecting symptoms, hospital departments, specialists, and live outpatient queues.
              </p>
              <p className="text-[11px] text-slate-600">
                © {new Date().getFullYear()} CareFlow AI Technologies Inc. All rights reserved.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#care-search" className="hover:text-teal-400">Find Care</a></li>
                <li><a href="#specialties" className="hover:text-teal-400">Specialties</a></li>
                <li><a href="#hospitals" className="hover:text-teal-400">Hospitals</a></li>
                <li><a href="#safety" className="hover:text-teal-400">Safety Protocol</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Portals</h4>
              <ul className="space-y-2">
                <li><Link to="/patient/dashboard" className="hover:text-teal-400">Patient Dashboard</Link></li>
                <li><Link to="/doctor/dashboard" className="hover:text-teal-400">Doctor Queue</Link></li>
                <li><Link to="/admin/dashboard" className="hover:text-teal-400">Admin Operations</Link></li>
                <li><Link to="/login" className="hover:text-teal-400">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Legal & Safety</h4>
              <ul className="space-y-2">
                <li><span className="text-slate-500">HIPAA Compliant Vault</span></li>
                <li><span className="text-slate-500">Non-Diagnostic Guidance</span></li>
                <li><span className="text-slate-500">Emergency Protocol</span></li>
                <li><span className="text-slate-500">Privacy Policy</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 text-center text-slate-600 text-[11px] leading-relaxed">
            Medical Disclaimer: CareFlow AI is an administrative and navigational support tool. It does not provide medical diagnosis, prescribe drugs, or replace professional healthcare consultation. In medical emergencies, immediately contact official emergency services (911 / 112).
          </div>
        </div>
      </footer>

      {/* -------------------------------------------------------------
          9. GUIDED 7-STEP BOOKING WIZARD MODAL
      -------------------------------------------------------------- */}
      {wizardOpen && (
        <AppointmentWizardModal
          initialCareCategory={wizardCategory}
          initialHospitalId={wizardHospitalId}
          initialDoctorId={wizardDoctorId}
          onClose={() => {
            setWizardOpen(false);
            setWizardCategory(undefined);
            setWizardHospitalId(undefined);
            setWizardDoctorId(undefined);
          }}
          onSuccess={(result) => {
            console.log('Booked successfully:', result);
          }}
        />
      )}
    </div>
  );
};
