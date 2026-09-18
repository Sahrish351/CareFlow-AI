import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../../services/dbService';
import { 
  Building2, 
  Users, 
  Stethoscope, 
  Calendar, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Activity,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';

const WEEKLY_DATA = [
  { day: 'Mon', appointments: 18, completed: 16 },
  { day: 'Tue', appointments: 24, completed: 22 },
  { day: 'Wed', appointments: 28, completed: 25 },
  { day: 'Thu', appointments: 32, completed: 30 },
  { day: 'Fri', appointments: 38, completed: 34 },
  { day: 'Sat', appointments: 20, completed: 19 },
  { day: 'Sun', appointments: 12, completed: 12 },
];

const DEPARTMENT_LOAD = [
  { name: 'Cardiology', patients: 45 },
  { name: 'Dermatology', patients: 38 },
  { name: 'Orthopedics', patients: 32 },
  { name: 'Pediatrics', patients: 28 },
  { name: 'Neurology', patients: 24 },
  { name: 'General Med', patients: 50 },
];

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [data, pending] = await Promise.all([
          dbService.getAdminMetrics(),
          dbService.getPendingDoctors()
        ]);
        setMetrics(data);
        setPendingCount(pending.length);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            Hospital System Operations Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Network oversight, department allocation, doctor capacity, and real-time clinical loads.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>All 5 Regional Hospitals Online</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Hospitals
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{metrics?.totalHospitals || 5}</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Regional Medical Hubs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Doctors
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{metrics?.totalDoctors || 15}</span>
            <Stethoscope className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Verified Specialists</span>
        </div>

        <Link
          to="/admin/approvals"
          className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-400 transition-all block group"
        >
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1 flex items-center justify-between">
            <span>Pending Approvals</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700">{pendingCount}</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">
            {pendingCount > 0 ? 'Action required' : 'All verified'}
          </span>
        </Link>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Consultations
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{metrics?.totalAppointments || 42}</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Recorded in database</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Current Queue Load
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-teal-700">{metrics?.waitingPatients || 2}</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Waiting in clinics</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Appointments Volume Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Patient Booking Volume</h3>
              <p className="text-[11px] text-slate-400">Total appointments vs completed visits</p>
            </div>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="appointments" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#colorAppointments)" />
                <Area type="monotone" dataKey="completed" stroke="#3B82F6" strokeWidth={2} fillOpacity={0.2} fill="#3B82F6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Load Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Patient Load</h3>
              <p className="text-[11px] text-slate-400">Monthly consultation volume by clinical unit</p>
            </div>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_LOAD} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                />
                <Bar dataKey="patients" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

