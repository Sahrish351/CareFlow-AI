import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { Doctor, Department, Hospital } from '../../types';
import { BookingModal } from '../../components/appointments/BookingModal';
import { 
  Search, 
  Stethoscope, 
  Building, 
  Award, 
  Calendar, 
  Clock, 
  Filter, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const DoctorDiscoveryPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedHospital, setSelectedHospital] = useState<string>('all');

  // Booking Modal State
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docs, depts, hosps] = await Promise.all([
        dbService.getDoctors(),
        dbService.getDepartments(),
        dbService.getHospitals()
      ]);
      setDoctors(docs);
      setDepartments(depts);
      setHospitals(hosps);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    let match = true;
    if (selectedSpecialty !== 'all' && doc.specialty.toLowerCase() !== selectedSpecialty.toLowerCase()) {
      match = false;
    }
    if (selectedHospital !== 'all' && doc.hospital_id !== selectedHospital) {
      match = false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (doc.profile?.full_name || '').toLowerCase();
      const spec = doc.specialty.toLowerCase();
      const bio = (doc.bio || '').toLowerCase();
      if (!name.includes(q) && !spec.includes(q) && !bio.includes(q)) {
        match = false;
      }
    }
    return match;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-teal-600" />
            Find Doctors & Specialists
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse verified hospital physicians, view real available slots, and book consultations.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialty, or condition..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Hospital Filter */}
          <div className="md:w-64">
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="all">All Hospitals & Clinics</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedSpecialty('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedSpecialty === 'all'
                ? 'bg-teal-600 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            All Specialties ({doctors.length})
          </button>
          {departments.map(dept => (
            <button
              key={dept.id}
              onClick={() => setSelectedSpecialty(dept.name)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedSpecialty.toLowerCase() === dept.name.toLowerCase()
                  ? 'bg-teal-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="w-14 h-14 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No doctors match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try resetting your filters or searching for another medical specialty.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialty('all');
              setSelectedHospital('all');
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map(doctor => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3.5">
                  <img
                    src={doctor.profile?.avatar_url || `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150`}
                    alt={doctor.profile?.full_name || 'Doctor'}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-teal-700 transition-colors">
                      {doctor.profile?.full_name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                        <Stethoscope className="w-3 h-3" />
                        {doctor.specialty}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 truncate">
                      <Building className="w-3 h-3 shrink-0" />
                      <span className="truncate">{doctor.hospital?.name}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {doctor.bio}
                </p>
              </div>

              <div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mb-3.5">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{doctor.experience_years} yrs exp</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Fee</span>
                    <span className="font-bold text-slate-900 text-xs">${doctor.consultation_fee}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDoctorForBooking(doctor)}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-teal-600 text-teal-800 hover:text-white border border-teal-200 hover:border-teal-600 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 group/btn"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onSuccess={() => {
            setSelectedDoctorForBooking(null);
          }}
        />
      )}
    </div>
  );
};

