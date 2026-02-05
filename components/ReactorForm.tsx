
import React, { useState } from 'react';
import { X, Save, Database, Map, Layout, Zap, Droplet, Box, Calendar } from 'lucide-react';
import { Reactor } from '../types';

interface ReactorFormProps {
  initialReactor: Reactor | null;
  onClose: () => void;
  onSubmit: (reactor: Reactor) => void;
}

const CAPACITY_RANGES = ["0-500L", "500-1000L", "1000-2000L", "2000L+"];
const MOC_OPTIONS = ["SS316", "SS316L", "Glass Lined", "Hastelloy", "Carbon Steel"];
const AGITATOR_OPTIONS = ["Anchor", "Propeller", "Turbine", "Magnetic", "Rushton", "Paddle"];

export const ReactorForm: React.FC<ReactorFormProps> = ({ 
  initialReactor, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<Reactor>(initialReactor || {
    serialNo: '',
    plantName: '',
    blockName: '',
    maxCapacityLiters: 1000,
    capacityRange: '500-1000L',
    moc: 'SS316',
    agitatorType: 'Anchor',
    commissionDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.serialNo) newErrors.serialNo = "Serial Number is required";
    if (!formData.plantName) newErrors.plantName = "Plant Name is required";
    if (!formData.blockName) newErrors.blockName = "Block Name is required";
    if (formData.maxCapacityLiters <= 0) newErrors.maxCapacityLiters = "Capacity must be positive";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-10 bg-slate-50 border-b border-slate-100">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {initialReactor ? 'Edit Reactor Unit' : 'Configure New Reactor'}
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Define technical specs and location parameters.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <Database size={12} className="mr-2" /> Reactor Serial No
              </label>
              <input 
                type="text" 
                required
                disabled={!!initialReactor}
                value={formData.serialNo}
                onChange={e => setFormData({...formData, serialNo: e.target.value})}
                placeholder="e.g. R-105"
                className={`w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none ${errors.serialNo ? 'border-rose-400 ring-4 ring-rose-50' : ''}`}
              />
              {errors.serialNo && <p className="text-rose-500 text-[10px] font-bold uppercase">{errors.serialNo}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <Calendar size={12} className="mr-2" /> Commission Date
              </label>
              <input 
                type="date" 
                required
                value={formData.commissionDate}
                onChange={e => setFormData({...formData, commissionDate: e.target.value})}
                className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <Map size={12} className="mr-2" /> Plant Name
              </label>
              <input 
                type="text" required
                value={formData.plantName}
                onChange={e => setFormData({...formData, plantName: e.target.value})}
                placeholder="Main Site A"
                className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <Layout size={12} className="mr-2" /> Block Name
              </label>
              <input 
                type="text" required
                value={formData.blockName}
                onChange={e => setFormData({...formData, blockName: e.target.value})}
                placeholder="Block 4"
                className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Specs Section */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <Box size={12} className="mr-2" /> Max Capacity (L)
              </label>
              <input 
                type="number" required
                value={formData.maxCapacityLiters}
                onChange={e => setFormData({...formData, maxCapacityLiters: parseInt(e.target.value) || 0})}
                className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Capacity Range Category</label>
              <select 
                value={formData.capacityRange}
                onChange={e => setFormData({...formData, capacityRange: e.target.value})}
                className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              >
                {CAPACITY_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <Droplet size={12} className="mr-2" /> MOC (Material)
              </label>
              <select 
                value={formData.moc}
                onChange={e => setFormData({...formData, moc: e.target.value})}
                className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              >
                {MOC_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <Zap size={12} className="mr-2" /> Agitator Type
              </label>
              <select 
                value={formData.agitatorType}
                onChange={e => setFormData({...formData, agitatorType: e.target.value})}
                className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              >
                {AGITATOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Additional Technical Notes</label>
            <textarea 
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Technical observations or requirements..."
              className="w-full rounded-2xl border-slate-200 bg-slate-50 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
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
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl shadow-2xl shadow-blue-600/30 transition-all transform active:scale-95 flex items-center"
          >
            <Save size={18} className="mr-2" /> 
            {initialReactor ? 'Update Asset' : 'Commit to Master'}
          </button>
        </div>
      </div>
    </div>
  );
};
