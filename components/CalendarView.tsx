
import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  eachDayOfInterval, 
  isWithinInterval, 
  addWeeks, 
  subWeeks,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Filter, Info, Plus, Trash2 } from 'lucide-react';
import { Reactor, Booking, Downtime, BookingStatus } from '../types';

interface CalendarViewProps {
  reactors: Reactor[];
  bookings: Booking[];
  downtimes: Downtime[];
  onAddBooking: (reactorId: string, date: Date) => void;
  onDeleteBooking: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ reactors, bookings, downtimes, onAddBooking, onDeleteBooking }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterBlock, setFilterBlock] = useState<string>('All');
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  const blocks = useMemo(() => ['All', ...new Set(reactors.map(r => r.blockName))], [reactors]);
  
  const filteredReactors = useMemo(() => 
    filterBlock === 'All' ? reactors : reactors.filter(r => r.blockName === filterBlock),
  [reactors, filterBlock]);

  const getEventsForReactorAndDay = (reactorId: string, day: Date) => {
    const dayBookings = bookings.filter(b => 
      b.reactorSerialNo === reactorId && 
      b.status !== BookingStatus.CANCELLED &&
      isWithinInterval(day, { start: startOfDay(b.startDateTime), end: endOfDay(b.endDateTime) })
    );

    const dayDowntimes = downtimes.filter(d => 
      d.reactorSerialNo === reactorId && 
      !d.isCancelled &&
      isWithinInterval(day, { start: startOfDay(d.startDateTime), end: endOfDay(d.endDateTime) })
    );

    return { dayBookings, dayDowntimes };
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-slate-800">Reactor Schedule</h2>
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-1 hover:bg-white rounded shadow-sm"><ChevronLeft size={20}/></button>
            <span className="px-3 font-medium text-sm text-slate-600">
              {format(weekStart, 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
            </span>
            <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-1 hover:bg-white rounded shadow-sm"><ChevronRight size={20}/></button>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1 border border-blue-200 rounded-md hover:bg-blue-50"
          >
            Today
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span> Actual</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-amber-400 rounded-full mr-1"></span> Proposed</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-rose-500 rounded-full mr-1"></span> Maintenance</div>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
              className="text-sm border-none focus:ring-0 cursor-pointer text-slate-700 font-medium"
            >
              {blocks.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full border-collapse table-fixed">
          <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-48 p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">Reactor / Block</th>
              {weekDays.map(day => (
                <th key={day.toString()} className={`p-3 text-center border-r border-slate-200 ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}>
                  <div className="text-xs text-slate-500">{format(day, 'EEE')}</div>
                  <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-800'}`}>{format(day, 'd')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReactors.map(reactor => (
              <tr key={reactor.serialNo} className="hover:bg-slate-50 transition-colors group">
                <td className="p-3 border-r border-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                  <div className="font-semibold text-slate-800 text-sm">{reactor.serialNo}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">{reactor.blockName} • {reactor.maxCapacityLiters}L</div>
                </td>
                {weekDays.map(day => {
                  const { dayBookings, dayDowntimes } = getEventsForReactorAndDay(reactor.serialNo, day);
                  return (
                    <td 
                      key={day.toString()} 
                      className="p-1 border-r border-slate-100 h-24 relative align-top"
                    >
                      <button 
                        onClick={() => onAddBooking(reactor.serialNo, day)}
                        className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center bg-blue-50/50 transition-opacity z-0"
                      >
                        <Plus size={16} className="text-blue-600" />
                      </button>
                      
                      <div className="space-y-1 relative z-10">
                        {dayDowntimes.map(d => (
                          <div key={d.id} className="bg-rose-500 text-white text-[10px] p-1 rounded shadow-sm font-medium truncate flex items-center">
                            <Info size={10} className="mr-1 flex-shrink-0" />
                            {d.type}
                          </div>
                        ))}
                        {dayBookings.map(b => (
                          <div 
                            key={b.id} 
                            className={`${b.status === BookingStatus.ACTUAL ? 'bg-blue-500' : 'bg-amber-400'} text-white text-[10px] p-1 rounded shadow-sm font-medium truncate flex justify-between items-center group/evt`}
                            title={`${b.productName} - ${b.team}`}
                          >
                            <span className="truncate">{b.productName} ({b.status === BookingStatus.ACTUAL ? 'A' : 'P'})</span>
                            {b.status === BookingStatus.PROPOSED && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteBooking(b.id); }}
                                className="opacity-0 group-hover/evt:opacity-100 transition-opacity p-0.5 hover:bg-white/20 rounded"
                              >
                                <Trash2 size={8} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
