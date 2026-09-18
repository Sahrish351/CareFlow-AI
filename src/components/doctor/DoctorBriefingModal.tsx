import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  AlertTriangle, 
  CheckSquare, 
  FileText, 
  User, 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  ArrowRight,
  Pill
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface DoctorBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  reason: string;
  pastVisitsCount?: number;
  recentReports?: string[];
  onOpenPrescription?: () => void;
}

export const DoctorBriefingModal: React.FC<DoctorBriefingModalProps> = ({
  isOpen,
  onClose,
  patientName,
  reason,
  pastVisitsCount = 2,
  recentReports = ['Complete Blood Count (CBC)', 'Lipid Profile Panel'],
  onOpenPrescription
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [briefing, setBriefing] = useState<{
    briefingSummary: string;
    clinicalAlerts: string[];
    suggestedDiscussionPoints: string[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      aiService.generateDoctorBriefing(patientName, reason, pastVisitsCount, recentReports)
        .then((res) => {
          setBriefing(res);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isOpen, patientName, reason]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200/80">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>CareFlow AI • Clinical Pre-Consultation Briefing</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            AI Clinical Briefing: {patientName}
          </h2>
          <p className="text-xs text-blue-200/80 mt-1 flex items-center gap-2">
            <span>Chief Complaint: <strong className="text-white">"{reason}"</strong></span>
            <span>•</span>
            <span>{pastVisitsCount} prior visits on file</span>
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Synthesizing past encounter history, lab results, and consultation points...
              </p>
            </div>
          ) : briefing ? (
            <>
              {/* Executive Summary */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Clinical Snapshot</span>
                </div>
                <p className="text-xs text-blue-950 leading-relaxed font-medium">
                  {briefing.briefingSummary}
                </p>
              </div>

              {/* Clinical Alerts / Red Flags */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Key Clinical Considerations & Alerts</span>
                </div>
                <div className="space-y-2">
                  {briefing.clinicalAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 text-xs text-amber-950 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        !
                      </span>
                      <span className="leading-relaxed">{alert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultation Checklist */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <CheckSquare className="w-4 h-4 text-teal-600" />
                  <span>Suggested Discussion Points for Consultation</span>
                </div>
                <div className="space-y-2">
                  {briefing.suggestedDiscussionPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-800 flex items-start gap-2.5 hover:bg-slate-100/70 transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Disclaimer */}
              <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-normal">
                  <strong>Clinical Decision Support Notice:</strong> This summary is generated as physician assistive information. It does not replace medical review. All diagnostic evaluations and treatments are the sole responsibility of the attending physician.
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Unable to generate briefing at this time.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Close Briefing
          </button>
          
          <div className="flex items-center gap-2">
            {onOpenPrescription && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPrescription();
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Issue Prescription</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Begin Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

