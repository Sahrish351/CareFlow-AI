import React, { useState } from 'react';
import { 
  X, 
  Pill, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Stethoscope, 
  Calendar, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Appointment, Doctor, Prescription, PrescriptionMedicine } from '../../types';
import { dbService } from '../../services/dbService';

interface CreatePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  doctor: Doctor | null;
  onPrescriptionCreated: (newRx: Prescription) => void;
}

export const CreatePrescriptionModal: React.FC<CreatePrescriptionModalProps> = ({
  isOpen,
  onClose,
  appointment,
  doctor,
  onPrescriptionCreated
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [adviceNotes, setAdviceNotes] = useState('Maintain proper hydration. Return if symptoms worsen.');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    {
      medicine_name: 'Amoxicillin 500mg',
      dosage: '1 Capsule',
      frequency: 'Every 8 hours (TDS)',
      duration: '5 Days',
      instructions: 'Take after meals with a full glass of water'
    }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !appointment) return null;

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        medicine_name: '',
        dosage: '1 Tablet',
        frequency: 'Twice daily (BD)',
        duration: '5 Days',
        instructions: 'Take after meals'
      }
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof PrescriptionMedicine, val: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: val };
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setError('Please provide a clinical diagnosis / impression note.');
      return;
    }

    const invalidMed = medicines.some(m => !m.medicine_name.trim());
    if (invalidMed) {
      setError('Please provide names for all prescribed medications.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const newRx = await dbService.createPrescription({
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: doctor?.id || appointment.doctor_id,
        prescription_date: new Date().toISOString().split('T')[0],
        clinical_diagnosis_notes: diagnosis,
        medicines,
        advice_notes: adviceNotes,
        follow_up_date: followUpDate || undefined,
      });

      onPrescriptionCreated(newRx);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to issue prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200/80">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300 mb-1.5">
            <Pill className="w-4 h-4" />
            <span>CareFlow Digital Prescription Workspace</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            Issue Digital Prescription
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-teal-200/80 mt-1">
            <span>Patient: <strong className="text-white">{appointment.patient?.full_name || 'Patient'}</strong></span>
            <span>•</span>
            <span>Attending: <strong className="text-white">{doctor?.profile?.full_name || 'Dr. Attending'}</strong></span>
            <span>•</span>
            <span>Hospital: {appointment.hospital?.name || 'CareFlow Clinic'}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Clinical Impression */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Clinical Diagnosis / Medical Impression *
            </label>
            <textarea
              required
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Lumbar Muscle Strain with mild radiculopathy. No neurological deficit observed."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Medications Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Prescribed Medications ({medicines.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medication</span>
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div 
                  key={idx} 
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700">
                      Medication #{idx + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                        title="Remove medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="lg:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Medicine Name & Strength</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Paracetamol 500mg"
                        value={med.medicine_name}
                        onChange={(e) => handleMedicineChange(idx, 'medicine_name', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Dosage</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 1 Tablet"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Duration</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 5 Days"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Frequency</label>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                      >
                        <option value="Once daily (OD)">Once daily (OD - morning)</option>
                        <option value="Once daily at night (HS)">Once daily at bedtime (HS)</option>
                        <option value="Twice daily (BD)">Twice daily (BD - morning/evening)</option>
                        <option value="Every 8 hours (TDS)">Three times daily (TDS)</option>
                        <option value="Four times daily (QDS)">Four times daily (QDS)</option>
                        <option value="As needed (PRN)">As needed for pain/symptoms (PRN)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Specific Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g. Take after food with warm water"
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice and Next Visit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Dietary & Lifestyle Advice
              </label>
              <textarea
                rows={2}
                value={adviceNotes}
                onChange={(e) => setAdviceNotes(e.target.value)}
                placeholder="e.g. Avoid heavy weight lifting. Gentle lumbar stretches twice daily."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Recommended Follow-Up
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 block">Optional follow-up date</span>
            </div>
          </div>

          {/* Footer inside form */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Issuing Digital Prescription...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sign & Issue Digital Prescription</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
