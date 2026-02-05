
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Calendar, User, Package, Layers, Activity, AlertCircle, Database } from 'lucide-react';
import { Team, BookingStatus, Reactor, Booking, Downtime } from '../types';
import { checkConflict } from '../mockData';

interface BookingFormProps {
  reactorSerialNo: string;
  initialDate: Date;
  onClose: () => void;
  onSubmit: (booking: Booking) => void;
  reactors: Reactor[];
  allBookings: Booking[];
  allDowntimes: Downtime[];
}

export const BookingForm: React.FC<BookingFormProps> = ({ 
  reactorSerialNo, 
  initialDate, 
  onClose, 
  onSubmit,
  reactors,
  allBookings,
  allDowntimes
}) => {
  const [formData, setFormData] = useState({
    reactorSerialNo: reactorSerialNo || (reactors.length > 0 ? reactors[0].serialNo : ''),
    team: Team.CDS,
    productName: '',
    stage: '',
    batchNumber: '',
    operation: '',
    startDateTime: format(initialDate, "yyyy-MM-dd'T'08:00"),
    endDateTime: format(initialDate, "yyyy-MM-dd'T'20:00"),
    status: BookingStatus.PROPOSED,
    requestedByEmail: ''
  });

  const [error, setError] = useState<string | null>(null);

  // Validate on field change for better UX
  useEffect(() => {
    if (formData.startDateTime && formData.endDateTime && formData.reactorSerialNo) {
       const start = new Date(formData.startDateTime);
       const end = new Date(formData.endDateTime);
       if (end <= start) {
         setError("End time must be after start time");
         return;
       }
       
       // Explicit Downtime Check for the selected reactor
       const conflict = checkConflict(
         formData.reactorSerialNo,
         start,
         end,
         allBookings,
         allDowntimes
       );
       
       if (conflict) {
         setError(conflict);
       } else {
         setError(null);
       }
    }
  }, [formData.startDateTime, formData.endDateTime, formData.reactorSerialNo, allBookings, allDowntimes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);

    // Rule: Prevent more than 1 Actual log for overlapping intervals
    if (formData.status === BookingStatus.ACTUAL) {
      const existingActual = allBookings.find(b => 
        b.reactorSerialNo === formData.reactorSerialNo && 
        b.status === BookingStatus.ACTUAL &&
        ((start >= b.startDateTime && start < b.endDateTime) || 
         (end > b.startDateTime && end <= b.endDateTime) ||
         (start <= b.startDateTime && end >= b.endDateTime))
      );
      
      if (existingActual) {
        setError(`Security Violation: An 'Actual Work Log' already exists for this period.`);
        return;
      }
    }

    const finalConflictCheck = checkConflict(
      formData.reactorSerialNo,
      start,
      end,
      allBookings,
      allDowntimes
    );

    if (finalConflictCheck) {
      setError(finalConflictCheck);
      return;
    }

    const newBooking: Booking = {
      ...formData,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
      startDateTime: start,
      endDateTime: end,
      createdAt: new Date(),
      updatedAt: new Date(),
      team: formData.team as Team,
      status: formData.status as BookingStatus
    };

    onSubmit(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-8 bg-slate-50 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Reactor Booking</h2>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-slate-400 text-xs">Secure Transaction Log | Audit Active</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {error && (
            <div className="flex items-start space-x-3 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center">
              <Database size={14} className="mr-2 text-slate-400" /> Select Reactor
            </label>
            <select 
              value={formData.reactorSerialNo}
              onChange={e => setFormData({...formData, reactorSerialNo: e.target.value})}
              className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            >
              {reactors.map(r => (
                <option key={r.serialNo} value={r.serialNo}>
                  {r.serialNo} ({r.blockName} - {r.maxCapacityLiters}L)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Managing Team</label>
              <select 
                value={formData.team}
                onChange={e => setFormData({...formData, team: e.target.value as Team})}
                className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              >
                {Object.values(Team).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Workflow Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as BookingStatus})}
                className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              >
                <option value={BookingStatus.PROPOSED}>Proposed Booking</option>
                <option value={BookingStatus.ACTUAL}>Actual Usage Log</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center">
              <Package size={14} className="mr-2 text-slate-400" /> Chemical / Product Name
            </label>
            <input 
              type="text" 
              required
              maxLength={100}
              value={formData.productName}
              onChange={e => setFormData({...formData, productName: e.target.value})}
              placeholder="e.g. Paracetamol Batch A"
              className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center">
                <Layers size={14} className="mr-2 text-slate-400" /> Process Stage
              </label>
              <input 
                type="text" required
                value={formData.stage}
                onChange={e => setFormData({...formData, stage: e.target.value})}
                placeholder="Intermediate Stage"
                className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Batch Identifier</label>
              <input 
                type="text" required
                value={formData.batchNumber}
                onChange={e => setFormData({...formData, batchNumber: e.target.value})}
                placeholder="BT-9999"
                className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center">
                <Calendar size={14} className="mr-2 text-slate-400" /> Start Date & Time
              </label>
              <input 
                type="datetime-local" required
                value={formData.startDateTime}
                onChange={e => setFormData({...formData, startDateTime: e.target.value})}
                className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center">
                <Calendar size={14} className="mr-2 text-slate-400" /> End Date & Time
              </label>
              <input 
                type="datetime-local" required
                value={formData.endDateTime}
                onChange={e => setFormData({...formData, endDateTime: e.target.value})}
                className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center">
              <User size={14} className="mr-2 text-slate-400" /> Requester ID (Email)
            </label>
            <input 
              type="email" required
              value={formData.requestedByEmail}
              onChange={e => setFormData({...formData, requestedByEmail: e.target.value})}
              placeholder="e.sharma@pharma.com"
              className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </form>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end items-center space-x-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!!error}
            className={`px-8 py-3 text-white text-sm font-bold rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center ${error ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'}`}
          >
            <Activity size={18} className="mr-2" /> Commit Booking
          </button>
        </div>
      </div>
    </div>
  );
};
