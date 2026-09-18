import React, { useState, useEffect } from 'react';
import { Doctor, Department } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  X, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { getTodayDateString, getTomorrowDateString } from '../../services/mockData';

interface BookingModalProps {
  doctor: Doctor;
  initialDepartment?: Department;
  onClose: () => void;
  onSuccess: (appointment: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  doctor,
  initialDepartment,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [slots, setSlots] = useState<{ start_time: string; end_time: string; label: string; available: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ appointment: any; queue: any } | null>(null);

  useEffect(() => {
    loadSlots();
  }, [doctor.id, selectedDate]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    setErrorMessage(null);
    setSelectedSlot(null);
    try {
      const available = await dbService.getDoctorAvailableSlots(doctor.id, selectedDate);
      setSlots(available);
      // Select first available slot
      const firstAvailable = available.find(s => s.available);
      if (firstAvailable) setSelectedSlot(firstAvailable.start_time);
    } catch (err: any) {
      setErrorMessage('Could not load slots for this date.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedSlot) {
      setErrorMessage('Please select an available time slot.');
      return;
    }

    const slotObj = slots.find(s => s.start_time === selectedSlot);
    if (!slotObj) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const departments = await dbService.getDepartments();
      const matchedDept = initialDepartment || departments.find(d => 
        d.name.toLowerCase() === doctor.specialty.toLowerCase() ||
        d.specialty?.toLowerCase().includes(doctor.specialty.toLowerCase())
      ) || departments[0];

      const result = await dbService.bookAppointment({
        patient_id: user.id,
        doctor_id: doctor.id,
        department_id: matchedDept.id,
        hospital_id: doctor.hospital_id,
        appointment_date: selectedDate,
        start_time: slotObj.start_time,
        end_time: slotObj.end_time,
        reason: reason || 'Routine Clinical Consultation',
      });

      setSuccessInfo(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to book appointment. Please try a different slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-800">
              {successInfo ? 'Appointment Confirmed' : 'Book Consultation'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successInfo ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Booking is Confirmed!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  We have reserved your slot and added you to the doctor's live outpatient queue.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-semibold text-slate-800">{doctor.profile?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold text-slate-800">
                    {successInfo.appointment.appointment_date} at {successInfo.appointment.start_time.slice(0, 5)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Queue Position:</span>
                  <span className="font-bold text-teal-700">#{successInfo.queue.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Wait:</span>
                  <span className="font-semibold text-slate-800">~{successInfo.queue.estimated_wait_minutes} mins</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSuccess(successInfo.appointment);
                  onClose();
                }}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              {/* Doctor Profile Card in Modal */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
                <img
                  src={doctor.profile?.avatar_url || `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150`}
                  alt={doctor.profile?.full_name || 'Doctor'}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {doctor.profile?.full_name}
                    </h4>
                  </div>
                  <p className="text-xs text-teal-700 font-medium flex items-center gap-1 mt-0.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {doctor.specialty}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <Building className="w-3 h-3 text-slate-400" />
                    {doctor.hospital?.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-900 block">
                    ${doctor.consultation_fee}
                  </span>
                  <span className="text-[10px] text-slate-400">Consultation</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Consultation Date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(getTodayDateString())}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      selectedDate === getTodayDateString()
                        ? 'bg-teal-50 border-teal-500 text-teal-800 ring-1 ring-teal-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(getTomorrowDateString())}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      selectedDate === getTomorrowDateString()
                        ? 'bg-teal-50 border-teal-500 text-teal-800 ring-1 ring-teal-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="py-1.5 px-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Available Slots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Available Time Slots
                  </label>
                  <span className="text-[11px] text-slate-400">30 min slots</span>
                </div>

                {loadingSlots ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading schedule...</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                    {slots.map(slot => (
                      <button
                        type="button"
                        key={slot.start_time}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.start_time)}
                        className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all ${
                          !slot.available
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            : selectedSlot === slot.start_time
                            ? 'bg-teal-600 border-teal-600 text-white shadow-xs font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-teal-50/40'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reason for Visit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Consultation / Symptoms (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Mild headache, follow-up blood pressure review, skin rash..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedSlot}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

