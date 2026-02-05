
import React, { useState, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  LayoutDashboard, 
  Settings, 
  Database, 
  PlusCircle, 
  Wrench,
  Search,
  Bell,
  ChevronDown,
  Activity,
  ShieldCheck,
  X
} from 'lucide-react';
import { ViewType, Reactor, Booking, Downtime, BookingStatus } from './types';
import { mockReactors, mockBookings, mockDowntimes } from './mockData';
import { CalendarView } from './components/CalendarView';
import { Dashboard } from './components/Dashboard';
import { BookingForm } from './components/BookingForm';
import { ReactorManagement } from './components/ReactorManagement';
import { DowntimeRegistry } from './components/DowntimeRegistry';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('CALENDAR');
  const [reactors, setReactors] = useState<Reactor[]>(mockReactors);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [downtimes, setDowntimes] = useState<Downtime[]>(mockDowntimes);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedReactor, setSelectedReactor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Global Search Filtering
  const filteredReactors = useMemo(() => 
    reactors.filter(r => 
      r.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.blockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.moc.toLowerCase().includes(searchTerm.toLowerCase())
    ), [reactors, searchTerm]);

  const filteredBookings = useMemo(() => 
    bookings.filter(b => 
      b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.reactorSerialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ), [bookings, searchTerm]);

  const filteredDowntimes = useMemo(() => 
    downtimes.filter(d => 
      d.reactorSerialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.reason.toLowerCase().includes(searchTerm.toLowerCase())
    ), [downtimes, searchTerm]);

  const handleAddBooking = useCallback((reactorId: string, date: Date) => {
    setSelectedReactor(reactorId);
    setSelectedDate(date);
    setShowBookingForm(true);
  }, []);

  const submitNewBooking = useCallback((newBooking: Booking) => {
    // Audit log simulation
    console.info(`[Backend] POST /api/booking - Status: ${newBooking.status}`);
    setBookings(prev => [...prev, newBooking]);
  }, []);

  // Rule 8 & 9: Deletion restrictions
  const handleDeleteBooking = useCallback((id: string) => {
    const target = bookings.find(b => b.id === id);
    if (!target) return;

    if (target.status === BookingStatus.ACTUAL) {
      alert("Compliance Error: An 'Actual Work Log' is immutable and cannot be deleted from the audit trail.");
      return;
    }

    if (confirm("Are you sure you want to delete this 'Proposed Booking'?")) {
      console.info(`[Backend] DELETE /api/booking/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  }, [bookings]);

  // Reactor Management Handlers
  const handleAddReactor = useCallback((newReactor: Reactor) => {
    setReactors(prev => {
      if (prev.some(r => r.serialNo === newReactor.serialNo)) {
        alert("Reactor serial number must be unique.");
        return prev;
      }
      return [...prev, newReactor];
    });
  }, []);

  const handleUpdateReactor = useCallback((updatedReactor: Reactor) => {
    setReactors(prev => prev.map(r => r.serialNo === updatedReactor.serialNo ? updatedReactor : r));
  }, []);

  const handleDeleteReactor = useCallback((serialNo: string) => {
    setReactors(prev => prev.filter(r => r.serialNo !== serialNo));
  }, []);

  // Downtime Registry Handlers
  const handleAddDowntime = useCallback((newDowntime: Downtime) => {
    setDowntimes(prev => [...prev, newDowntime]);
  }, []);

  const handleUpdateDowntime = useCallback((updatedDowntime: Downtime) => {
    setDowntimes(prev => prev.map(d => d.id === updatedDowntime.id ? updatedDowntime : d));
  }, []);

  const handleCancelDowntime = useCallback((id: string) => {
    setDowntimes(prev => prev.map(d => d.id === id ? { ...d, isCancelled: true } : d));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Activity className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter leading-none">ReactoPlan</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Enterprise .NET + React</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4">
          <NavItem 
            icon={<Calendar size={20} />} 
            label="Manufacturing Scheduler" 
            active={activeView === 'CALENDAR'} 
            onClick={() => setActiveView('CALENDAR')} 
          />
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Occupancy Dashboard"
            active={activeView === 'DASHBOARD'} 
            onClick={() => setActiveView('DASHBOARD')} 
          />
          <div className="pt-8 pb-4 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Asset Management</div>
          <NavItem 
            icon={<Database size={20} />} 
            label="Reactor Inventory" 
            active={activeView === 'REACTORS'} 
            onClick={() => setActiveView('REACTORS')} 
          />
          <NavItem 
            icon={<Wrench size={20} />} 
            label="Downtime Registry" 
            active={activeView === 'DOWNTIME'} 
            onClick={() => setActiveView('DOWNTIME')} 
          />
        </nav>

        <div className="p-6">
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-800">
             <div className="flex items-center text-blue-400 mb-2">
                <ShieldCheck size={14} className="mr-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Compliance Active</span>
             </div>
             <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
               Synchronized with .NET Web API. Proposed bookings are deletable; Actual logs are protected.
             </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-full border-2 border-slate-700 p-0.5 bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-white text-xs">
               AS
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">Aditya Sharma</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Plant Operations</span>
            </div>
          </div>
          <ChevronDown size={14} className="text-slate-500 cursor-pointer" />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-40">
          <div className="flex items-center bg-slate-50 rounded-2xl px-5 py-2.5 w-[450px] border border-slate-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400 mr-3" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Query reactor ID, products, or batch logs..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium"
            />
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
               <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <button onClick={() => setShowSettings(true)} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                <Settings size={20} />
              </button>
            </div>
            <div className="h-8 w-px bg-slate-100"></div>
            <button 
              onClick={() => {
                setSelectedReactor(reactors[0]?.serialNo || '');
                setSelectedDate(new Date());
                setShowBookingForm(true);
              }}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-blue-600/30 transition-all"
            >
              <PlusCircle size={18} />
              <span>Create New Booking</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-10 custom-scrollbar bg-slate-50/50">
          {activeView === 'CALENDAR' && (
            <CalendarView 
              reactors={filteredReactors} 
              bookings={filteredBookings} 
              downtimes={downtimes} 
              onAddBooking={handleAddBooking}
              onDeleteBooking={handleDeleteBooking}
            />
          )}
          
          {activeView === 'DASHBOARD' && (
            <Dashboard 
              reactors={filteredReactors}
              bookings={filteredBookings}
              downtimes={downtimes}
            />
          )}

          {activeView === 'REACTORS' && (
            <ReactorManagement 
              reactors={filteredReactors}
              onAddReactor={handleAddReactor}
              onUpdateReactor={handleUpdateReactor}
              onDeleteReactor={handleDeleteReactor}
            />
          )}

          {activeView === 'DOWNTIME' && (
            <DowntimeRegistry 
              downtimes={filteredDowntimes}
              reactors={filteredReactors}
              bookings={filteredBookings}
              onAddDowntime={handleAddDowntime}
              onUpdateDowntime={handleUpdateDowntime}
              onCancelDowntime={handleCancelDowntime}
            />
          )}
        </div>
      </main>

      {showNotifications && (
        <div className="absolute top-24 right-48 z-[100] w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in slide-in-from-top-4">
           <div className="p-6 border-b border-slate-50 flex justify-between items-center">
             <h4 className="font-bold">Notifications</h4>
             <button onClick={() => setShowNotifications(false)}><X size={16}/></button>
           </div>
           <div className="p-4 space-y-3">
             <p className="text-xs text-slate-500">System connected to .NET backend. All logs active.</p>
           </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black">Preferences</h3>
                <button onClick={() => setShowSettings(false)}><X/></button>
              </div>
              <p className="text-slate-500 text-sm mb-6">Global system parameters and API configurations.</p>
              <button onClick={() => setShowSettings(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Close</button>
           </div>
        </div>
      )}

      {showBookingForm && (
        <BookingForm 
          reactorSerialNo={selectedReactor}
          initialDate={selectedDate}
          onClose={() => setShowBookingForm(false)}
          onSubmit={submitNewBooking}
          reactors={reactors}
          allBookings={bookings}
          allDowntimes={downtimes}
        />
      )}
    </div>
  );
};

const NavItem: React.FC<{icon: React.ReactNode, label: string, active: boolean, onClick: () => void}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all ${
      active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-500 hover:text-slate-100'
    }`}
  >
    {icon}
    <span className="text-xs font-bold tracking-tight">{label}</span>
  </button>
);

export default App;
