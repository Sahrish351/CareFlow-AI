import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { Appointment, AppointmentStatus } from '../../types';
import { SlidersHorizontal, Search, Calendar, Stethoscope, User, MapPin } from 'lucide-react';

export const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const loadAppointments = async () => {
    try {
      const data = await dbService.getAppointments('admin', 'admin');
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusChange = async (aptId: string, newStatus: AppointmentStatus) => {
    await dbService.updateAppointmentStatus(aptId, newStatus);
    await loadAppointments();
  };

  const filtered = appointments.filter(a => {
    let match = true;
    if (statusFilter !== 'all' && a.status !== statusFilter) match = false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const patient = (a.patient?.full_name || '').toLowerCase();
      const doc = (a.doctor?.profile?.full_name || '').toLowerCase();
      const reason = (a.reason || '').toLowerCase();
      if (!patient.includes(q) && !doc.includes(q) && !reason.includes(q)) match = false;
    }
    return match;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-600" />
            Hospital Appointments Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System-wide audit trail of all patient consultations, clinical status, and queue states.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by patient name, doctor, or symptom notes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <div className="md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Appointments Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Assigned Doctor</th>
                <th className="py-3 px-4">Department & Clinic</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Queue Position</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(apt => (
                <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.patient?.full_name || 'Ahmed Khan'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>{apt.doctor?.profile?.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700 block">{apt.department?.name}</span>
                      <span className="text-[10px] text-slate-400">{apt.hospital?.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {apt.appointment_date} at {apt.start_time.slice(0, 5)}
                  </td>
                  <td className="py-3.5 px-4">
                    {apt.queue ? (
                      <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 font-bold text-[11px]">
                        #{apt.queue.position} ({apt.queue.patients_ahead} ahead)
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      apt.status === 'completed' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                      apt.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                    </select>
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

