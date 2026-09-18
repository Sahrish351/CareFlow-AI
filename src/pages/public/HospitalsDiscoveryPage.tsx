import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Search, 
  Filter, 
  ShieldAlert, 
  Calendar, 
  ArrowRight, 
  ExternalLink,
  CheckCircle2,
  Users,
  Sparkles,
  Scale,
  Activity
} from 'lucide-react';
import { Hospital } from '../../types';
import { dbService } from '../../services/dbService';
import { AppointmentWizardModal } from '../../components/booking/AppointmentWizardModal';
import { HospitalComparisonModal } from '../../components/comparison/HospitalComparisonModal';

export const HospitalsDiscoveryPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Comparison State
  const [selectedForCompare, setSelectedForCompare] = useState<Hospital[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Booking Wizard Modal
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | undefined>(undefined);

  const toggleCompare = (hosp: Hospital) => {
    if (selectedForCompare.some(h => h.id === hosp.id)) {
      setSelectedForCompare(prev => prev.filter(h => h.id !== hosp.id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare up to 3 hospitals at a time.');
        return;
      }
      setSelectedForCompare(prev => [...prev, hosp]);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await dbService.getHospitals();
        setHospitals(data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const cities = ['All', 'Lahore', 'Islamabad', 'Rawalpindi', 'Karachi'];

  const filteredHospitals = hospitals.filter(h => {
    const matchesCity = selectedCity === 'All' || h.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch = !searchQuery || 
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              CareFlow<span className="text-teal-600">.ai</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/doctors"
              className="text-xs font-semibold text-slate-600 hover:text-teal-600 hidden sm:block"
            >
              Browse Doctors
            </Link>
            <Link
              to="/services"
              className="text-xs font-semibold text-slate-600 hover:text-teal-600 hidden sm:block"
            >
              23+ Specialties
            </Link>
            <button
              onClick={() => {
                setSelectedHospitalId(undefined);
                setWizardOpen(true);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pakistan Reference Network</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Explore Reference Hospitals & Medical Centers
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Connected multi-hospital directory offering outpatient clinical specialty wards, emergency resuscitation units, and real-time appointment scheduling.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200/90 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospitals by name, city, or medical keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-hidden font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCity === city
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Hospitals Listing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Showing {filteredHospitals.length} Reference Hospitals
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Hospital Photo */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={hosp.hero_image || hosp.thumbnail_image}
                    alt={hosp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span>{hosp.city}, Pakistan</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Verified
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-3">
                  <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">
                    {hosp.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {hosp.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{hosp.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="font-semibold text-rose-700">24/7 ER: {hosp.emergency_phone || '+92 (42) 3574-8899'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500">{hosp.opening_hours || 'Open 24/7'}</span>
                    </div>
                  </div>

                  {/* Facilities Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(hosp.facilities || ['Emergency', 'MRI / CT', 'Pharmacy']).slice(0, 3).map((fac, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/hospital/${hosp.id}`}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <label className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedForCompare.some(h => h.id === hosp.id)}
                      onChange={() => toggleCompare(hosp)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                    />
                    <span>Compare</span>
                  </label>
                </div>

                <button
                  onClick={() => {
                    setSelectedHospitalId(hosp.id);
                    setWizardOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  Book at Hospital
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Comparison Drawer */}
      {selectedForCompare.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-800 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="font-bold">{selectedForCompare.length} Hospitals Selected for Evaluation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareModalOpen(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Side-by-Side</span>
            </button>
            <button
              onClick={() => setSelectedForCompare([])}
              className="text-xs text-slate-400 hover:text-white transition px-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Hospital Comparison Modal */}
      <HospitalComparisonModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        hospitals={selectedForCompare}
        onSelectHospital={(hosp) => {
          setSelectedHospitalId(hosp.id);
          setWizardOpen(true);
        }}
      />

      {/* Guided Booking Wizard Modal */}
      {wizardOpen && (
        <AppointmentWizardModal
          initialHospitalId={selectedHospitalId}
          onClose={() => {
            setWizardOpen(false);
            setSelectedHospitalId(undefined);
          }}
          onSuccess={(result) => {
            console.log('Booked successfully:', result);
          }}
        />
      )}
    </div>
  );
};

