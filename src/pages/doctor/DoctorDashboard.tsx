import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { Appointment, Queue, QueueStatus, Doctor } from '../../types';
import { 
  Stethoscope, 
  Users, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  UserCheck, 
  FileText,
  Play,
  CheckCheck,
  ShieldAlert,
  Sparkles,
  Pill
} from 'lucide-react';
import { getTodayDateString } from '../../services/mockData';
import { DoctorBriefingModal } from '../../components/doctor/DoctorBriefingModal';
import { CreatePrescriptionModal } from '../../components/doctor/CreatePrescriptionModal';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [doctorRecord, setDoctorRecord] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Clinical modals state
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
  const [briefingData, setBriefingData] = useState<{ patientName: string; reason: string; appointment: Appointment } | null>(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedAppointmentForRx, setSelectedAppointmentForRx] = useState<Appointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      const [apts, qList, allDocs] = await Promise.all([
        dbService.getAppointments(user.id, 'doctor'),
        dbService.getQueues(),
        dbService.getDoctors({ includePending: true })
      ]);
      setAppointments(apts);
      setQueues(qList);
      const foundDoc = allDocs.find(d => d.profile_id === user.id || d.profile?.id === user.id);
      setDoctorRecord(foundDoc || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const today = getTodayDateString();
  const todayAppointments = appointments.filter(a => a.appointment_date === today);
  const activeQueues = queues.filter(q => q.queue_date === today && q.status !== 'completed');

  const handleUpdateQueueStatus = async (queueId: string, status: QueueStatus) => {
    const updated = await dbService.updateQueueStatus(queueId, status);
    setQueues(updated);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            Doctor Clinical Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your daily patient queue, consultation status, and outpatient schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200">
          <Calendar className="w-3.5 h-3.5" />
          <span>Today: {today}</span>
        </div>
      </div>

      {/* Verification In Progress Banner */}
      {doctorRecord && doctorRecord.is_approved === false && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Credential Verification Under Review</h4>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Your physician profile is currently being credentialed by hospital administration. During this review period, your profile remains hidden from the public patient directory. You can configure your profile and review clinical department guidelines below.
            </p>
          </div>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Today
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{todayAppointments.length}</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Scheduled visits</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Waiting in Queue
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600">{activeQueues.filter(q => q.status === 'waiting').length}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">In Waiting Lounge B</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            In Consultation
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-teal-600">{activeQueues.filter(q => q.status === 'in_progress').length}</span>
            <Stethoscope className="w-4 h-4 text-teal-500" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Currently inside</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Completed Today
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600">{todayAppointments.filter(a => a.status === 'completed').length}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Finished visits</span>
        </div>
      </div>

      {/* Active Queue Manager Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Today's Active Patient Queue</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Room 204 Outpatient</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading clinic queue...</div>
        ) : activeQueues.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
            <h3 className="text-sm font-bold text-slate-800">All queues cleared for today</h3>
            <p className="text-xs text-slate-500 mt-0.5">No patients are waiting in the room at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-right">Queue Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeQueues.map(q => {
                  const apt = appointments.find(a => a.id === q.appointment_id) || q.appointment;
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg">
                          #{q.position}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {apt?.patient?.full_name || 'Ahmed Khan'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {apt?.start_time.slice(0, 5)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          q.status === 'in_progress' ? 'bg-teal-100 text-teal-800' :
                          q.status === 'waiting' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {q.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]">
                        {apt?.reason || 'Routine follow-up'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* AI Briefing Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setBriefingData({
                                patientName: apt?.patient?.full_name || 'Ahmed Khan',
                                reason: apt?.reason || 'Routine follow-up',
                                appointment: apt as Appointment
                              });
                              setBriefingModalOpen(true);
                            }}
                            className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-indigo-200 transition-colors"
                            title="Pre-consultation AI clinical briefing"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span className="hidden sm:inline">AI Briefing</span>
                          </button>

                          {/* Issue Prescription Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAppointmentForRx(apt || null);
                              setPrescriptionModalOpen(true);
                            }}
                            className="px-2 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-teal-200 transition-colors"
                            title="Issue digital prescription"
                          >
                            <Pill className="w-3 h-3 text-teal-600" />
                            <span className="hidden sm:inline">Issue Rx</span>
                          </button>

                          {q.status === 'waiting' && (
                            <button
                              onClick={() => handleUpdateQueueStatus(q.id, 'in_progress')}
                              className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                            >
                              <Play className="w-3 h-3" />
                              <span>Call In</span>
                            </button>
                          )}
                          {q.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateQueueStatus(q.id, 'completed')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mark Complete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Today's Schedule Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Upcoming Appointments for this Week</h3>
        <div className="divide-y divide-slate-100">
          {appointments.slice(0, 5).map(apt => (
            <div key={apt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  {apt.start_time.slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{apt.patient?.full_name || 'Ahmed Khan'}</p>
                  <p className="text-[11px] text-slate-400">{apt.appointment_date} at {apt.start_time.slice(0, 5)} • {apt.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setBriefingData({
                      patientName: apt.patient?.full_name || 'Ahmed Khan',
                      reason: apt.reason || 'Clinical Consultation',
                      appointment: apt
                    });
                    setBriefingModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-indigo-200 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>AI Briefing</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAppointmentForRx(apt);
                    setPrescriptionModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-teal-200 transition-colors"
                >
                  <Pill className="w-3 h-3 text-teal-600" />
                  <span>Issue Rx</span>
                </button>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                  apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                  apt.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                  'bg-rose-50 text-rose-700'
                }`}>
                  {apt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-900 text-white text-xs font-medium rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/70 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Pre-Consultation AI Briefing Modal */}
      <DoctorBriefingModal
        isOpen={briefingModalOpen}
        onClose={() => setBriefingModalOpen(false)}
        patientName={briefingData?.patientName || 'Ahmed Khan'}
        reason={briefingData?.reason || 'Clinical Consultation'}
        onOpenPrescription={() => {
          if (briefingData?.appointment) {
            setSelectedAppointmentForRx(briefingData.appointment);
            setPrescriptionModalOpen(true);
          }
        }}
      />

      {/* Issue Digital Prescription Modal */}
      <CreatePrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        appointment={selectedAppointmentForRx}
        doctor={doctorRecord}
        onPrescriptionCreated={(newRx) => {
          setToastMessage(`Prescription successfully issued for ${selectedAppointmentForRx?.patient?.full_name || 'patient'}! Logged to Health Timeline.`);
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />
    </div>
  );
};

