import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  Stethoscope, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ShieldCheck, 
  ArrowRight,
  Phone,
  Sparkles,
  HeartPulse,
  Download
} from 'lucide-react';
import { Hospital, Doctor, Department, CareCategory, FamilyMember } from '../../types';
import { dbService, downloadIcsFile } from '../../services/dbService';
import { useAuth } from '../../contexts/AuthContext';
import { getTodayDateString, getTomorrowDateString } from '../../services/mockData';

interface AppointmentWizardModalProps {
  isOpen?: boolean;
  initialCareCategory?: string;
  initialHospitalId?: string;
  initialDoctorId?: string;
  initialFamilyMemberId?: string | null;
  onClose: () => void;
  onSuccess?: (result: { appointment: any; queue: any }) => void;
}

const STEPS = [
  { id: 1, name: 'Care Specialty', short: 'Care' },
  { id: 2, name: 'Hospital', short: 'Hospital' },
  { id: 3, name: 'Doctor', short: 'Doctor' },
  { id: 4, name: 'Date', short: 'Date' },
  { id: 5, name: 'Time Slot', short: 'Time' },
  { id: 6, name: 'Patient Info', short: 'Details' },
  { id: 7, name: 'Confirmation', short: 'Confirm' }
];

export const AppointmentWizardModal: React.FC<AppointmentWizardModalProps> = ({
  isOpen,
  initialCareCategory,
  initialHospitalId,
  initialDoctorId,
  initialFamilyMemberId,
  onClose,
  onSuccess
}) => {
  if (isOpen === false) return null;

  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data collections
  const [allCategories, setAllCategories] = useState<CareCategory[]>([]);
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // User selections
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCareCategory || '');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedSlot, setSelectedSlot] = useState<{ start_time: string; end_time: string; label: string } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{ start_time: string; end_time: string; label: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string | null>(initialFamilyMemberId || null);

  // Patient inputs
  const [patientName, setPatientName] = useState<string>(user?.full_name || 'Ahmed Khan');
  const [patientEmail, setPatientEmail] = useState<string>(user?.email || 'patient.ahmed@careflow.ai');
  const [patientPhone, setPatientPhone] = useState<string>(user?.phone || '+92 (300) 900-0001');
  const [visitReason, setVisitReason] = useState<string>('');

  // Search filters
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [hospitalSearch, setHospitalSearch] = useState<string>('');

  // Result state
  const [bookingSuccess, setBookingSuccess] = useState<{ appointment: any; queue: any } | null>(null);

  // Initialize data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [cats, hosps, docs, depts, fams] = await Promise.all([
          Promise.resolve(dbService.getCareCategories()),
          dbService.getHospitals(),
          dbService.getDoctors(),
          dbService.getDepartments(),
          user ? dbService.getFamilyMembers(user.id) : Promise.resolve([])
        ]);

        setAllCategories(cats);
        setAllHospitals(hosps);
        setAllDoctors(docs);
        setAllDepartments(depts);
        setFamilyMembers(fams);

        if (initialFamilyMemberId) {
          const matchFam = fams.find(f => f.id === initialFamilyMemberId);
          if (matchFam) {
            setSelectedFamilyMemberId(matchFam.id);
            setPatientName(matchFam.full_name);
          }
        }

        // Pre-fill initial selections if provided
        if (initialHospitalId) {
          const hosp = hosps.find(h => h.id === initialHospitalId);
          if (hosp) setSelectedHospital(hosp);
        }

        if (initialDoctorId) {
          const doc = docs.find(d => d.id === initialDoctorId);
          if (doc) {
            setSelectedDoctor(doc);
            if (!initialHospitalId && doc.hospital) {
              setSelectedHospital(doc.hospital);
            }
            setSelectedCategory(doc.specialty);
            setCurrentStep(4); // Jump to date selection
          }
        } else if (initialHospitalId) {
          setCurrentStep(2);
        } else if (initialCareCategory) {
          setSelectedCategory(initialCareCategory);
          setCurrentStep(2);
        }
      } catch (e) {
        console.error('Error loading wizard data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [initialCareCategory, initialHospitalId, initialDoctorId]);

  // Load available slots when doctor and date change
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        setSelectedSlot(null);
        try {
          const slots = await dbService.getDoctorAvailableSlots(selectedDoctor.id, selectedDate);
          setAvailableSlots(slots);
          const first = slots.find(s => s.available);
          if (first) {
            setSelectedSlot({ start_time: first.start_time, end_time: first.end_time, label: first.label });
          }
        } catch (err) {
          console.error('Error loading slots:', err);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDoctor, selectedDate]);

  // Filtered lists
  const filteredCategories = allCategories.filter(cat => 
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    cat.specialty.toLowerCase().includes(categorySearch.toLowerCase()) ||
    cat.keywords.some(k => k.toLowerCase().includes(categorySearch.toLowerCase()))
  );

  const availableHospitals = allHospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.city.toLowerCase().includes(hospitalSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (!selectedCategory) return true;

    // Check if hospital has department or doctor matching category
    const hasDept = allDepartments.some(d => 
      d.hospital_id === h.id && 
      (d.name.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(d.name.toLowerCase()))
    );
    const hasDoc = allDoctors.some(d => 
      d.hospital_id === h.id && 
      (d.specialty.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(d.specialty.toLowerCase()))
    );

    return hasDept || hasDoc;
  });

  const availableDoctors = allDoctors.filter(d => {
    if (selectedHospital && d.hospital_id !== selectedHospital.id) return false;
    if (selectedCategory) {
      const match = d.specialty.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                    selectedCategory.toLowerCase().includes(d.specialty.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const displayedDoctors = availableDoctors.length > 0 
    ? availableDoctors 
    : (selectedHospital ? allDoctors.filter(d => d.hospital_id === selectedHospital.id) : allDoctors);

  // Wizard navigation handlers
  const canGoNext = () => {
    switch (currentStep) {
      case 1: return !!selectedCategory;
      case 2: return !!selectedHospital;
      case 3: return !!selectedDoctor;
      case 4: return !!selectedDate;
      case 5: return !!selectedSlot;
      case 6: return patientName.trim().length > 0 && patientEmail.trim().length > 0;
      case 7: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < 7) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError(null);
    }
  };

  // Final booking execution
  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedHospital || !selectedSlot) {
      setError('Please ensure all booking selections are complete.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const patientId = user?.id || 'c0000000-0000-0000-0000-000000000001';
      const matchedDept = allDepartments.find(d => 
        d.hospital_id === selectedHospital.id && 
        (d.name.toLowerCase().includes(selectedCategory.toLowerCase()) || d.specialty?.toLowerCase().includes(selectedCategory.toLowerCase()))
      ) || allDepartments.find(d => d.hospital_id === selectedHospital.id) || allDepartments[0];

      const result = await dbService.bookAppointment({
        patient_id: patientId,
        doctor_id: selectedDoctor.id,
        department_id: matchedDept.id,
        hospital_id: selectedHospital.id,
        appointment_date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        reason: visitReason || `Consultation for ${selectedCategory || 'Routine Care'}`,
        family_member_id: selectedFamilyMemberId || null,
      });

      setBookingSuccess(result);
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      setError(err.message || 'Unable to confirm appointment. That slot might have been booked. Please choose another.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Step Indicator */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold tracking-wide uppercase">
                {bookingSuccess ? 'Booking Confirmed' : `Step ${currentStep} of 7`}
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {bookingSuccess ? 'Appointment Scheduled' : STEPS[currentStep - 1].name}
              </h2>
            </div>
            {!bookingSuccess && (
              <p className="text-xs text-slate-500 mt-0.5">
                CareFlow Multi-Hospital Guided Scheduling
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Bar */}
        {!bookingSuccess && (
          <div className="px-6 pt-3 pb-2 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
              {STEPS.map((s) => {
                const isCurrent = s.id === currentStep;
                const isDone = s.id < currentStep;
                return (
                  <button
                    key={s.id}
                    disabled={s.id > currentStep}
                    onClick={() => setCurrentStep(s.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-teal-600 text-white shadow-xs'
                        : isDone
                        ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                        : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent ? 'bg-white text-teal-700' : isDone ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isDone ? '✓' : s.id}
                    </span>
                    <span className="hidden sm:inline">{s.short}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUCCESS SCREEN */}
          {/* ======================================================== */}
          {bookingSuccess ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Your Appointment is Confirmed!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Your slot has been recorded in the hospital registry and your outpatient ticket has been generated.
                </p>
              </div>

              {/* Queue Ticket Badge */}
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl p-5 shadow-lg max-w-sm mx-auto text-left relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                      Live Queue Ticket
                    </span>
                    <div className="text-3xl font-black mt-2 tracking-tight">
                      #{bookingSuccess.queue?.position || '104'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-teal-100 block">Est. Wait</span>
                    <span className="text-lg font-bold">~{bookingSuccess.queue?.estimated_wait_minutes || 15} mins</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/20 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-teal-100">Hospital:</span>
                    <span className="font-semibold text-white">{selectedHospital?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-100">Specialist:</span>
                    <span className="font-semibold text-white">{selectedDoctor?.profile?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-100">Date & Slot:</span>
                    <span className="font-semibold text-white">
                      {bookingSuccess.appointment.appointment_date} at {bookingSuccess.appointment.start_time.slice(0, 5)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Before-You-Leave Visit Plan */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>Before-You-Leave Visit Plan</span>
                  </div>
                  <a
                    href={selectedHospital?.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((selectedHospital?.name || '') + ' ' + (selectedHospital?.city || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    <span>Google Maps Directions</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">
                    📍 {selectedHospital?.name}, {selectedHospital?.address}, {selectedHospital?.city}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Emergency Phone: <span className="font-mono text-rose-600 font-semibold">{selectedHospital?.emergency_phone || '+92 (300) 111-2233'}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    Checklist of Documents to Bring:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Original CNIC or B-Form (Minors)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Past Prescriptions & Lab Reports</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Relevant X-Rays / MRI Scans</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Daily Medicines in Original Boxes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/patient/queue');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Track Live Queue Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (bookingSuccess.appointment) {
                      downloadIcsFile(bookingSuccess.appointment);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl border border-teal-600/30 text-teal-700 bg-teal-50 hover:bg-teal-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Add to Calendar (.ics)</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/patient/appointments');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  View My Appointments
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* STEP 1: CARE SPECIALTY */}
              {/* ======================================================== */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Select Medical Specialty or Concern
                    </label>
                    <p className="text-xs text-slate-500">
                      Choose from over 23 clinical specialties supported across our hospital network.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search specialty, symptom, or condition (e.g. Back pain, Cardiology, Skin)..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white outline-hidden transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {filteredCategories.map((cat) => {
                      const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">{cat.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                          </div>
                          <span className="text-[11px] font-medium text-teal-700 block mt-0.5">{cat.specialty}</span>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{cat.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 2: HOSPITAL SELECTION */}
              {/* ======================================================== */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-0.5">
                        Select Hospital Facility
                      </label>
                      <p className="text-xs text-slate-500">
                        {selectedCategory ? `Facilities offering ${selectedCategory} care` : 'All available partner hospitals'}
                      </p>
                    </div>
                    {selectedCategory && (
                      <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-semibold">
                        Specialty: {selectedCategory}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Filter by hospital name or city (Lahore, Islamabad, Karachi)..."
                      value={hospitalSearch}
                      onChange={(e) => setHospitalSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {availableHospitals.map((hosp) => {
                      const isSelected = selectedHospital?.id === hosp.id;
                      return (
                        <div
                          key={hosp.id}
                          onClick={() => setSelectedHospital(hosp)}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex gap-3.5 items-center ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                          }`}
                        >
                          <img
                            src={hosp.thumbnail_image || hosp.hero_image}
                            alt={hosp.name}
                            className="w-20 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{hosp.name}</h4>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <MapPin className="w-3 h-3 text-teal-600" />
                                {hosp.city}
                              </span>
                              <span>•</span>
                              <span className="truncate">{hosp.address}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                Next: {hosp.next_available_slot || 'Today'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {hosp.doctor_count || 12} Specialists
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 3: DOCTOR SELECTION */}
              {/* ======================================================== */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-0.5">
                        Select Attending Specialist
                      </label>
                      <p className="text-xs text-slate-500">
                        {selectedHospital?.name} • {selectedCategory || 'All Specialists'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {displayedDoctors.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No specialists found for this specific filter. You can select another hospital or specialty.
                      </div>
                    ) : (
                      displayedDoctors.map((doc) => {
                        const isSelected = selectedDoctor?.id === doc.id;
                        return (
                          <div
                            key={doc.id}
                            onClick={() => setSelectedDoctor(doc)}
                            className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex gap-3.5 items-center ${
                              isSelected
                                ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                            }`}
                          >
                            <img
                              src={doc.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                              alt={doc.profile?.full_name}
                              className="w-13 h-13 rounded-full object-cover border-2 border-teal-100 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                  {doc.profile?.full_name}
                                </h4>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                              </div>
                              <span className="text-[11px] font-semibold text-teal-700 block">
                                {doc.specialty} • {doc.experience_years} yrs exp
                              </span>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {doc.bio}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                                <span className="font-bold text-slate-800">
                                  ${doc.consultation_fee} / visit
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-500 text-[10px]">
                                  Days: {doc.available_days?.join(', ') || 'Mon-Fri'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 4: DATE SELECTION */}
              {/* ======================================================== */}
              {currentStep === 4 && selectedDoctor && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-0.5">
                      Select Appointment Date
                    </label>
                    <p className="text-xs text-slate-500">
                      Dr. {selectedDoctor.profile?.full_name} is available on {selectedDoctor.available_days?.join(', ')}.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { label: 'Today', date: getTodayDateString() },
                      { label: 'Tomorrow', date: getTomorrowDateString() },
                      { 
                        label: 'In 2 Days', 
                        date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] 
                      },
                      { 
                        label: 'In 3 Days', 
                        date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] 
                      },
                    ].map((item) => {
                      const isSelected = selectedDate === item.date;
                      return (
                        <button
                          key={item.date}
                          type="button"
                          onClick={() => setSelectedDate(item.date)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="text-xs block">{item.label}</span>
                          <span className="text-[11px] text-slate-500 mt-0.5 block">{item.date}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1.5">Or pick custom calendar date:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={getTodayDateString()}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 5: TIME SLOT SELECTION */}
              {/* ======================================================== */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-0.5">
                        Select Consultation Slot
                      </label>
                      <p className="text-xs text-slate-500">
                        Date: {selectedDate} • Guaranteed no double-booking
                      </p>
                    </div>
                  </div>

                  {loadingSlots ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      Checking doctor availability for {selectedDate}...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot?.start_time === slot.start_time;
                        return (
                          <button
                            key={slot.start_time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot({ start_time: slot.start_time, end_time: slot.end_time, label: slot.label })}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              !slot.available
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                : isSelected
                                ? 'border-teal-600 bg-teal-600 text-white font-bold shadow-md'
                                : 'border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-slate-800'
                            }`}
                          >
                            <span className="text-xs block font-semibold">{slot.label}</span>
                            <span className={`text-[10px] mt-0.5 block ${isSelected ? 'text-teal-100' : slot.available ? 'text-teal-600' : 'text-slate-400'}`}>
                              {slot.available ? 'Available' : 'Booked'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 6: PATIENT INFORMATION */}
              {/* ======================================================== */}
              {currentStep === 6 && (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-0.5">
                      Patient Details & Visit Reason
                    </label>
                    <p className="text-xs text-slate-500">
                      Select whether this consultation is for yourself or a registered family dependent.
                    </p>
                  </div>

                  {familyMembers.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <label className="text-[11px] font-bold text-slate-600 block mb-2">
                        Booking Appointment For:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFamilyMemberId(null);
                            setPatientName(user?.full_name || 'Ahmed Khan');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            !selectedFamilyMemberId
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Myself ({user?.full_name?.split(' ')[0] || 'Patient'})
                        </button>
                        {familyMembers.map((fam) => (
                          <button
                            key={fam.id}
                            type="button"
                            onClick={() => {
                              setSelectedFamilyMemberId(fam.id);
                              setPatientName(fam.full_name);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                              selectedFamilyMemberId === fam.id
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {fam.full_name} ({fam.relationship})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
                        placeholder="Patient Full Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
                        placeholder="+92 (300) 000-0000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
                      placeholder="patient@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Chief Concern / Visit Reason</label>
                    <textarea
                      value={visitReason}
                      onChange={(e) => setVisitReason(e.target.value)}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
                      placeholder="e.g. Mild lower back stiffness for 3 days, no radiating pain, requesting assessment."
                    />
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 7: CONFIRMATION SUMMARY */}
              {/* ======================================================== */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-0.5">
                      Review & Confirm Appointment
                    </label>
                    <p className="text-xs text-slate-500">
                      CareFlow will instantly notify the hospital reception and issue your queue ticket.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                    <div className="flex justify-between pb-2.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Hospital Facility:</span>
                      <span className="font-bold text-slate-900 text-right">{selectedHospital?.name} ({selectedHospital?.city})</span>
                    </div>

                    <div className="flex justify-between pb-2.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Specialty / Department:</span>
                      <span className="font-bold text-teal-700">{selectedCategory || selectedDoctor?.specialty}</span>
                    </div>

                    <div className="flex justify-between pb-2.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Attending Doctor:</span>
                      <span className="font-bold text-slate-900">{selectedDoctor?.profile?.full_name}</span>
                    </div>

                    <div className="flex justify-between pb-2.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Scheduled Date & Time:</span>
                      <span className="font-bold text-slate-900">{selectedDate} at {selectedSlot?.label}</span>
                    </div>

                    <div className="flex justify-between pb-2.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Patient:</span>
                      <span className="font-semibold text-slate-900">{patientName} ({patientPhone})</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Consultation Fee:</span>
                      <span className="font-black text-emerald-700 text-sm">${selectedDoctor?.consultation_fee}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[11px] text-teal-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-teal-600" />
                    <span>Real-time hospital queue position is calculated automatically upon confirmation.</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!bookingSuccess && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentStep === 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                    canGoNext()
                      ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Confirming...</span>
                  ) : (
                    <>
                      <span>Confirm & Generate Ticket</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
