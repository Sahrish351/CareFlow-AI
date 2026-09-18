import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Search, 
  Sparkles, 
  Heart, 
  Brain, 
  Eye, 
  Bone, 
  Activity, 
  ShieldAlert, 
  ArrowRight, 
  ChevronRight, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';
import { CareCategory, Hospital } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentWizardModal } from '../../components/booking/AppointmentWizardModal';

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<CareCategory[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialtyModal, setSelectedSpecialtyModal] = useState<string | undefined>(undefined);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    const cats = dbService.getCareCategories();
    setCategories(cats);
    dbService.getHospitals().then(setHospitals);
  }, []);

  const filteredCategories = categories.filter(cat => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = cat.name.toLowerCase().includes(q);
    const specMatch = cat.specialty.toLowerCase().includes(q);
    const kwMatch = cat.keywords.some(k => k.toLowerCase().includes(q));
    const sympMatch = cat.commonSymptoms.some(s => s.toLowerCase().includes(q));
    return nameMatch || specMatch || kwMatch || sympMatch;
  });

  const handleBookCategory = (specialty: string) => {
    setSelectedSpecialtyModal(specialty);
    setWizardOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Breadcrumb Navigation */}
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
              to="/about"
              className="text-xs font-semibold text-slate-600 hover:text-teal-700 transition hidden sm:inline-flex"
            >
              About
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
      <section className="bg-gradient-to-b from-teal-950 via-slate-900 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        <div className="relative max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Comprehensive Clinical Specialties Catalog
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            23+ Medical & Surgical Specialties
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Search symptoms, explore clinical departments, and find board-certified physicians across our accredited multi-hospital network.
          </p>

          {/* Search Bar inside Hero */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-2 mt-6">
            <Search className="w-4 h-4 text-slate-300 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by specialty, condition, or symptom (e.g. chest pain, skin rash, joint stiffness)..."
              className="flex-1 bg-transparent border-0 px-2 py-2 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-300 hover:text-white px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Specialty Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Medical Care Catalog ({filteredCategories.length} Specialties)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a clinical discipline to explore common evaluations and schedule a consultation.
            </p>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
          >
            <span>View All Doctors</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto shadow-xs">
            <Stethoscope className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">No Medical Specialties Found</h3>
            <p className="text-xs text-slate-500 mb-4">
              We couldn't match "{searchQuery}" to our specialty catalog. Try searching a broader term or symptom.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
            >
              Show All Specialties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map(cat => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0 shadow-2xs">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50/70 border border-teal-100 px-2.5 py-1 rounded-lg">
                      {cat.specialty}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">
                      {cat.description}
                    </p>
                  </div>

                  {/* Common Symptoms */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Common Symptoms Treated
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(cat.commonSymptoms || []).slice(0, 4).map((symp, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]"
                        >
                          {symp}
                        </span>
                      ))}
                      {cat.commonSymptoms.length > 4 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{cat.commonSymptoms.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    to={`/doctors?specialty=${encodeURIComponent(cat.specialty)}`}
                    className="flex-1 py-2 px-3 text-center rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
                  >
                    View Doctors
                  </Link>
                  <button
                    onClick={() => handleBookCategory(cat.specialty)}
                    className="flex-1 py-2 px-3 text-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>Book Care</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Safety Disclaimer Banner */}
        <div className="mt-14 bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Clinical Care Discovery Disclaimer</p>
            <p className="text-amber-800 leading-relaxed">
              CareFlow AI provides intelligent specialty matching and real-time scheduling across accredited regional hospitals. CareFlow AI never diagnoses medical conditions or prescribes medications. All medical assessments and treatments are delivered directly by licensed physicians during your consultation. For emergency situations, immediately call 1122 or visit the nearest emergency room.
            </p>
          </div>
        </div>
      </main>

      {/* Booking Wizard Modal */}
      <AppointmentWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
};

