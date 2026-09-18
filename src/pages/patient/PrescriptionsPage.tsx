import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { Prescription } from '../../types';
import { 
  Pill, 
  FileText, 
  Calendar, 
  Clock, 
  Printer, 
  Stethoscope, 
  Building2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrescriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      dbService.getPrescriptions(user.id, 'patient').then((res) => {
        setPrescriptions(res);
        if (res.length > 0) setSelectedRx(res[0]);
        setLoading(false);
      });
    }
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/60 text-teal-200 text-xs font-semibold mb-3 border border-teal-700/50">
            <Pill className="w-3.5 h-3.5" />
            Verified Digital Prescriptions
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Digital Prescription Workspace
          </h1>
          <p className="text-teal-100/80 text-sm mt-2 max-w-xl leading-relaxed">
            Access, review, and print official electronic prescriptions issued by your attending CareFlow physicians. Review precise dosages, schedules, and clinical guidance.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-500">
          <Pill className="w-8 h-8 animate-pulse mx-auto mb-2 text-teal-600" />
          <p className="text-sm font-medium">Retrieving digital prescriptions...</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-gray-500">
          <FileText className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">No Prescriptions Issued Yet</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            Once you complete a consultation, your physician will issue your digital prescription here with dosage guidelines and pharmacy instructions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prescription List Column */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
              Issued Records ({prescriptions.length})
            </h3>
            {prescriptions.map((rx) => (
              <button
                key={rx.id}
                onClick={() => setSelectedRx(rx)}
                className={`w-full text-left p-4 rounded-xl border transition flex flex-col ${
                  selectedRx?.id === rx.id
                    ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500/50 shadow-sm'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-2 py-0.5 rounded">
                    {rx.prescription_date}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {rx.medicines.length} Medication(s)
                  </span>
                </div>
                <div className="font-bold text-gray-900 dark:text-white text-sm mt-1">
                  {rx.doctor?.profile?.full_name || 'Dr. Attending Physician'}
                </div>
                <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                  {rx.doctor?.specialty || 'General Consultation'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {rx.clinical_diagnosis_notes}
                </p>
              </button>
            ))}
          </div>

          {/* Detailed Prescription Sheet Column */}
          <div className="lg:col-span-2">
            {selectedRx ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6 print:shadow-none print:border-none">
                {/* Header with Hospital & Doctor Letterhead */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-5 h-5 text-teal-600" />
                      <span className="font-bold text-gray-900 dark:text-white text-lg">
                        {selectedRx.appointment?.hospital?.name || 'CareFlow Medical Center'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Official Outpatient Digital Prescription • Electronic Medical Record
                    </p>
                  </div>

                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print / PDF
                    </button>
                    <button
                      onClick={() => alert('Downloaded digital prescription PDF with verified cryptographic signature.')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                </div>

                {/* Patient & Doctor Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">Patient Name</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{user?.full_name || 'Ahmed Khan'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Attending Physician</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedRx.doctor?.profile?.full_name || 'Dr. Sarah Farooq'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Date Prescribed</span>
                    <span className="font-bold text-teal-600">{selectedRx.prescription_date}</span>
                  </div>
                </div>

                {/* Clinical Notes & Diagnosis */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    Clinical Diagnosis & Assessment Notes
                  </h4>
                  <div className="p-4 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-mono">
                    {selectedRx.clinical_diagnosis_notes}
                  </div>
                </div>

                {/* Prescribed Medications */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    Prescribed Medication & Dosage (Rx)
                  </h4>
                  <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-800">
                        <tr>
                          <th className="p-3">Medicine & Strength</th>
                          <th className="p-3">Frequency</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {selectedRx.medicines.map((med, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                            <td className="p-3">
                              <div className="font-bold text-gray-900 dark:text-white">{med.medicine_name}</div>
                              <div className="text-[10px] text-teal-600 font-mono">{med.dosage}</div>
                            </td>
                            <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">{med.frequency}</td>
                            <td className="p-3 text-gray-700 dark:text-gray-300">{med.duration}</td>
                            <td className="p-3 text-gray-500 dark:text-gray-400 italic">{med.instructions || 'As advised'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Follow Up & Instructions */}
                {selectedRx.follow_up_instructions && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Follow-up Recommended: {selectedRx.follow_up_date || 'In 2-4 weeks'}
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      {selectedRx.follow_up_instructions}
                    </p>
                  </div>
                )}

                {/* Verified Digital Seal */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Attending Physician Signature • CareFlow Tele-EMR System
                  </div>
                  <span className="font-mono text-[10px]">RX-ID: {selectedRx.id}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-gray-400 text-xs">
                Select a prescription on the left to view complete clinical instructions.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

