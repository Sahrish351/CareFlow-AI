import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment, Queue } from '../../types';
import { 
  Clock, 
  Users, 
  Stethoscope, 
  MapPin, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const QueueTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const data = await dbService.getAppointments(user.id, 'patient');
      setAppointments(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Find active appointment with queue
  const activeAppointment = appointments.find(
    a => (a.status === 'confirmed' || a.status === 'pending') && a.queue
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            Live Hospital Queue Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time outpatient queue position, patients ahead, and estimated wait duration.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-600' : 'text-slate-400'}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto mb-4" />
          <div className="h-16 bg-slate-100 rounded-xl max-w-sm mx-auto" />
        </div>
      ) : activeAppointment && activeAppointment.queue ? (
        <div className="space-y-4">
          {/* Main Live Queue Ticket Card */}
          <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-navy-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Background glowing gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Live Active Clinic Queue
                  </span>
                </div>
                <span className="text-xs text-slate-300 font-mono">
                  Date: {activeAppointment.appointment_date}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 text-center md:text-left">
                {/* Your Position */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-xs">
                  <span className="text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                    Your Queue Position
                  </span>
                  <div className="flex items-baseline justify-center md:justify-start gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      #{activeAppointment.queue.position}
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-300 font-medium mt-2">
                    {activeAppointment.queue.position === 1 ? 'You are next in line!' : `${activeAppointment.queue.patients_ahead} ahead of you`}
                  </p>
                </div>

                {/* Patients Ahead */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-xs">
                  <span className="text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                    Patients Ahead
                  </span>
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold text-teal-200 tracking-tight">
                      {activeAppointment.queue.patients_ahead}
                    </span>
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2">
                    In Waiting Area
                  </p>
                </div>

                {/* Estimated Wait */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-xs">
                  <span className="text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                    Estimated Wait Time
                  </span>
                  <div className="flex items-baseline justify-center md:justify-start gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-amber-300 tracking-tight">
                      ~{activeAppointment.queue.estimated_wait_minutes}
                    </span>
                    <span className="text-sm font-semibold text-slate-300">mins</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2">
                    Dynamic service estimate
                  </p>
                </div>
              </div>

              {/* Doctor Details Bar */}
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeAppointment.doctor?.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                    alt={activeAppointment.doctor?.profile?.full_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
                  />
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-white">
                      {activeAppointment.doctor?.profile?.full_name}
                    </h4>
                    <p className="text-xs text-teal-200 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" />
                      {activeAppointment.department?.name} • Room 204 (2nd Floor)
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{activeAppointment.hospital?.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Guidance Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Hospital Arrival Guidelines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Check-in Complete</span>
                  <span className="text-slate-500">Your appointment is validated in the clinic registry.</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Waiting Area</span>
                  <span className="text-slate-500">Please remain seated in Clinic Lounge B until called.</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">SMS / Display Notification</span>
                  <span className="text-slate-500">When your number is called, proceed to Room 204.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Active Queue Ticket</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm mx-auto leading-relaxed">
            Queue tracking is activated automatically on the day of your confirmed consultation. Book an appointment or consult the AI assistant to get started.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <Link
              to="/patient/doctors"
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Find a Doctor & Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/patient/ai-navigation"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Ask AI Navigation</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

