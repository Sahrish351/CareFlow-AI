import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Stethoscope, 
  Building2, 
  Star, 
  Clock, 
  ArrowRight, 
  Trash2, 
  Calendar,
  CheckCircle2,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { SavedDoctor, Doctor, Hospital } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentWizardModal } from '../../components/booking/AppointmentWizardModal';

export const SavedDoctorsPage: React.FC = () => {
  const { user } = useAuth();
  const [savedDoctors, setSavedDoctors] = useState<SavedDoctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadSaved();
  }, [user]);

  const loadSaved = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [savedList, hosps] = await Promise.all([
        dbService.getSavedDoctors(user.id),
        dbService.getHospitals()
      ]);
      setSavedDoctors(savedList);
      setHospitals(hosps);
    } catch (err) {
      console.error('Error loading saved doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (doctorId: string) => {
    if (!user) return;
    await dbService.toggleSaveDoctor(user.id, doctorId);
    setSavedDoctors(prev => prev.filter(s => s.doctor_id !== doctorId));
  };

  const handleBookDoctor = (doc: Doctor) => {
    setSelectedDoctorId(doc.id);
    setSelectedHospitalId(doc.hospital_id);
    setWizardOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            My Saved Doctors & Specialists
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quick access to your preferred healthcare providers across our regional hospital network.
          </p>
        </div>

        <Link
          to="/doctors"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition shadow-xs self-start sm:self-auto"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Explore All Doctors</span>
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Loading your saved physicians...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && savedDoctors.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No Saved Doctors Yet</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            When you browse physicians in the directory or after completing an appointment, click the heart icon to save them here for fast re-booking.
          </p>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
          >
            <Stethoscope className="w-4 h-4" />
            Browse Physician Directory
          </Link>
        </div>
      )}

      {/* Saved Doctors Grid */}
      {!loading && savedDoctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedDoctors.map(saved => {
            const doc = saved.doctor;
            if (!doc) return null;
            const hospital = hospitals.find(h => h.id === doc.hospital_id);
            const rating = doc.rating || 4.9;
            const reviewCount = doc.review_count || 42;

            return (
              <div
                key={saved.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={doc.profile?.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'}
                        alt={doc.profile?.full_name || 'Physician'}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-50"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white rounded-full p-0.5 border-2 border-white">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                          {doc.specialty}
                        </span>
                        <button
                          onClick={() => handleRemove(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-1 truncate">
                        {doc.profile?.full_name || 'Dr. Medical Specialist'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {doc.experience_years}+ Years Experience
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-slate-800">{rating.toFixed(1)}</span>
                      <span className="text-slate-400">({reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 truncate max-w-[160px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{hospital?.name || doc.hospital?.name || 'CareFlow'}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doc.bio || `Specialized clinical practitioner offering thorough evaluations and tailored care pathways for complex conditions.`}
                  </p>
                </div>

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

      {/* Booking Wizard Modal */}
      <AppointmentWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialHospitalId={selectedHospitalId}
        initialDoctorId={selectedDoctorId}
      />
    </div>
  );
};

