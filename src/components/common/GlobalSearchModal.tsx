import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Building2, 
  Stethoscope, 
  HeartPulse, 
  Calendar, 
  FileText, 
  Users, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { dbService } from '../../services/dbService';
import { Hospital, Doctor, CareCategory } from '../../types';
import { CARE_CATEGORIES } from '../../services/mockData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoctor?: (doc: Doctor) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectDoctor,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      dbService.getHospitals().then(setHospitals);
      dbService.getDoctors().then(setDoctors);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Filter entities
  const matchingHospitals = trimmed
    ? hospitals.filter(
        h =>
          h.name.toLowerCase().includes(trimmed) ||
          h.city.toLowerCase().includes(trimmed) ||
          h.facilities?.some(f => f.toLowerCase().includes(trimmed))
      ).slice(0, 3)
    : [];

  const matchingDoctors = trimmed
    ? doctors.filter(
        d =>
          d.profile?.full_name?.toLowerCase().includes(trimmed) ||
          d.specialty.toLowerCase().includes(trimmed) ||
          d.hospital?.name?.toLowerCase().includes(trimmed)
      ).slice(0, 4)
    : [];

  const matchingCategories = trimmed
    ? CARE_CATEGORIES.filter(
        c =>
          c.name.toLowerCase().includes(trimmed) ||
          c.specialty.toLowerCase().includes(trimmed) ||
          c.keywords.some(k => k.toLowerCase().includes(trimmed))
      ).slice(0, 3)
    : [];

  const quickActions = [
    { label: 'Book Doctor Appointment', path: '/hospitals', icon: Calendar },
    { label: 'Explore Regional Hospitals', path: '/hospitals', icon: Building2 },
    { label: 'Browse Specialist Directory', path: '/doctors', icon: Stethoscope },
    { label: 'My Family Profiles', path: '/patient/family', icon: Users },
    { label: 'Digital Prescriptions', path: '/patient/prescriptions', icon: FileText },
  ].filter(a => !trimmed || a.label.toLowerCase().includes(trimmed));

  const totalResults =
    matchingDoctors.length +
    matchingHospitals.length +
    matchingCategories.length +
    (trimmed ? quickActions.slice(0, 2).length : quickActions.length);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-gray-900/60 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctors, hospitals, specialties, or symptoms (English / Roman Urdu)..."
            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="p-4 overflow-y-auto space-y-4 text-sm">
          {/* Doctors Match */}
          {matchingDoctors.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                Doctors & Specialists
              </div>
              <div className="space-y-1">
                {matchingDoctors.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      if (onSelectDoctor) {
                        onSelectDoctor(doc);
                      } else {
                        navigate('/doctors');
                      }
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-left transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        <img
                          src={doc.profile?.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80'}
                          alt={doc.profile?.full_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                          {doc.profile?.full_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.specialty} • {doc.hospital?.name || 'CareFlow Hospital'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                      Book <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hospitals Match */}
          {matchingHospitals.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Hospitals & Medical Centers
              </div>
              <div className="space-y-1">
                {matchingHospitals.map((hosp) => (
                  <button
                    key={hosp.id}
                    onClick={() => {
                      navigate(`/hospitals/${hosp.id}`);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-left transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        <img
                          src={hosp.thumbnail_image}
                          alt={hosp.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                          {hosp.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {hosp.city} • {hosp.next_available_slot}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Specialties / Care Categories Match */}
          {matchingCategories.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
                Care Specialties & Departments
              </div>
              <div className="space-y-1">
                {matchingCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      navigate(`/hospitals?specialty=${encodeURIComponent(cat.name)}`);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-left transition group"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                        {cat.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {cat.specialty} — {cat.description.slice(0, 75)}...
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Quick Navigation
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        navigate(action.path);
                        onClose();
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800/60 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 text-left transition"
                    >
                      <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="font-medium text-gray-800 dark:text-gray-200 text-xs">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {trimmed && totalResults === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="font-medium">No direct matches found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">
                Try searching by specialty (e.g. Cardiology, Orthopedics) or Roman Urdu symptoms (e.g. kamar dard).
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-xs text-gray-400">
          <span>Search CareFlow AI global directory</span>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono text-[10px]">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

