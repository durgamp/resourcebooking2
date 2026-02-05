
import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Box, 
  Droplet, 
  Zap,
  Info
} from 'lucide-react';
import { Reactor } from '../types';
import { ReactorForm } from './ReactorForm';

interface ReactorManagementProps {
  reactors: Reactor[];
  onAddReactor: (reactor: Reactor) => void;
  onUpdateReactor: (reactor: Reactor) => void;
  onDeleteReactor: (serialNo: string) => void;
}

export const ReactorManagement: React.FC<ReactorManagementProps> = ({ 
  reactors, 
  onAddReactor, 
  onUpdateReactor, 
  onDeleteReactor 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReactor, setEditingReactor] = useState<Reactor | null>(null);

  const filteredReactors = reactors.filter(r => 
    r.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.blockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.moc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (reactor: Reactor) => {
    setEditingReactor(reactor);
    setIsFormOpen(true);
  };

  const handleDelete = (serialNo: string) => {
    if (window.confirm(`Are you sure you want to remove Reactor ${serialNo} from the inventory? This action cannot be undone.`)) {
      onDeleteReactor(serialNo);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reactor Inventory</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage plant master data and technical specifications.</p>
        </div>
        <button 
          onClick={() => { setEditingReactor(null); setIsFormOpen(true); }}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all transform active:scale-95"
        >
          <Plus size={20} />
          <span>Add New Reactor</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/30">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2.5 w-full max-w-md focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Filter by Serial, Plant, Block or MOC..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all">
              <Filter size={16} />
              <span>Filter Range</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all">
              <ArrowUpDown size={16} />
              <span>Sort Units</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-50">
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serial No</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specifications</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agitator</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">MOC</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReactors.map((reactor) => (
                <tr key={reactor.serialNo} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">
                        {reactor.serialNo.split('-')[1] || reactor.serialNo.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{reactor.serialNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-700">{reactor.plantName}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{reactor.blockName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm font-bold text-slate-700">
                        <Box size={14} className="mr-1.5 text-blue-500" />
                        {reactor.maxCapacityLiters}L
                      </div>
                      <div className="inline-block px-2 py-0.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500">
                        {reactor.capacityRange}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center text-sm font-bold text-slate-700">
                      <Zap size={14} className="mr-1.5 text-amber-500" />
                      {reactor.agitatorType}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center text-sm font-bold text-slate-700">
                      <Droplet size={14} className="mr-1.5 text-indigo-500" />
                      {reactor.moc}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(reactor)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Details"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(reactor.serialNo)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Reactor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredReactors.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
              <Info size={48} strokeWidth={1} className="mb-4" />
              <p className="font-bold">No reactors found matching your criteria</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-600 text-sm font-bold"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <ReactorForm 
          initialReactor={editingReactor} 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={(data) => {
            if (editingReactor) {
              onUpdateReactor(data);
            } else {
              onAddReactor(data);
            }
            setIsFormOpen(false);
          }}
        />
      )}
    </div>
  );
};
