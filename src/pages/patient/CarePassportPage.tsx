import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { CarePassport, CarePassportPrivacySettings, Appointment, Prescription, MedicalDocument } from '../../types';
import { 
  Shield, 
  UserCheck, 
  Heart, 
  AlertTriangle, 
  Lock, 
  Save, 
  PhoneCall, 
  Plus, 
  X, 
  QrCode, 
  Printer, 
  Calendar, 
  Pill, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Activity,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CarePassportPage: React.FC = () => {
  const { user } = useAuth();
  const [passport, setPassport] = useState<CarePassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [cnic, setCnic] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<CarePassportPrivacySettings>({
    share_timeline: true,
    share_prescriptions: true,
    share_reports: true,
    share_allergies: true,
    share_conditions: true,
    allow_doctor_briefing: true
  });

  // Clinical Vault items
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reports, setReports] = useState<MedicalDocument[]>([]);

  useEffect(() => {
    loadPassportData();
  }, [user]);

  const loadPassportData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await dbService.getCarePassport(user.id);
      setPassport(data);
      setCnic(data.cnic || '');
      setBloodGroup(data.blood_group || 'B+');
      setEmergencyName(data.emergency_contact_name || '');
      setEmergencyPhone(data.emergency_contact_phone || '');
      setAllergies(data.allergies || []);
      setConditions(data.chronic_conditions || []);
      setMedications(data.current_medications || []);
      if (data.privacy_settings) {
        setPrivacy(data.privacy_settings);
      }

      // Load Vault
      const [appts, rxs, rpts] = await Promise.all([
        dbService.getAppointments(user.id, 'patient'),
        dbService.getPrescriptions(user.id, 'patient'),
        dbService.getMedicalDocuments(user.id)
      ]);
      setUpcomingAppointments(appts.filter((a: Appointment) => a.status === 'confirmed' || a.status === 'pending').slice(0, 3));
      setPrescriptions(rxs.slice(0, 3));
      setReports(rpts.slice(0, 3));
    } catch (err) {
      console.error('Error loading Care Passport:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const updated = await dbService.updateCarePassport(user.id, {
        cnic,
        blood_group: bloodGroup,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        allergies,
        chronic_conditions: conditions,
        current_medications: medications,
        privacy_settings: privacy
      });
      setPassport(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save Care Passport:', err);
    } finally {
      setSaving(false);
    }
  };

  const addTag = (type: 'allergy' | 'condition' | 'medication') => {
    if (type === 'allergy' && newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    } else if (type === 'condition' && newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    } else if (type === 'medication' && newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const removeTag = (type: 'allergy' | 'condition' | 'medication', val: string) => {
    if (type === 'allergy') setAllergies(allergies.filter(i => i !== val));
    if (type === 'condition') setConditions(conditions.filter(i => i !== val));
    if (type === 'medication') setMedications(medications.filter(i => i !== val));
  };

  const togglePrivacy = (key: keyof CarePassportPrivacySettings) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-200 border border-white/20">
            <Shield className="w-3.5 h-3.5" />
            Verified Patient Health Identity
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Care Passport</h1>
          <p className="text-emerald-100/90 text-sm max-w-xl">
            Your single unified, portable clinical identity. Seamlessly present your health vitals, emergency contacts, verified records, and granular privacy controls to any attending hospital across Pakistan.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md border border-white/20 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Pass
          </button>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Passport
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          Care Passport and Doctor Sharing Preferences successfully saved!
        </div>
      )}

      {/* Grid: Digital Pass & Quick Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 1 Col: Visual Digital Health Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm">
                  CF
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">CAREFLOW AI</div>
                  <div className="text-[10px] text-slate-400">National Healthcare Passport</div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Patient Name</div>
                <div className="text-xl font-bold tracking-tight text-white">{user?.full_name || 'Hassan Raza'}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">CNIC / ID</div>
                  <div className="text-sm font-mono text-emerald-200">{cnic || '35202-8472911-3'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Blood Group</div>
                  <div className="text-sm font-bold text-rose-400">{bloodGroup}</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Emergency SOS</div>
                <div className="text-xs text-white font-medium">{emergencyName || 'Dr. Tariq (Brother)'}</div>
                <div className="text-xs font-mono text-emerald-300">{emergencyPhone || '+92 300 4829103'}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <QrCode className="w-8 h-8 text-white p-1 bg-white/10 rounded-lg" />
                <span>Scan for encrypted provider briefing</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                ID: CF-PK-{(passport?.id || '98231').slice(0, 8)}
              </div>
            </div>
          </div>

          {/* Emergency SOS Dial Card */}
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                <PhoneCall className="w-4 h-4 animate-bounce" />
                Emergency Medical Services
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 font-bold">
                Pakistan 24/7
              </span>
            </div>
            <p className="text-xs text-rose-900/80 dark:text-rose-300/80 leading-relaxed">
              In severe emergencies such as sudden chest pressure, acute breathlessness, or stroke symptoms, dial immediately:
            </p>
            <div className="flex items-center gap-3">
              <a
                href="tel:1122"
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-center text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Dial Rescue 1122
              </a>
              <a
                href="tel:15"
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-all"
              >
                Police 15
              </a>
            </div>
          </div>

          {/* Granular Privacy Toggles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
              <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Doctor Sharing & Privacy
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control what data attending doctors can see during your consultation.
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between cursor-pointer text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Share Health Timeline</span>
                <input
                  type="checkbox"
                  checked={privacy.share_timeline}
                  onChange={() => togglePrivacy('share_timeline')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Share Prescriptions & Medicines</span>
                <input
                  type="checkbox"
                  checked={privacy.share_prescriptions}
                  onChange={() => togglePrivacy('share_prescriptions')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Share Diagnostic Reports</span>
                <input
                  type="checkbox"
                  checked={privacy.share_reports}
                  onChange={() => togglePrivacy('share_reports')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Share Allergies & Cautions</span>
                <input
                  type="checkbox"
                  checked={privacy.share_allergies}
                  onChange={() => togglePrivacy('share_allergies')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">AI Clinical Pre-Briefing</span>
                <input
                  type="checkbox"
                  checked={privacy.allow_doctor_briefing}
                  onChange={() => togglePrivacy('allow_doctor_briefing')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

        </div>

        {/* Right 2 Cols: Passport Information & Medical Profile */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Identity & Contact Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  National Healthcare Identity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Required by Pakistani tertiary care hospitals for verified electronic admission.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CNIC Number (National ID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 35202-1234567-1"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Contact Name & Relation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Tariq (Brother)"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +92 300 4829103"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Clinical Alerts: Allergies & Chronic Conditions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Allergies & High-Priority Alerts
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Known Drug & Food Allergies
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    placeholder="Add allergy (e.g. Penicillin, NSAIDs, Peanuts)"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('allergy'); } }}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('allergy')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allergies.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No allergies recorded (No known allergies)</span>
                  ) : (
                    allergies.map(a => (
                      <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-full text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        {a}
                        <button
                          type="button"
                          onClick={() => removeTag('allergy', a)}
                          className="hover:text-rose-900 dark:hover:text-white ml-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Chronic Diagnosed Conditions
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    placeholder="Add condition (e.g. Hypertension, Type 2 Diabetes, Asthma)"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('condition'); } }}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('condition')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {conditions.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No chronic conditions listed</span>
                  ) : (
                    conditions.map(c => (
                      <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 rounded-full text-xs font-semibold">
                        <Activity className="w-3 h-3 text-amber-500" />
                        {c}
                        <button
                          type="button"
                          onClick={() => removeTag('condition', c)}
                          className="hover:text-amber-900 dark:hover:text-white ml-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Current Active Medications */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Ongoing Medications
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    placeholder="Add medicine (e.g. Tab Metformin 500mg, Cap Omeprazole 20mg)"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('medication'); } }}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('medication')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {medications.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No daily medications recorded</span>
                  ) : (
                    medications.map(m => (
                      <span key={m} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 rounded-full text-xs font-semibold">
                        <Pill className="w-3 h-3 text-emerald-500" />
                        {m}
                        <button
                          type="button"
                          onClick={() => removeTag('medication', m)}
                          className="hover:text-emerald-900 dark:hover:text-white ml-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Connected Vault Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Linked Clinical Records
              </h3>
              <Link
                to="/patient/timeline"
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                View Full Timeline <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Visits</span>
                  <Calendar className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {upcomingAppointments.length}
                </div>
                <Link to="/patient/appointments" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline block">
                  Check slots & tickets &rarr;
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prescriptions</span>
                  <Pill className="w-4 h-4 text-teal-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {prescriptions.length}
                </div>
                <Link to="/patient/prescriptions" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline block">
                  View dosages & advice &rarr;
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnostic Reports</span>
                  <FileText className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {reports.length}
                </div>
                <Link to="/patient/reports" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline block">
                  AI analysis & records &rarr;
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
