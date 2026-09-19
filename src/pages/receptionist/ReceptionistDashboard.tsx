import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { INITIAL_HOSPITALS } from '../../services/mockData';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Search, 
  Plus, 
  ArrowRight,
  Stethoscope,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface QueueItem {
  id: string;
  token: string;
  patientName: string;
  doctorName: string;
  department: string;
  time: string;
  status: 'waiting' | 'in_consultation' | 'completed';
}

export const ReceptionistDashboard: React.FC = () => {
  const { user } = useAuth();

  // Find assigned hospital or fallback to first reference hospital
  const assignedHospital = INITIAL_HOSPITALS.find(h => h.id === user?.hospital_id) || INITIAL_HOSPITALS[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'waiting' | 'in_consultation'>('all');

  const [queue, setQueue] = useState<QueueItem[]>([
    {
      id: 'q-1',
      token: 'A-101',
      patientName: 'Muhammad Hamza',
      doctorName: 'Dr. Ahmed Raza, FCPS',
      department: 'Cardiology',
      time: '09:30 AM',
      status: 'in_consultation'
    },
    {
      id: 'q-2',
      token: 'A-102',
      patientName: 'Zainab Bibi',
      doctorName: 'Dr. Ahmed Raza, FCPS',
      department: 'Cardiology',
      time: '10:00 AM',
      status: 'waiting'
    },
    {
      id: 'q-3',
      token: 'B-205',
      patientName: 'Ali Tariq',
      doctorName: 'Dr. Usman Ali, MRCP',
      department: 'Neurology',
      time: '10:15 AM',
      status: 'waiting'
    },
    {
      id: 'q-4',
      token: 'A-100',
      patientName: 'Fatima Zahra',
      doctorName: 'Dr. Ahmed Raza, FCPS',
      department: 'Cardiology',
      time: '09:00 AM',
      status: 'completed'
    }
  ]);

  const handleStatusChange = (id: string, newStatus: 'waiting' | 'in_consultation' | 'completed') => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const filteredQueue = queue.filter(item => {
    const matchesSearch = item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && item.status === activeTab;
  });

  const waitingCount = queue.filter(q => q.status === 'waiting').length;
  const inConsultCount = queue.filter(q => q.status === 'in_consultation').length;
  const completedCount = queue.filter(q => q.status === 'completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-teal-800/30">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Assigned Hospital: {assignedHospital.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Reception & Queue Operations Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage front-desk patient check-in, live queue routing, and hospital department token allocations.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waiting in Lobby</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{waitingCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">Ready for consultation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Consultation</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{inConsultCount}</p>
          <span className="text-[11px] text-blue-600 font-medium">Inside doctor chambers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Visits</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{completedCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Discharged today</span>
        </div>
      </div>

      {/* Main Queue Management Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Hospital Daily Patient Queue</h2>
            <p className="text-xs text-slate-500">Live tokens scoped strictly to {assignedHospital.name}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-48 sm:w-60"
              />
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg transition ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('waiting')}
                className={`px-3 py-1 rounded-lg transition ${activeTab === 'waiting' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
              >
                Waiting
              </button>
              <button
                onClick={() => setActiveTab('in_consultation')}
                className={`px-3 py-1 rounded-lg transition ${activeTab === 'in_consultation' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
              >
                In Chamber
              </button>
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Token</th>
                <th className="px-6 py-3.5">Patient</th>
                <th className="px-6 py-3.5">Assigned Specialist</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Slot Time</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-extrabold text-teal-700">{item.token}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{item.patientName}</td>
                  <td className="px-6 py-4 text-slate-600">{item.doctorName}</td>
                  <td className="px-6 py-4 text-slate-500">{item.department}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{item.time}</td>
                  <td className="px-6 py-4">
                    {item.status === 'waiting' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        Waiting
                      </span>
                    )}
                    {item.status === 'in_consultation' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                        In Chamber
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {item.status === 'waiting' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'in_consultation')}
                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        Call to Doctor
                      </button>
                    )}
                    {item.status === 'in_consultation' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'completed')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        Mark Done
                      </button>
                    )}
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
