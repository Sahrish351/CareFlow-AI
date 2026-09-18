import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { HealthTimelineEvent, HealthTimelineEventType, MedicalDocument } from '../../types';
import { 
  Activity, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Pill, 
  Building2, 
  Stethoscope, 
  Sparkles, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReportSummaryModal } from '../../components/reports/ReportSummaryModal';

export const HealthTimelinePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<HealthTimelineEvent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MedicalDocument | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      dbService.getHealthTimeline(user.id).then((res) => {
        setEvents(res);
        setLoading(false);
      });
    }
  }, [user]);

  const filteredEvents = events.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'appointments') return e.type === 'appointment_booked' || e.type === 'visit_completed';
    if (filter === 'prescriptions') return e.type === 'prescription_issued';
    if (filter === 'reports') return e.type === 'report_uploaded';
    return true;
  });

  const getEventIcon = (type: HealthTimelineEventType) => {
    switch (type) {
      case 'visit_completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'prescription_issued':
        return <Pill className="w-5 h-5 text-blue-500" />;
      case 'report_uploaded':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'appointment_booked':
      default:
        return <Calendar className="w-5 h-5 text-teal-500" />;
    }
  };

  const getBadgeColor = (type: HealthTimelineEventType) => {
    switch (type) {
      case 'visit_completed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'prescription_issued':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'report_uploaded':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'appointment_booked':
      default:
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/60 text-teal-200 text-xs font-semibold mb-3 border border-teal-700/50">
            <Activity className="w-3.5 h-3.5" />
            Comprehensive Clinical History
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Health Journey Timeline
          </h1>
          <p className="text-teal-100/80 text-sm mt-2 max-w-xl leading-relaxed">
            Your unified longitudinal health timeline across all participating CareFlow partner hospitals. Track past clinical consultations, digital prescriptions, and laboratory panels.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-400 ml-2 mr-1" />
          {[
            { id: 'all', label: 'All Milestones' },
            { id: 'appointments', label: 'Visits & Appointments' },
            { id: 'prescriptions', label: 'Prescriptions' },
            { id: 'reports', label: 'Lab Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-400 px-3">
          Showing {filteredEvents.length} events
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="py-16 text-center text-gray-500">
          <Activity className="w-8 h-8 animate-pulse mx-auto mb-2 text-teal-600" />
          <p className="text-sm font-medium">Reconstructing health journey...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-gray-500">
          <Activity className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">No timeline events recorded</h3>
          <p className="text-xs text-gray-400 mt-1">
            When you book appointments, receive prescriptions, or upload lab reports, they will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-teal-500/20 space-y-8 my-4 ml-4 sm:ml-6">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Timeline Pin Node */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-teal-500 flex items-center justify-center shadow-md">
                {getEventIcon(evt.type)}
              </div>

              {/* Event Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor(evt.type)}`}>
                      {evt.badge_label || evt.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">
                      {evt.date}
                    </span>
                  </div>

                  {evt.doctor_name && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>{evt.doctor_name}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {evt.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  {evt.description}
                </p>

                {/* Footer Metadata & Direct Action Buttons */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{evt.hospital_name || 'CareFlow Medical Center'}</span>
                  </div>

                  {evt.type === 'prescription_issued' && (
                    <button
                      onClick={() => navigate('/patient/prescriptions')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>View Prescription</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {evt.type === 'report_uploaded' && (
                    <button
                      onClick={() => {
                        setSelectedReport({
                          id: evt.reference_id || 'rep-1',
                          patient_id: evt.patient_id,
                          document_name: 'Complete_Blood_Count_Panel_Report.pdf',
                          document_type: 'Blood Test',
                          storage_path: 'mock/path.pdf',
                        });
                        setShowReportModal(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 transition"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Explain with AI</span>
                    </button>
                  )}

                  {evt.type === 'visit_completed' && (
                    <button
                      onClick={() => navigate('/patient/dashboard')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <span>Consultation Summary</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Report Modal */}
      <ReportSummaryModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        document={selectedReport}
      />
    </div>
  );
};

