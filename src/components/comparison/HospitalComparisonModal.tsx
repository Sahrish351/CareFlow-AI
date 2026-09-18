import React from 'react';
import { Hospital } from '../../types';
import { X, Check, Building2, MapPin, Phone, Clock, Stethoscope, ShieldCheck, ArrowRight } from 'lucide-react';

interface HospitalComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: Hospital[];
  onSelectHospital: (hosp: Hospital) => void;
}

export const HospitalComparisonModal: React.FC<HospitalComparisonModalProps> = ({
  isOpen,
  onClose,
  hospitals,
  onSelectHospital,
}) => {
  if (!isOpen || hospitals.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-1">
              <Building2 className="w-3.5 h-3.5" />
              Side-by-Side Facility Evaluation
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Comparing {hospitals.length} Healthcare Centers
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review emergency capabilities, diagnostics, specialties, and nearest availability.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-x-auto overflow-y-auto">
          <div className={`grid gap-6 ${hospitals.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} min-w-[650px]`}>
            {hospitals.map((hosp, idx) => (
              <div
                key={hosp.id}
                className={`flex flex-col rounded-xl p-5 border transition-all ${
                  idx === 0
                    ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-300 dark:border-teal-700 shadow-sm'
                    : 'bg-gray-50/70 dark:bg-gray-800/40 border-gray-200/80 dark:border-gray-700/60'
                }`}
              >
                {idx === 0 && (
                  <div className="mb-3 px-2.5 py-1 rounded-full bg-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 w-fit shadow-xs">
                    <span>✨ Best Match For Search</span>
                  </div>
                )}

                {/* Image & Header */}
                <div className="relative h-36 rounded-lg overflow-hidden mb-4 bg-gray-200 dark:bg-gray-700">
                  <img
                    src={hosp.hero_image || hosp.thumbnail_image}
                    alt={hosp.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </div>
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Demo Reference
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-1">
                  {hosp.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <span className="truncate">{hosp.city} — {hosp.address}</span>
                </div>

                {/* Metrics Breakdown */}
                <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-300 flex-1 border-t border-gray-200/60 dark:border-gray-700/60 pt-4">
                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 font-medium">Next Slot</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded inline-block">
                      {hosp.next_available_slot || 'Today, Available'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 font-medium">Emergency Desk</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">
                      {hosp.emergency_phone || '+92 51 8464646'} (24/7)
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 font-medium">Specialist Doctors</span>
                    <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span>{hosp.doctor_count || 12}+ Registered Attending Specialists</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 font-medium">Opening Hours</span>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{hosp.opening_hours}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 font-medium">Emergency Line</span>
                    <div className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{hosp.emergency_phone || hosp.phone}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-1.5 font-medium">Key Clinical Facilities</span>
                    <div className="flex flex-wrap gap-1">
                      {hosp.facilities?.map((f, i) => (
                        <span
                          key={i}
                          className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 text-[10px] font-medium"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-5 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                  <button
                    onClick={() => {
                      onSelectHospital(hosp);
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20"
                  >
                    <span>Select & View Doctors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex items-center justify-between text-xs text-gray-500">
          <span>Tip: You can select any facility to view its specific department roster and book directly.</span>
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

