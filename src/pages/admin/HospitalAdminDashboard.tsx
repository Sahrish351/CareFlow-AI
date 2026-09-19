import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { INITIAL_HOSPITALS, INITIAL_DOCTORS } from '../../services/mockData';
import { 
  Building2, 
  Users, 
  Stethoscope, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Search, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export const HospitalAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Find assigned hospital or fallback to first reference hospital
  const assignedHospital = INITIAL_HOSPITALS.find(h => h.id === user?.hospital_id) || INITIAL_HOSPITALS[0];

  // Doctors belonging to this hospital
  const hospitalDoctors = INITIAL_DOCTORS.filter(d => d.hospital_id === assignedHospital.id || d.hospital?.id === assignedHospital.id);

  const [activeTab, setActiveTab] = useState<'roster' | 'departments' | 'metrics'>('roster');
  const [searchDoc, setSearchDoc] = useState('');

  const filteredDoctors = (hospitalDoctors.length > 0 ? hospitalDoctors : INITIAL_DOCTORS.slice(0, 4)).filter(d => 
    (d.profile?.full_name || '').toLowerCase().includes(searchDoc.toLowerCase()) ||
    (d.specialty || '').toLowerCase().includes(searchDoc.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Hospital Admin Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-teal-800/30">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Hospital Administration Portal · {assignedHospital.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {assignedHospital.name} Operations Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Authorized administrator console for clinical roster management, department capacity, and facility-scoped operational compliance.
          </p>
        </div>
      </div>

      {/* Facility Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital Specialists</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{filteredDoctors.length || 8}</p>
          <span className="text-[11px] text-teal-600 font-medium">On active duty</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Departments</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{assignedHospital.departments?.length || 6}</p>
          <span className="text-[11px] text-purple-600 font-medium">Accredited specialties</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Appointments Today</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">42</p>
          <span className="text-[11px] text-blue-600 font-medium">Confirmed bookings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operating Capacity</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">92%</p>
          <span className="text-[11px] text-emerald-600 font-medium">Normal load</span>
        </div>
      </div>

      {/* Roster & Departments Management Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Hospital Staff Specialists & Roster</h2>
            <p className="text-xs text-slate-500">Access limited strictly to doctors practicing at {assignedHospital.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search specialist..."
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Doctor List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Doctor Name</th>
                <th className="px-6 py-3.5">Specialty</th>
                <th className="px-6 py-3.5">Experience</th>
                <th className="px-6 py-3.5">Consultation Fee</th>
                <th className="px-6 py-3.5">Rating</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{doc.profile?.full_name || 'Dr. Specialist'}</div>
                    <div className="text-[11px] text-slate-400">{doc.profile?.email || 'doctor@hospital.careflow.ai'}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-teal-700">{doc.specialty}</td>
                  <td className="px-6 py-4 text-slate-600">{doc.experience_years} Years</td>
                  <td className="px-6 py-4 font-bold text-slate-700">PKR {doc.consultation_fee_pkr || 2500}</td>
                  <td className="px-6 py-4 font-bold text-amber-600">★ {doc.rating || 4.9}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Active On Duty
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
