import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Search, 
  Filter, 
  Building2, 
  Star, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Globe2, 
  Heart, 
  Sparkles,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  Scale,
  Activity
} from 'lucide-react';
import { Doctor, Hospital, CareCategory } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentWizardModal } from '../../components/booking/AppointmentWizardModal';
import { DoctorComparisonModal } from '../../components/comparison/DoctorComparisonModal';

export const DoctorsDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [categories, setCategories] = useState<CareCategory[]>([]);
  const [savedDoctorIds, setSavedDoctorIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedExp, setSelectedExp] = useState(0);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'name'>('rating');

  // Comparison State
  const [selectedForCompare, setSelectedForCompare] = useState<Doctor[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Booking Modal
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | undefined>(undefined);

  const toggleCompare = (doc: Doctor, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (selectedForCompare.some(d => d.id === doc.id)) {
      setSelectedForCompare(prev => prev.filter(d => d.id !== doc.id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare up to 3 medical specialists at a time.');
        return;
      }
      setSelectedForCompare(prev => [...prev, doc]);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [docsData, hospsData, catsData] = await Promise.all([
          dbService.getDoctors(),
          dbService.getHospitals(),
          Promise.resolve(dbService.getCareCategories())
        ]);
        setDoctors(docsData);
        setHospitals(hospsData);
        setCategories(catsData);

        if (user) {
          const saved = await dbService.getSavedDoctors(user.id);
          setSavedDoctorIds(new Set(saved.map(s => s.doctor_id)));
        }
      } catch (err) {
        console.error('Error loading doctor directory:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const handleToggleSave = async (doctorId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    const isNowSaved = await dbService.toggleSaveDoctor(user.id, doctorId);
    setSavedDoctorIds(prev => {
      const next = new Set(prev);
      if (isNowSaved) {
        next.add(doctorId);
      } else {
        next.delete(doctorId);
      }
      return next;
    });
  };

  const handleBookDoctor = (doc: Doctor) => {
    setSelectedDoctorId(doc.id);
    setSelectedHospitalId(doc.hospital_id);
    setWizardOpen(true);
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesHospital = selectedHospital === 'All' || doc.hospital_id === selectedHospital;
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    const matchesExp = selectedExp === 0 || doc.experience_years >= selectedExp;
    
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (doc.profile?.full_name || '').toLowerCase();
      const spec = doc.specialty.toLowerCase();
      const bio = (doc.bio || '').toLowerCase();
      const hosp = (doc.hospital?.name || '').toLowerCase();
      matchesSearch = name.includes(q) || spec.includes(q) || bio.includes(q) || hosp.includes(q);
    }

    return matchesHospital && matchesSpecialty && matchesExp && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.rating || 4.8) - (a.rating || 4.8);
    }
    if (sortBy === 'experience') {
      return b.experience_years - a.experience_years;
    }
    return (a.profile?.full_name || '').localeCompare(b.profile?.full_name || '');
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Breadcrumb Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              CareFlow<span className="text-teal-600">.ai</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/hospitals"
              className="text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-1.5 transition-colors hidden sm:inline-flex"
            >
              Hospitals
            </Link>
            <Link
              to="/services"
              className="text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-1.5 transition-colors hidden sm:inline-flex"
            >
              Specialties
            </Link>
            <Link
              to="/about"
              className="text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-1.5 transition-colors hidden sm:inline-flex"
            >
              About
            </Link>
            {user ? (
              <Link
                to="/portal"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition shadow-xs"
              >
                Dashboard
                <ChevronRight className="w-3.5 h-3.5" />
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
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-4">
            <UserCheck className="w-3.5 h-3.5" />
            Verified Physician Directory
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Connect with Board-Certified Specialists
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8">
            Access 23+ medical departments across premier regional hospitals in Lahore, Islamabad, Rawalpindi, and Karachi. Book guaranteed consultations with zero double-booking.
          </p>

          {/* Search bar inside Hero */}
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name, specialty, condition, or hospital..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/15 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:bg-white/20 focus:border-teal-400"
              />
            </div>
            <button
              onClick={() => {}}
              className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shrink-0 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              Search Specialists
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Filter className="w-4 h-4 text-teal-600" />
              Filter Physicians ({filteredDoctors.length} found)
            </div>
            {(selectedHospital !== 'All' || selectedSpecialty !== 'All' || selectedExp !== 0 || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedHospital('All');
                  setSelectedSpecialty('All');
                  setSelectedExp(0);
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Hospital Filter */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Hospital Network
              </label>
              <select
                value={selectedHospital}
                onChange={e => setSelectedHospital(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-teal-500 font-medium"
              >
                <option value="All">All Hospitals (5 Regional)</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
                ))}
              </select>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Medical Specialty (23+)
              </label>
              <select
                value={selectedSpecialty}
                onChange={e => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-teal-500 font-medium"
              >
                <option value="All">All Specialties</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.specialty}>{cat.name} ({cat.specialty})</option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Min. Experience
              </label>
              <select
                value={selectedExp}
                onChange={e => setSelectedExp(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-teal-500 font-medium"
              >
                <option value={0}>Any Experience</option>
                <option value={5}>5+ Years Clinical</option>
                <option value={10}>10+ Years Senior</option>
                <option value={15}>15+ Years Consultant / Chief</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-teal-500 font-medium"
              >
                <option value="rating">Patient Rating (Highest First)</option>
                <option value="experience">Years of Experience</option>
                <option value="name">Physician Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 mt-3">Loading verified physician directory...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredDoctors.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Physicians Match Your Filter</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              We couldn't find any doctors matching your search criteria. Try loosening your specialty, hospital, or experience filters.
            </p>
            <button
              onClick={() => {
                setSelectedHospital('All');
                setSelectedSpecialty('All');
                setSelectedExp(0);
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Doctors Grid */}
        {!isLoading && filteredDoctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doc => {
              const isSaved = savedDoctorIds.has(doc.id);
              const rating = doc.rating || 4.9;
              const reviewCount = doc.review_count || 38;
              const hospital = hospitals.find(h => h.id === doc.hospital_id);

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Top row: Avatar + details + bookmark */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={doc.profile?.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'}
                          alt={doc.profile?.full_name || 'Doctor'}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-50 shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white rounded-full p-0.5 border-2 border-white shadow-xs" title="Verified Specialist">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                            {doc.specialty}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => toggleCompare(doc, e)}
                              className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition flex items-center gap-1 ${
                                selectedForCompare.some(d => d.id === doc.id)
                                  ? 'bg-teal-600 text-white border-teal-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                              }`}
                              title="Compare specialist side-by-side"
                            >
                              <Scale className="w-3 h-3" />
                              <span>{selectedForCompare.some(d => d.id === doc.id) ? 'Comparing' : 'Compare'}</span>
                            </button>
                            <button
                              onClick={(e) => handleToggleSave(doc.id, e)}
                              className={`p-1.5 rounded-lg border transition ${
                                isSaved 
                                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                              }`}
                              title={isSaved ? 'Remove from saved' : 'Save doctor'}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mt-1 truncate group-hover:text-teal-700 transition-colors">
                          {doc.profile?.full_name || 'Dr. Medical Specialist'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {doc.experience_years} Years Experience
                        </p>
                      </div>
                    </div>

                    {/* Rating & Hospital */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-800">{rating.toFixed(1)}</span>
                        <span className="text-slate-400">({reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 truncate max-w-[160px]">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{hospital?.name || doc.hospital?.name || 'CareFlow Network'}</span>
                      </div>
                    </div>

                    {/* Short bio */}
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {doc.bio || `Specialized clinical practitioner offering thorough evaluations and tailored care pathways for complex conditions.`}
                    </p>

                    {/* Languages & Next Slot */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Globe2 className="w-3 h-3 text-slate-400" />
                        <span>{(doc.languages || ['English', 'Urdu']).join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-teal-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        <span>Today / Tomorrow</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/doctors/${doc.id}`}
                      className="flex-1 py-2 px-3 text-center rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => handleBookDoctor(doc)}
                      className="flex-1 py-2 px-3 text-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Safety & Non-Diagnostic Disclaimer Card */}
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

      {/* Floating Comparison Drawer */}
      {selectedForCompare.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-800 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="font-bold">{selectedForCompare.length} Specialists Selected for Comparison</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareModalOpen(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Side-by-Side</span>
            </button>
            <button
              onClick={() => setSelectedForCompare([])}
              className="text-xs text-slate-400 hover:text-white transition px-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Doctor Comparison Modal */}
      <DoctorComparisonModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        doctors={selectedForCompare}
        onBookDoctor={(doc) => handleBookDoctor(doc)}
      />

      {/* Appointment Booking Wizard Modal */}
      <AppointmentWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialHospitalId={selectedHospitalId}
        initialDoctorId={selectedDoctorId}
      />
    </div>
  );
};

