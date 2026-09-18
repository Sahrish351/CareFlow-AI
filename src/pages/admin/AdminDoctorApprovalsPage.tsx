import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  UserCheck, 
  XCircle, 
  CheckCircle2, 
  Building2, 
  Stethoscope, 
  Clock, 
  FileText, 
  Search, 
  AlertCircle,
  GraduationCap,
  Award,
  Globe2,
  ArrowLeft
} from 'lucide-react';
import { Doctor, Hospital } from '../../types';
import { dbService } from '../../services/dbService';

export const AdminDoctorApprovalsPage: React.FC = () => {
  const [pendingDoctors, setPendingDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pending, hosps] = await Promise.all([
        dbService.getPendingDoctors(),
        dbService.getHospitals()
      ]);
      setPendingDoctors(pending);
      setHospitals(hosps);
    } catch (err) {
      console.error('Error loading pending doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (doc: Doctor) => {
    try {
      await dbService.approveDoctor(doc.id);
      setActionSuccess(`Approved ${doc.profile?.full_name || 'Physician'}. They are now published to the public directory.`);
      await loadData();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err?.message || 'Could not approve physician.');
    }
  };

  const handleReject = async (doc: Doctor) => {
    if (!confirm(`Are you sure you want to reject the application for ${doc.profile?.full_name}?`)) return;
    try {
      await dbService.rejectDoctor(doc.id);
      setActionSuccess(`Application for ${doc.profile?.full_name || 'Physician'} was rejected and removed.`);
      await loadData();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err?.message || 'Could not reject physician.');
    }
  };

  const filteredPending = pendingDoctors.filter(doc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (doc.profile?.full_name || '').toLowerCase();
    const spec = doc.specialty.toLowerCase();
    const hosp = (doc.hospital?.name || '').toLowerCase();
    return name.includes(q) || spec.includes(q) || hosp.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/dashboard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              Doctor Credentialing & Approvals
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-8">
            Review and verify physician qualifications and license credentials before publishing to the live patient directory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {pendingDoctors.length} Pending Review
          </span>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter pending applicants by doctor name, specialty, or hospital..."
          className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Loading pending applications...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPending.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Queue is All Caught Up!</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            There are currently no doctor credentialing applications pending review. All registered physicians are verified and active.
          </p>
          <Link
            to="/admin/doctors"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
          >
            <Stethoscope className="w-4 h-4" />
            View Active Doctors Roster
          </Link>
        </div>
      )}

      {/* Pending Doctors List */}
      {!loading && filteredPending.length > 0 && (
        <div className="space-y-4">
          {filteredPending.map(doc => {
            const hospital = hospitals.find(h => h.id === doc.hospital_id);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition p-6 space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.profile?.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'}
                      alt={doc.profile?.full_name || 'Doctor'}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">
                          {doc.profile?.full_name || 'Dr. Medical Specialist'}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                          Pending Verification
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[11px] font-bold">
                          {doc.specialty}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {hospital?.name || doc.hospital?.name || 'CareFlow Network'} ({hospital?.city || 'Regional'})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          {doc.experience_years} Years Experience
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                          {(doc.languages || ['English', 'Urdu']).join(', ')}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => handleReject(doc)}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(doc)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Approve Credentials</span>
                    </button>
                  </div>
                </div>

                {/* Details section */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Qualifications & Background</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {doc.education || 'MBBS, Clinical Residency, Board Certified'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Clinical Bio & Scope</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {doc.bio || 'General clinical consultant applying for hospital staff appointment.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

