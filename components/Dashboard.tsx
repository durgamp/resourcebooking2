
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, CheckCircle, ArrowLeft, Download, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Reactor, Booking, Downtime } from '../types';
import { calculateOccupancy } from '../mockData';
import { format, subMonths, startOfMonth } from 'date-fns';

interface DashboardProps {
  reactors: Reactor[];
  bookings: Booking[];
  downtimes: Downtime[];
}

export const Dashboard: React.FC<DashboardProps> = ({ reactors, bookings, downtimes }) => {
  // Chart 1 (Block/Reactor Density) State
  const [densityMonth, setDensityMonth] = useState(new Date());
  const [drillDownBlock, setDrillDownBlock] = useState<string | null>(null);

  // Chart 2 (Monthly Trend) State
  const [trendPlant, setTrendPlant] = useState<string>('All');
  const [trendBlock, setTrendBlock] = useState<string>('All');

  // Available months for filters (last 12 months)
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => subMonths(new Date(), i));
  }, []);

  // Filter Options for Trend Chart
  const plants = useMemo(() => ['All', ...new Set(reactors.map(r => r.plantName))], [reactors]);
  const blocksForTrend = useMemo(() => {
    const filtered = trendPlant === 'All' ? reactors : reactors.filter(r => r.plantName === trendPlant);
    return ['All', ...new Set(filtered.map(r => r.blockName))];
  }, [reactors, trendPlant]);

  // --- Logic for Chart 1: Operational Density by Block (or Reactor if drilled) ---
  const densityMetrics = useMemo(() => 
    calculateOccupancy(densityMonth, reactors, bookings, downtimes),
    [densityMonth, reactors, bookings, downtimes]
  );

  const blockChartData = useMemo(() => {
    if (drillDownBlock) {
      // Drilled down: Show individual reactors for the selected block
      return densityMetrics
        .filter(m => m.blockName === drillDownBlock)
        .map(m => ({
          name: m.reactorSerialNo,
          Proposed: Math.round(m.proposedPercent),
          Actual: Math.round(m.actualPercent)
        }));
    }

    // Default: Aggregate data by Block
    const grouped = densityMetrics.reduce((acc, curr) => {
      const bName = curr.blockName || 'Unknown';
      if (!acc[bName]) {
        acc[bName] = { name: bName, proposed: 0, actual: 0, count: 0 };
      }
      acc[bName].proposed += curr.proposedPercent;
      acc[bName].actual += curr.actualPercent;
      acc[bName].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((g: any) => ({
      name: g.name,
      Proposed: Math.round(g.proposed / g.count),
      Actual: Math.round(g.actual / g.count)
    }));
  }, [densityMetrics, drillDownBlock]);

  // --- Logic for Chart 2: Operational Density by Month (Trend) ---
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonth = subMonths(startOfMonth(new Date()), i);
      const reactorsInScope = reactors.filter(r => 
        (trendPlant === 'All' || r.plantName === trendPlant) &&
        (trendBlock === 'All' || r.blockName === trendBlock)
      );
      
      const monthMetrics = calculateOccupancy(targetMonth, reactorsInScope, bookings, downtimes);
      const avgActual = monthMetrics.length > 0 
        ? monthMetrics.reduce((sum, m) => sum + m.actualPercent, 0) / monthMetrics.length 
        : 0;
      const avgProposed = monthMetrics.length > 0 
        ? monthMetrics.reduce((sum, m) => sum + m.proposedPercent, 0) / monthMetrics.length 
        : 0;

      data.push({
        month: format(targetMonth, 'MMM yy'),
        Actual: Math.round(avgActual),
        Proposed: Math.round(avgProposed)
      });
    }
    return data;
  }, [reactors, bookings, downtimes, trendPlant, trendBlock]);

  const handleBarClick = (data: any) => {
    if (!drillDownBlock && data && data.name) {
      setDrillDownBlock(data.name);
    }
  };

  const exportReport = () => {
    const monthStr = format(densityMonth, 'MMM-yyyy');
    const headers = ["Month", "Reactor", "Block", "Actual %", "Proposed %", "Maint Hrs", "Avail Hrs"];
    const rows = densityMetrics.map(m => [
      monthStr,
      m.reactorSerialNo,
      m.blockName,
      m.actualPercent.toFixed(1),
      m.proposedPercent.toFixed(1),
      m.downtimeHours,
      m.availableHours
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Density_Report_${monthStr}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Current Month Avg. Actual" 
          value={`${Math.round(densityMetrics.reduce((a, b) => a + b.actualPercent, 0) / (densityMetrics.length || 1))}%`} 
          icon={<TrendingUp className="text-blue-500"/>}
          subtitle={format(densityMonth, 'MMMM yyyy')}
        />
        <StatCard 
          title="Current Month Avg. Proposed" 
          value={`${Math.round(densityMetrics.reduce((a, b) => a + b.proposedPercent, 0) / (densityMetrics.length || 1))}%`} 
          icon={<CheckCircle className="text-amber-500"/>}
          subtitle="Resource Forward Load"
        />
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Dashboard Period</span>
            <div className="text-xl font-black text-slate-800">{format(densityMonth, 'MMMM yyyy')}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <CalendarIcon size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Chart 1: Density by Block (Drillable) */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-3">
              {drillDownBlock && (
                <button onClick={() => setDrillDownBlock(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <ArrowLeft size={18} className="text-slate-600"/>
                </button>
              )}
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  {drillDownBlock ? `Reactors in ${drillDownBlock}` : "Operational Density by Block"}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                  {drillDownBlock ? "Individual reactor view" : "Click bar to drill down to reactors"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <CalendarIcon size={14} className="text-slate-400 ml-2" />
              <select 
                value={format(densityMonth, 'yyyy-MM')}
                onChange={(e) => {
                   const [y, m] = e.target.value.split('-');
                   setDensityMonth(new Date(parseInt(y), parseInt(m)-1, 1));
                }}
                className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-600 cursor-pointer pr-8"
              >
                {monthOptions.map(m => (
                  <option key={m.getTime()} value={format(m, 'yyyy-MM')}>
                    {format(m, 'MMM yyyy')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockChartData} barGap={8} onClick={(e) => e && e.activePayload && handleBarClick(e.activePayload[0].payload)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis unit="%" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 4}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} 
                />
                <Bar dataKey="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Proposed" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Operational Density by Month (Trend) */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800">Operational Density by Month</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">6-Month Historical Performance</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Filter size={12} className="text-slate-400 mr-2" />
                <select 
                  value={trendPlant}
                  onChange={(e) => { setTrendPlant(e.target.value); setTrendBlock('All'); }}
                  className="bg-transparent border-none focus:ring-0 text-[10px] font-bold text-slate-600 cursor-pointer"
                >
                  {plants.map(p => <option key={p} value={p}>{p === 'All' ? 'All Plants' : p}</option>)}
                </select>
              </div>
              <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <select 
                  value={trendBlock}
                  onChange={(e) => setTrendBlock(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-[10px] font-bold text-slate-600 cursor-pointer"
                >
                  {blocksForTrend.map(b => <option key={b} value={b}>{b === 'All' ? 'All Blocks' : b}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis unit="%" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} 
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold'}} />
                <Line type="monotone" dataKey="Actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Proposed" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, fill: '#fbbf24' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-800">Resource Efficiency Index</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Performance breakdown for {format(densityMonth, 'MMMM yyyy')}</p>
          </div>
          <button onClick={exportReport} className="flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
            Download CSV <Download size={14} className="ml-2"/>
          </button>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">
              <tr className="border-b border-slate-50">
                <th className="pb-4 text-left px-4">Reactor Unit</th>
                <th className="pb-4 text-left px-4">Block Location</th>
                <th className="pb-4 text-right px-4">Actual %</th>
                <th className="pb-4 text-right px-4">Proposed %</th>
                <th className="pb-4 text-right px-4">Maintenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {densityMetrics.sort((a,b) => b.actualPercent - a.actualPercent).map(m => (
                <tr key={m.reactorSerialNo} className="hover:bg-slate-50 group transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-800">{m.reactorSerialNo}</td>
                  <td className="py-4 px-4 text-slate-500 font-medium">{m.blockName}</td>
                  <td className="py-4 px-4 text-right font-black text-blue-600">{m.actualPercent.toFixed(1)}%</td>
                  <td className="py-4 px-4 text-right font-bold text-amber-500">{m.proposedPercent.toFixed(1)}%</td>
                  <td className="py-4 px-4 text-right text-slate-400">{m.downtimeHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string, value: string, icon: React.ReactNode, subtitle?: string}> = ({ title, value, icon, subtitle }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</span>
      <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
    </div>
    <div className="text-4xl font-black text-slate-800 mb-1">{value}</div>
    {subtitle && <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{subtitle}</div>}
  </div>
);
