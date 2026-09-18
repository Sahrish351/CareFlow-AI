import React, { useState } from 'react';
import { Calendar, Clock, Plus, Check, X, AlertCircle } from 'lucide-react';
import { STANDARD_TIME_SLOTS, getTodayDateString, getTomorrowDateString } from '../../services/mockData';

export const DoctorSchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [slots, setSlots] = useState<{ id: string; time: string; available: boolean }[]>([
    { id: '1', time: '09:00 AM - 09:30 AM', available: true },
    { id: '2', time: '09:30 AM - 10:00 AM', available: true },
    { id: '3', time: '10:00 AM - 10:30 AM', available: true },
    { id: '4', time: '10:30 AM - 11:00 AM', available: false }, // marked busy
    { id: '5', time: '11:00 AM - 11:30 AM', available: false }, // booked by Alexander
    { id: '6', time: '11:30 AM - 12:00 PM', available: true },
    { id: '7', time: '02:00 PM - 02:30 PM', available: true },
    { id: '8', time: '02:30 PM - 03:00 PM', available: true },
    { id: '9', time: '03:00 PM - 03:30 PM', available: true },
  ]);

  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const toggleSlotAvailability = (id: string) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, available: !s.available } : s));
    showSaveNotification();
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotLabel.trim()) return;
    setSlots(prev => [
      ...prev,
      { id: `slot-${Date.now()}`, time: newSlotLabel, available: true }
    ]);
    setNewSlotLabel('');
    showSaveNotification();
  };

  const showSaveNotification = () => {
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Doctor Schedule & Availability
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your active clinical hours, enable/disable appointment slots, and manage patient capacity.
          </p>
        </div>

        {isSavedNotice && (
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Availability updated successfully!</span>
          </div>
        )}
      </div>

      {/* Date Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Schedule Date:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(getTodayDateString())}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              selectedDate === getTodayDateString() ? 'bg-blue-50 border-blue-500 text-blue-800' : 'border-slate-200 text-slate-600'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(getTomorrowDateString())}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              selectedDate === getTomorrowDateString() ? 'bg-blue-50 border-blue-500 text-blue-800' : 'border-slate-200 text-slate-600'
            }`}
          >
            Tomorrow
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Slot Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Consultation Slots for {selectedDate}</h2>
          <span className="text-xs text-slate-400">Click any slot to toggle availability</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {slots.map(slot => (
            <div
              key={slot.id}
              onClick={() => toggleSlotAvailability(slot.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between ${
                slot.available
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/50'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 line-through'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${slot.available ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold">{slot.time}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                slot.available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {slot.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          ))}
        </div>

        {/* Add custom slot form */}
        <form onSubmit={handleAddSlot} className="pt-4 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={newSlotLabel}
            onChange={(e) => setNewSlotLabel(e.target.value)}
            placeholder="Add custom slot (e.g. 04:30 PM - 05:00 PM)"
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slot</span>
          </button>
        </form>
      </div>
    </div>
  );
};

