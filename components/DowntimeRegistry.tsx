
import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit2, 
  XCircle, 
  Search, 
  Filter, 
  Wrench, 
  Droplet, 
  Activity, 
  Clock,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Downtime, Reactor, Booking, DowntimeType } from '../types';
import { DowntimeForm } from './DowntimeForm';
import { format, isAfter } from 'date-fns';

interface DowntimeRegistryProps {
  downtimes: Downtime[];
  reactors: Reactor[];
  bookings: Booking[];
  onAddDowntime: (downtime: Downtime) => void;
  onUpdateDowntime: (downtime: Downtime) => void;
  onCancelDowntime: (id: string) => void;
}

export const DowntimeRegistry: React.FC<DowntimeRegistryProps> = ({ 
  downtimes, 
  reactors, 
  bookings,
  onAddDowntime, 
  onUpdateDowntime, 
  onCancelDowntime 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDowntime, setEditingDowntime] = useState<Downtime | null>(null);

  const filteredDowntimes = downtimes.filter(d => 
    d.reactorSerialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.type.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.startDateTime.getTime() - a.startDateTime.getTime());

  const handleEdit = (downtime: Downtime) => {
    setEditingDowntime(downtime);
    setIsFormOpen(true);
  };

  const getDowntimeIcon = (type: DowntimeType) => {
    switch (type) {
      case DowntimeType.MAINTENANCE: return <Wrench size={14} className="text-rose-500" />;
      case DowntimeType.CLEANING: return <Droplet size={14} className="text-blue-500" />;
      case DowntimeType.CALIBRATION: return <Activity size={14} className="text-amber-500" />;
      case DowntimeType.BREAKDOWN: return <XCircle size={14} className="text-rose-600" />;
      default: return <Clock size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Downtime Registry</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Schedule and manage reactor maintenance windows.</p>
        </div>
        <button 
          onClick={() => { setEditingDowntime(null); setIsFormOpen(true); }}
          className="flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-rose-600/20 transition-all transform active:scale-95"
        >
          <Plus size={20} />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/30">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2.5 w-full max-w-md focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by Reactor or Reason..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all">
              <Filter size={16} />
              <span>Status</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-50">
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reactor Unit</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type & Reason</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheduled Window</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDowntimes.map((downtime) => (
                <tr key={downtime.id} className={`hover:bg-slate-50/50 group transition-colors ${downtime.isCancelled ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold text-xs">
                        {downtime.reactorSerialNo.split('-')[1]}
                      </div>
                      <span className="font-bold text-slate-800">{downtime.reactorSerialNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-tight">
                        <span className="mr-2">{getDowntimeIcon(downtime.type)}</span>
                        {downtime.type}
                      </div>
                      <div className="text-xs font-medium text-slate-400 max-w-xs truncate">{downtime.reason}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-700">
                        {format(downtime.startDateTime, 'MMM d, HH:mm')}
                      </div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        to {format(downtime.endDateTime, 'MMM d, HH:mm')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {downtime.isCancelled ? (
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cancelled</span>
                    ) : isAfter(new Date(), downtime.endDateTime) ? (
                      <span className="px-3 py-1 bg-green-50 rounded-full text-[10px] font-bold text-green-600 uppercase tracking-widest">Completed</span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-50 rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-widest">Scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end space-x-2">
                      {!downtime.isCancelled && !isAfter(new Date(), downtime.endDateTime) && (
                        <>
                          <button 
                            onClick={() => handleEdit(downtime)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Reschedule"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if(confirm('Cancel this maintenance window?')) onCancelDowntime(downtime.id);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Cancel Maintenance"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDowntimes.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
              <Info size={48} strokeWidth={1} className="mb-4" />
              <p className="font-bold">No maintenance windows recorded</p>
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <DowntimeForm 
          initialDowntime={editingDowntime}
          reactors={reactors}
          bookings={bookings}
          allDowntimes={downtimes}
          onClose={() => setIsFormOpen(false)} 
          onSubmit={(data) => {
            if (editingDowntime) {
              onUpdateDowntime(data);
            } else {
              onAddDowntime(data);
            }
            setIsFormOpen(false);
          }}
        />
      )}
    </div>
  );
};
