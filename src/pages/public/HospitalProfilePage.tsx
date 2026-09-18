import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldAlert, 
  Calendar, 
  Stethoscope, 
  CheckCircle2, 
  ArrowLeft, 
  Star,
  Users, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Hospital, Doctor, Department } from '../../types';
import { dbService } from '../../services/dbService';
import { AppointmentWizardModal } from '../../components/booking/AppointmentWizardModal';

export const HospitalProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'specialists' | 'departments' | 'facilities'>('specialists');

  // Booking Wizard Modal state
  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  useEffect(() => {
    const loadHospitalDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const hosp = await dbService.getHospitalById(id);
        if (hosp) {
          setHospital(hosp);
          const [docs, depts] = await Promise.all([
            dbService.getDoctors({ hospitalId: hosp.id }),
            dbService.getDepartments(hosp.id)
          ]);
          setDoctors(docs);
          setDepartments(depts);
        }
      } catch (err) {
        console.error('Failed to load hospital profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHospitalDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading hospital profile...</span>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Hospital Not Found</h2>
          <p className="text-xs text-slate-500">
            The requested medical center could not be located in our verified hospital directory.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-900 hidden sm:inline">
                CareFlow<span className="text-teal-600">.ai</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Pakistan Reference Network</span>
            </div>
            <button
              onClick={() => {
                setSelectedDoctorForBooking(null);
                setWizardOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={hospital.hero_image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop&q=80'}
            alt={hospital.name}
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{hospital.city}, Pakistan</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {hospital.name}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                {hospital.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{hospital.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{hospital.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{hospital.opening_hours || 'Open 24 Hours'}</span>
                </div>
              </div>
            </div>

            {/* Emergency & Next Slot Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[260px] space-y-3 shrink-0">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>24/7 Emergency Line</span>
              </div>
              <a
                href={`tel:${hospital.emergency_phone || '911'}`}
                className="block text-xl font-black text-white hover:text-teal-300 transition-colors"
              >
                {hospital.emergency_phone || '+92 (42) 3574-8899'}
              </a>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">Next Available Slot:</span>
                <span className="font-bold text-emerald-400">{hospital.next_available_slot || 'Today, 11:30 AM'}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedDoctorForBooking(null);
                  setWizardOpen(true);
                }}
                className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Consultation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'specialists', label: `Attending Doctors (${doctors.length})`, icon: Stethoscope },
            { id: 'departments', label: `Clinical Departments (${departments.length})`, icon: Building2 },
            { id: 'facilities', label: `Facilities & Tech (${hospital.facilities?.length || 5})`, icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Doctors */}
        {activeTab === 'specialists' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Verified Medical Specialists</h3>
                <p className="text-xs text-slate-500">Board-certified consultants with active outpatient clinics at {hospital.name}</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">{doctors.length} doctors available</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                      alt={doc.profile?.full_name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-100 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {doc.profile?.full_name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-bold">
                          ${doc.consultation_fee}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-teal-700 block mt-0.5">
                        {doc.specialty}
                      </span>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {doc.bio}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Days:</span> {doc.available_days?.join(', ') || 'Mon - Fri'}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDoctorForBooking(doc);
                        setWizardOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>Book Slot</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Departments */}
        {activeTab === 'departments' && (
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Clinical Departments</h3>
              <p className="text-xs text-slate-500">Specialized wards and clinical wings active at this facility</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-3">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                  <span className="text-xs font-semibold text-teal-700 block mt-0.5">{dept.specialty}</span>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{dept.description}</p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Clinic
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDoctorForBooking(null);
                        setWizardOpen(true);
                      }}
                      className="text-xs text-teal-700 hover:underline font-bold"
                    >
                      Book Dept &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Facilities */}
        {activeTab === 'facilities' && (
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Facilities & Diagnostics</h3>
              <p className="text-xs text-slate-500">Modern medical infrastructure equipped for routine and critical care</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(hospital.facilities || [
                '24/7 Trauma Emergency',
                'Advanced Diagnostic Imaging (MRI & CT)',
                'Automated Clinical Laboratory',
                'Inpatient Surgical Suites',
                'Digital Pharmacy Counter'
              ]).map((fac, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3.5 shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{fac}</h4>
                    <span className="text-[11px] text-slate-400">Inspected & operational</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guided Booking Wizard Modal */}
      {wizardOpen && (
        <AppointmentWizardModal
          initialHospitalId={hospital.id}
          initialDoctorId={selectedDoctorForBooking?.id}
          initialCareCategory={selectedDoctorForBooking?.specialty}
          onClose={() => {
            setWizardOpen(false);
            setSelectedDoctorForBooking(null);
          }}
          onSuccess={(result) => {
            console.log('Booked successfully:', result);
          }}
        />
      )}
    </div>
  );
};

