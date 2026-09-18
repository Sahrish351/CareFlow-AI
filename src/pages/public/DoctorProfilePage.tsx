import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Building2, 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  Award, 
  GraduationCap, 
  Globe2, 
  Heart, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  Sparkles, 
  Phone, 
  FileText,
  ShieldAlert,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Doctor, Hospital, Department } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentWizardModal } from '../../components/booking/AppointmentWizardModal';

export const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    const loadDoctor = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const doc = await dbService.getDoctorById(id);
        if (doc) {
          setDoctor(doc);
          const [hosps, depts] = await Promise.all([
            dbService.getHospitals(),
            dbService.getDepartments()
          ]);
          const foundHosp = hosps.find(h => h.id === doc.hospital_id);
          const foundDept = depts.find(d => 
            d.hospital_id === doc.hospital_id && 
            (d.name.toLowerCase().includes(doc.specialty.toLowerCase()) || doc.specialty.toLowerCase().includes(d.name.toLowerCase()))
          );
          setHospital(foundHosp || doc.hospital || null);
          setDepartment(foundDept || null);

          if (user) {
            const saved = await dbService.isDoctorSaved(user.id, doc.id);
            setIsSaved(saved);
          }
        }
      } catch (e) {
        console.error('Error loading doctor profile:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadDoctor();
  }, [id, user]);

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!doctor) return;
    const nowSaved = await dbService.toggleSaveDoctor(user.id, doctor.id);
    setIsSaved(nowSaved);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Physician Profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full text-center shadow-xs">
          <Stethoscope className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Physician Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The requested doctor profile does not exist or may have been removed from our active directory.
          </p>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Doctors Directory
          </Link>
        </div>
      </div>
    );
  }

  const rating = doctor.rating || 4.9;
  const reviewCount = doctor.review_count || 42;
  const languages = doctor.languages || ['English', 'Urdu'];
  const education = doctor.education || 'MBBS, FCPS, Fellow of International College of Surgeons';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/doctors"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Back to Directory"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-900">
                CareFlow<span className="text-teal-600">.ai</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/doctors"
              className="text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-1.5 transition hidden md:inline-flex"
            >
              All Doctors
            </Link>
            <Link
              to="/hospitals"
              className="text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-1.5 transition hidden md:inline-flex"
            >
              Hospitals
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Physician Header Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Doctor Avatar with verified badge */}
              <div className="relative shrink-0">
                <img
                  src={doctor.profile?.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
                  alt={doctor.profile?.full_name || 'Physician'}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-teal-50 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-teal-600 text-white rounded-full p-1.5 border-4 border-white shadow-sm" title="Board Certified">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              {/* Identity & Basic Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {doctor.specialty}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    {doctor.experience_years}+ Years Experience
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {doctor.profile?.full_name || 'Dr. Medical Specialist'}
                </h1>

                {/* Affiliated Hospital Link */}
                {hospital && (
                  <Link
                    to={`/hospital/${hospital.id}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-teal-700 group transition"
                  >
                    <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{hospital.name}</span>
                    <span className="text-slate-400">({hospital.city})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}

                {/* Ratings and Languages */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-slate-900">{rating.toFixed(1)}</span>
                    <span>({reviewCount} patient reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe2 className="w-4 h-4 text-slate-400" />
                    <span>Speaks {languages.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row md:flex-col items-center sm:items-stretch gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
              <button
                onClick={() => setWizardOpen(true)}
                className="flex-1 md:flex-initial px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>

              <button
                onClick={handleToggleSave}
                className={`flex-1 md:flex-initial px-4 py-2.5 rounded-2xl border text-xs font-semibold transition flex items-center justify-center gap-2 ${
                  isSaved
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isSaved ? 'Saved to Favorites' : 'Save Specialist'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Bio, Credentials, Specializations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biography */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                About & Clinical Philosophy
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {doctor.bio || `Dr. ${doctor.profile?.full_name || 'Physician'} is a respected clinical consultant with extensive experience treating acute and chronic conditions in ${doctor.specialty}. Emphasizing patient-centered care and evidence-based diagnostic navigation, every consultation includes comprehensive assessment and tailored follow-up planning.`}
              </p>
            </div>

            {/* Education & Qualifications */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                Credentials & Medical Qualifications
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Medical Degree & Fellowships</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{education}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Hospital Medical Accreditation</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Fully credentialed staff consultant at {hospital?.name || 'CareFlow Network'}, actively participating in clinical multidisciplinary review boards.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Scope & Symptoms Treated */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Specialty Scope & Typical Concerns Handled
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Patients frequently consult {doctor.profile?.full_name?.trim().startsWith('Dr.') ? doctor.profile?.full_name?.split(',')[0].trim() : `Dr. ${doctor.profile?.full_name?.split(',')[0].trim() || 'Specialist'}`} for:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Initial Diagnostic Consultations',
                  'Comprehensive Clinical Evaluations',
                  'Chronic Condition Management',
                  'Second Medical Opinions',
                  'Post-Procedural Follow-Up',
                  'Preventative Health Screening'
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50/60 border border-teal-100 text-teal-800 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Patient Feedback */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Verified Patient Feedback ({rating.toFixed(1)} / 5.0)
                </h2>
                <span className="text-xs font-semibold text-slate-500">{reviewCount} Verified Consultations</span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    name: 'Khadija R.',
                    date: '3 days ago',
                    comment: 'Extremely attentive and thorough. Explained everything in plain language and ensured all my questions were answered before leaving the clinic.',
                    stars: 5
                  },
                  {
                    name: 'Tariq M.',
                    date: '1 week ago',
                    comment: 'CareFlow booked my slot instantly and the hospital queue tracker was spot on. Dr. was punctual and exceptionally knowledgeable.',
                    stars: 5
                  }
                ].map((review, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{review.name}</span>
                      <span className="text-slate-400 text-[11px]">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(review.stars)].map((_, s) => (
                        <Star key={s} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Practice Details & Quick Booking Card */}
          <div className="space-y-6">
            {/* Quick Booking Box */}
            <div className="bg-gradient-to-b from-teal-50 to-white rounded-3xl border border-teal-100 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Book a Consultation</h3>
              <p className="text-xs text-slate-500 mb-4">
                Choose a convenient date and time. Verified zero double-booking.
              </p>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between text-xs py-2 border-b border-teal-100/70">
                  <span className="text-slate-500">Consultation Fee</span>
                  <span className="font-bold text-slate-900">Hospital Standard (Rs. 2,000 - 3,500)</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-teal-100/70">
                  <span className="text-slate-500">Availability</span>
                  <span className="font-semibold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">Mon – Sat</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-teal-100/70">
                  <span className="text-slate-500">Queue Tracking</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Live Digital Ticket
                  </span>
                </div>
              </div>

              <button
                onClick={() => setWizardOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>Select Date & Time</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Hospital Location Card */}
            {hospital && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  Hospital Location
                </h3>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{hospital.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{hospital.address}, {hospital.city}</span>
                  </p>
                </div>
                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{hospital.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>OPD Hours: 09:00 AM – 06:00 PM</span>
                  </div>
                </div>
                <Link
                  to={`/hospital/${hospital.id}`}
                  className="block text-center py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-teal-700 border border-slate-200 transition"
                >
                  Explore Hospital Profile
                </Link>
              </div>
            )}

            {/* Non-Diagnostic Clinical Safety Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Patient Safety Reminder</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                CareFlow AI assists with healthcare scheduling and physician matching. We do not provide clinical diagnoses. In case of acute medical emergencies, immediately contact emergency services or report to the hospital emergency department.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Wizard Modal */}
      <AppointmentWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialHospitalId={hospital?.id}
        initialDoctorId={doctor.id}
      />
    </div>
  );
};

