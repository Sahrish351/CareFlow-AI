import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { Appointment, MedicalDocument, AppNotification } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Bot, 
  Search, 
  ArrowRight, 
  Stethoscope, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  Bell,
  AlertCircle,
  Heart,
  Users,
  Activity,
  Pill,
  Star,
  ShieldCheck
} from 'lucide-react';
import { ReportSummaryModal } from '../../components/reports/ReportSummaryModal';
import { AppointmentReviewModal } from '../../components/reviews/AppointmentReviewModal';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [quickAiInput, setQuickAiInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [selectedDocForSummary, setSelectedDocForSummary] = useState<MedicalDocument | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reviewAppointment, setReviewAppointment] = useState<Appointment | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        const [apts, docs, notifs] = await Promise.all([
          dbService.getAppointments(user.id, 'patient'),
          dbService.getMedicalDocuments(user.id),
          dbService.getNotifications(user.id)
        ]);
        setAppointments(apts);
        setDocuments(docs);
        setNotifications(notifs);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const upcomingApt = appointments.find(a => a.status === 'confirmed');
  const unreadNotifs = notifications.filter(n => !n.is_read);

  const handleQuickAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAiInput.trim()) return;
    navigate('/patient/ai-navigation');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Quick AI Entry */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[11px] font-semibold text-teal-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            CareFlow Patient Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good day, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1.5 leading-relaxed">
            Need guidance on which specialist to see, where your reports are, or your queue position? Ask your hospital assistant.
          </p>

          <form onSubmit={handleQuickAiSubmit} className="mt-5 flex items-center gap-2 max-w-lg bg-white/10 p-1.5 rounded-2xl border border-white/20 backdrop-blur-xs">
            <Bot className="w-5 h-5 text-teal-300 ml-2.5 shrink-0" />
            <input
              type="text"
              value={quickAiInput}
              onChange={(e) => setQuickAiInput(e.target.value)}
              placeholder="e.g. I have severe headache, recommend a doctor..."
              className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-white placeholder:text-teal-200/60 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shrink-0 shadow-xs"
            >
              Ask AI
            </button>
          </form>
        </div>
      </div>

      {/* Grid: Upcoming Appointment & Live Queue Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Appointment Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Calendar className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Upcoming Consultation</h2>
                <p className="text-[11px] text-slate-400">Scheduled clinical appointment</p>
              </div>
            </div>
            {upcomingApt && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Confirmed
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-8 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ) : upcomingApt ? (
            <div className="py-5 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={upcomingApt.doctor?.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                  alt={upcomingApt.doctor?.profile?.full_name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {upcomingApt.doctor?.profile?.full_name}
                  </h3>
                  <p className="text-xs text-teal-700 font-semibold flex items-center gap-1.5 mt-0.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {upcomingApt.department?.name} Specialist
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {upcomingApt.hospital?.name} • Room 204
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Date & Time
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {upcomingApt.appointment_date} at {upcomingApt.start_time.slice(0, 5)}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Reason
                  </span>
                  <span className="text-xs font-semibold text-slate-800 truncate block">
                    {upcomingApt.reason || 'Routine Checkup'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40 text-teal-600" />
              <p className="text-xs font-medium text-slate-600">No upcoming consultations</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Find a doctor and book your next appointment.</p>
              <Link
                to="/patient/doctors"
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <span>Find Doctor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/patient/appointments"
              className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
            >
              <span>View all appointments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {upcomingApt && (
              <span className="text-[11px] text-slate-400">Please arrive 10m early</span>
            )}
          </div>
        </div>

        {/* Live Queue Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Live Queue Status</h2>
                <p className="text-[11px] text-slate-400">Outpatient waiting area</p>
              </div>
            </div>
            {upcomingApt?.queue && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>

          {upcomingApt?.queue ? (
            <div className="py-6 text-center space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Your Position
                </span>
                <div className="text-4xl font-extrabold text-teal-700 mt-1">
                  #{upcomingApt.queue.position}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Patients Ahead</span>
                  <span className="font-bold text-slate-800">{upcomingApt.queue.patients_ahead}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Est. Wait</span>
                  <span className="font-bold text-amber-600">~{upcomingApt.queue.estimated_wait_minutes}m</span>
                </div>
              </div>

              {upcomingApt.queue.patients_ahead <= 2 && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-300 font-bold flex items-center gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>You're getting close! Only {upcomingApt.queue.patients_ahead} patient(s) ahead. Please proceed to clinic reception.</span>
                </div>
              )}

              <Link
                to="/patient/queue"
                className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold transition-colors inline-block text-center"
              >
                Open Full Queue Tracker
              </Link>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30 text-sky-600" />
              <p className="text-xs font-medium text-slate-600">No active queue for today</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Live queue tickets generate on appointment day.</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">Updates dynamically in real time</span>
          </div>
        </div>
      </div>

      {/* Before-You-Leave Visit Plan Card (When Consultation Upcoming) */}
      {upcomingApt && (
        <div className="bg-white rounded-2xl p-5 border border-teal-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Before-You-Leave Visit Plan
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Required Documents & Clinical Preparation for {upcomingApt.hospital?.name}
            </h3>
            <p className="text-xs text-slate-500">
              Remember to bring original CNIC / B-Form, past prescription slips, and previous radiology films.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((upcomingApt.hospital?.name || '') + ' ' + (upcomingApt.hospital?.city || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Get Hospital Directions</span>
            </a>
            <Link
              to="/patient/passport"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Open Care Passport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Post-Consultation Follow-Up Care & Verified Review Card */}
      {appointments.some(a => a.status === 'completed') && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Care Completed
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  Cardiology Consultation
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Continue Your Care & Share Your Feedback
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Review your digital prescription or leave a verified 5-star clinical rating for your attending doctor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const comp = appointments.find(a => a.status === 'completed');
                if (comp) {
                  setReviewAppointment(comp);
                  setShowReviewModal(true);
                }
              }}
              className="px-3.5 py-2 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Leave Doctor Review</span>
            </button>
            <Link
              to="/patient/prescriptions"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Pill className="w-3.5 h-3.5" />
              <span>View Prescription</span>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        <Link
          to="/patient/passport"
          className="bg-white p-4 rounded-2xl border border-teal-300 dark:border-teal-700 shadow-xs hover:border-teal-500 hover:shadow-sm transition-all group bg-gradient-to-b from-teal-50/40 to-white"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm shadow-teal-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
            Care Passport
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Vitals & privacy controls</p>
        </Link>

        <Link
          to="/patient/ai-navigation"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-400 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
            AI Care Navigator
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Symptom & specialty guide</p>
        </Link>

        <Link
          to="/patient/family"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-400 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
            My Family
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Dependent profiles</p>
        </Link>

        <Link
          to="/patient/timeline"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-400 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
            Health Journey
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Timeline milestones</p>
        </Link>

        <Link
          to="/patient/prescriptions"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Pill className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
            Prescriptions
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Dosages & schedule</p>
        </Link>

        <Link
          to="/patient/queue"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-400 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
            Queue Tracker
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Live hospital tickets</p>
        </Link>

        <Link
          to="/patient/reports"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-400 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
            Medical Reports
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Lab panels & scans</p>
        </Link>
      </div>

      {/* Recent Medical Reports Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Medical Reports</h2>
              <p className="text-[11px] text-slate-400">Uploaded diagnostic records</p>
            </div>
          </div>
          <Link
            to="/patient/reports"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>View all reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {documents.slice(0, 3).map(doc => (
            <div
              key={doc.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{doc.document_name}</p>
                  <span className="text-[10px] text-slate-400">{doc.document_type}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDocForSummary(doc);
                  setShowReportModal(true);
                }}
                className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold shrink-0 transition flex items-center gap-1"
                title="Explain report terminology with AI"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Explain</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ReportSummaryModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        document={selectedDocForSummary}
      />

      <AppointmentReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        appointment={reviewAppointment}
        patientName={user?.full_name}
        onReviewSubmitted={() => {
          alert('Review submitted successfully!');
        }}
      />
    </div>
  );
};

