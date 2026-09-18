import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment } from '../../types';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Search,
  ArrowRight,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { STANDARD_TIME_SLOTS, getTomorrowDateString } from '../../services/mockData';

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  // Reschedule state
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>(getTomorrowDateString());
  const [newSlot, setNewSlot] = useState<string>('10:00:00');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cancel modal state
  const [cancellingApt, setCancellingApt] = useState<Appointment | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState<string>('Schedule conflict / Personal emergency');
  const [cancelReasonDetails, setCancelReasonDetails] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const loadAppointments = async () => {
    if (!user) return;
    try {
      const data = await dbService.getAppointments(user.id, 'patient');
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user?.id]);

  const handleOpenCancelModal = (apt: Appointment) => {
    setCancellingApt(apt);
    setCancelReasonPreset('Schedule conflict / Personal emergency');
    setCancelReasonDetails('');
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !cancellingApt) return;
    setIsCancelling(true);
    try {
      const fullReason = cancelReasonPreset === 'Other' 
        ? (cancelReasonDetails || 'Patient requested cancellation')
        : (cancelReasonDetails ? `${cancelReasonPreset} (${cancelReasonDetails})` : cancelReasonPreset);
      await dbService.cancelAppointment(cancellingApt.id, user.id, fullReason);
      setCancellingApt(null);
      await loadAppointments();
    } catch (err: any) {
      alert(err?.message || 'Could not cancel appointment.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApt) return;
    setIsSubmitting(true);
    setRescheduleError(null);
    try {
      const slotObj = STANDARD_TIME_SLOTS.find(s => s.start === newSlot) || STANDARD_TIME_SLOTS[0];
      await dbService.rescheduleAppointment(
        reschedulingApt.id,
        newDate,
        slotObj.start,
        slotObj.end
      );
      setReschedulingApt(null);
      await loadAppointments();
    } catch (err: any) {
      setRescheduleError(err?.message || 'Conflict: Slot already booked.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const isPast = apt.status === 'completed' || apt.status === 'cancelled';
    if (filterTab === 'upcoming') return !isPast;
    if (filterTab === 'past') return isPast;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-teal-600" />
            My Consultations & Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your hospital schedule, reschedule visits, or track active queue positions.
          </p>
        </div>

        <Link
          to="/patient/doctors"
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Book New Visit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold pb-1">
        <button
          onClick={() => setFilterTab('upcoming')}
          className={`pb-2 px-3 border-b-2 transition-colors ${
            filterTab === 'upcoming'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Upcoming Confirmed
        </button>
        <button
          onClick={() => setFilterTab('past')}
          className={`pb-2 px-3 border-b-2 transition-colors ${
            filterTab === 'past'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Past / Completed
        </button>
        <button
          onClick={() => setFilterTab('all')}
          className={`pb-2 px-3 border-b-2 transition-colors ${
            filterTab === 'all'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All History ({appointments.length})
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-xs">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No appointments in this view</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Find a doctor and book your next consultation with CareFlow.
          </p>
          <Link
            to="/patient/doctors"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors inline-block"
          >
            Browse Doctors & Specialties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map(apt => {
            const isConfirmed = apt.status === 'confirmed';
            const isCancelled = apt.status === 'cancelled';
            const isCompleted = apt.status === 'completed';

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-shadow space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={apt.doctor?.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                      alt={apt.doctor?.profile?.full_name || 'Doctor'}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {apt.doctor?.profile?.full_name}
                      </h3>
                      <p className="text-xs text-teal-700 font-medium flex items-center gap-1 mt-0.5">
                        <Stethoscope className="w-3.5 h-3.5" />
                        {apt.department?.name}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {apt.hospital?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isConfirmed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isCompleted ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        isCancelled ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {apt.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 font-mono">
                      {apt.appointment_date} at {apt.start_time.slice(0, 5)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Reason for Consultation
                    </span>
                    <p className="text-slate-700 font-medium">
                      {apt.reason || 'General clinical checkup and consultation'}
                    </p>
                  </div>

                  {apt.queue && (
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-teal-700 block mb-0.5">
                          Queue Position
                        </span>
                        <p className="text-sm font-bold text-teal-950">
                          #{apt.queue.position} ({apt.queue.patients_ahead} ahead)
                        </p>
                      </div>
                      <Link
                        to="/patient/queue"
                        className="px-2.5 py-1.5 bg-teal-600 text-white rounded-lg text-[11px] font-semibold hover:bg-teal-700 transition-colors"
                      >
                        Live Tracker
                      </Link>
                    </div>
                  )}
                </div>

                {/* Cancellation Reason if cancelled */}
                {apt.status === 'cancelled' && apt.cancellation_reason && (
                  <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-700">
                    <span className="font-semibold">Reason:</span> {apt.cancellation_reason}
                  </div>
                )}

                {/* Actions */}
                {isConfirmed && (
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenCancelModal(apt)}
                      className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Cancel Consultation
                    </button>
                    <button
                      onClick={() => {
                        setReschedulingApt(apt);
                        setRescheduleError(null);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Reschedule Slot
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-900">Reschedule Consultation</h3>
              <button
                onClick={() => setReschedulingApt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-4 text-xs">
              {rescheduleError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{rescheduleError}</span>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-700 block mb-1">Physician</span>
                <p className="p-2.5 bg-slate-50 rounded-xl text-slate-800 font-semibold">
                  {reschedulingApt.doctor?.profile?.full_name} ({reschedulingApt.department?.name})
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Slot</label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {STANDARD_TIME_SLOTS.map(s => (
                    <option key={s.start} value={s.start}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReschedulingApt(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Rescheduling...' : 'Confirm New Time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancellingApt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-900">Cancel Consultation</h3>
              <button
                onClick={() => setCancellingApt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="p-6 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Appointment</span>
                <p className="p-2.5 bg-slate-50 rounded-xl text-slate-800 font-semibold">
                  {cancellingApt.doctor?.profile?.full_name} — {cancellingApt.appointment_date} at {cancellingApt.start_time.slice(0, 5)}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Please select a reason for cancellation</label>
                <select
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Schedule conflict / Personal emergency">Schedule conflict / Personal emergency</option>
                  <option value="Feeling better / Symptoms resolved">Feeling better / Symptoms resolved</option>
                  <option value="Seeking care at another facility">Seeking care at another facility</option>
                  <option value="Need a different medical specialty">Need a different medical specialty</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Additional details (optional)</label>
                <textarea
                  value={cancelReasonDetails}
                  onChange={(e) => setCancelReasonDetails(e.target.value)}
                  placeholder="Provide any additional notes for the hospital clinic staff..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingApt(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

