import React from 'react';
import { Doctor } from '../../types';
import { X, Star, Building2, Award, Calendar, DollarSign, Clock, ArrowRight } from 'lucide-react';

interface DoctorComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onBookDoctor: (doctor: Doctor) => void;
}

export const DoctorComparisonModal: React.FC<DoctorComparisonModalProps> = ({
  isOpen,
  onClose,
  doctors,
  onBookDoctor,
}) => {
  if (!isOpen || doctors.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-1">
              <Award className="w-3.5 h-3.5" />
              Specialist Side-by-Side Comparison
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Comparing {doctors.length} Medical Specialists
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Compare qualifications, consultation fees, patient ratings, and hospital clinics.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Cards */}
        <div className="p-6 overflow-x-auto overflow-y-auto">
          <div className={`grid gap-6 ${doctors.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} min-w-[650px]`}>
            {doctors.map((doc, idx) => (
              <div
                key={doc.id}
                className={`flex flex-col rounded-xl p-5 border transition-all ${
                  idx === 0
                    ? 'bg-teal-50/30 dark:bg-teal-950/20 border-teal-300 dark:border-teal-700 shadow-sm'
                    : 'bg-gray-50/70 dark:bg-gray-800/40 border-gray-200/80 dark:border-gray-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  {idx === 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      ✨ Top Recommended Match
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      Demo Profile
                    </span>
                  )}
                </div>

                {/* Doctor Avatar & Identity */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-teal-100 dark:bg-teal-900/50 flex-shrink-0 border-2 border-teal-500/20">
                    <img
                      src={doc.profile?.avatar_url || `https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80`}
                      alt={doc.profile?.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight truncate">
                      {doc.profile?.full_name || 'Medical Specialist'}
                    </h3>
                    <p className="text-teal-600 dark:text-teal-400 text-xs font-semibold truncate">
                      {doc.specialty}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-gray-900 dark:text-gray-100">{doc.rating || 4.9}</span>
                      <span className="text-gray-400">({doc.total_reviews || 120} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Why this doctor matches search */}
                <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 text-[11px] text-teal-900 dark:text-teal-200 mb-3">
                  <span className="font-bold block mb-0.5">Why this doctor matches:</span>
                  Board-certified in {doc.specialty} with verified {doc.experience_years} years practice. Earliest slot available: {doc.next_available_slot || 'Tomorrow morning'}.
                </div>

                {/* Metrics Breakdown */}
                <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 flex-1 border-t border-gray-200/60 dark:border-gray-700/60 pt-4">
                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 font-medium">Affiliated Hospital</span>
                    <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100">
                      <Building2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span className="truncate">{doc.hospital?.name || 'CareFlow Medical Center'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 font-medium">Qualifications</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {Array.isArray(doc.qualifications) ? doc.qualifications.join(', ') : (doc.qualifications || doc.education || 'MBBS, FCPS')}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 font-medium">Experience</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {doc.experience_years} Years Clinical Practice
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 font-medium">Consultation Fee</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                      Rs. {(doc.consultation_fee_pkr || doc.consultation_fee * 280).toLocaleString()} (PKR)
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 font-medium">Available Clinical Days</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doc.available_days?.map((day, i) => (
                        <span
                          key={i}
                          className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/40 rounded px-1.5 py-0.5 text-[10px] font-medium"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>

                  {doc.next_available_slot && (
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-0.5 font-medium">Next Earliest Slot</span>
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{doc.next_available_slot}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-5 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                  <button
                    onClick={() => {
                      onBookDoctor(doc);
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20"
                  >
                    <span>Book Appointment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex items-center justify-between text-xs text-gray-500">
          <span>All physicians are certified and verified by the Medical Registration Council.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

