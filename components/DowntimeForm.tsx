
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, AlertCircle, Wrench, Info, User } from 'lucide-react';
import { Downtime, Reactor, Booking, DowntimeType, BookingStatus } from '../types';
import { format, isBefore, startOfToday, addHours } from 'date-fns';
import { checkConflict } from '../mockData';

interface DowntimeFormProps {
  initialDowntime: Downtime | null;
  reactors: Reactor[];
  bookings: Booking[];
  allDowntimes: Downtime[];
  onClose: () => void;
  onSubmit: (downtime: Downtime) => void;
}

export const DowntimeForm: React.FC<DowntimeFormProps> = ({ 
  initialDowntime, 
  reactors, 
  bookings,
  allDowntimes,
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    reactorSerialNo: initialDowntime?.reactorSerialNo || reactors[0]?.serialNo || '',
    type: initialDowntime?.type || DowntimeType.MAINTENANCE,
    reason: initialDowntime?.reason || '',
    startDateTime: format(initialDowntime?.startDateTime || addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
    endDateTime: format(initialDowntime?.endDateTime || addHours(new Date(), 5), "yyyy-MM-dd'T'HH:mm"),
    updatedByEmail: initialDowntime?.updatedByEmail || ''
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);

    // 1. Future Date Check
    if (isBefore(start, new Date())) {
      setError("Downtime must be scheduled in the future.");
      return;
    }

    if (isBefore(end, start)) {
      setError("End time must be after start time.");
      return;
    }

    // 2. Conflict Check with Bookings and other Downtimes
    const conflict = checkConflict(
      formData.reactorSerialNo,
      start,
      end,
      bookings,
      allDowntimes,
      initialDowntime?.id
    );

    if (conflict) {
      setError(conflict);
      return;
    }

    const submission: Downtime = {
      id: initialDowntime?.id || crypto.randomUUID(),
      reactorSerialNo: formData.reactorSerialNo,
      startDateTime: start,
      endDateTime: end,
      type: formData.type,
      reason: formData.reason,
      updatedByEmail: formData.updatedByEmail,
      updatedAt: new Date(),
      isCancelled: false
    };

    onSubmit(submission);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-10 bg-slate-50 border-b border-slate-100">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {initialDowntime ? 'Reschedule Maintenance' : 'Plan Plant Downtime'}
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">This will block reactor availability for the specified period.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {error && (
            <div className="flex items-start space-x-3 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Reactor</label>
              <select 
                value={formData.reactorSerialNo}
                onChange={e => setFormData({...formData, reactorSerialNo: e.target.value})}
                className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                required
              >
                {reactors.map(r => <option key={r.serialNo} value={r.serialNo}>{r.serialNo} ({r.blockName})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Downtime Category</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as DowntimeType})}
                className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                required
              >
                {Object.values(DowntimeType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
              <Info size={12} className="mr-2" /> Reason / Work Description
            </label>
            <input 
              type="text" 
              required
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
              placeholder="e.g. Annual HVAC validation or Agitator seal replacement"
              className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <Clock size={12} className="mr-2" /> Start Time
              </label>
              <input 
                type="datetime-local" required
                value={formData.startDateTime}
                onChange={e => setFormData({...formData, startDateTime: e.target.value})}
                className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <Clock size={12} className="mr-2" /> End Time
              </label>
              <input 
                type="datetime-local" required
                value={formData.endDateTime}
                onChange={e => setFormData({...formData, endDateTime: e.target.value})}
                className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
              <User size={12} className="mr-2" /> Maintenance Coordinator Email
            </label>
            <input 
              type="email" required
              value={formData.updatedByEmail}
              onChange={e => setFormData({...formData, updatedByEmail: e.target.value})}
              placeholder="coord@plant-maintenance.com"
              className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none transition-all"
            />
          </div>
        </form>

        <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end items-center space-x-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-3 text-sm font-black text-slate-500 hover:text-slate-800 transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleSubmit}
            className="px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-black rounded-2xl shadow-2xl shadow-rose-600/30 transition-all transform active:scale-95 flex items-center"
          >
            <Wrench size={18} className="mr-2" /> 
            {initialDowntime ? 'Reschedule Window' : 'Commit Maintenance'}
          </button>
        </div>
      </div>
    </div>
  );
};
