import React from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar, Download } from 'lucide-react';

const ReportsModule: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-orbitron uppercase tracking-widest">Business Intelligence</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time performance metrics across all active modules</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-lg hover:bg-white/10 transition-all">
            <Calendar className="w-4 h-4" /> Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-black font-bold text-sm rounded-lg hover:scale-105 transition-all">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* KPI Charts */}
        <div className="glass p-6 rounded-3xl border-white/5 lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-gold" /> Pipeline Growth
            </h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/10"></div>
              ))}
            </div>
          </div>
          <div className="h-64 flex items-end gap-2 pb-2">
            {[40, 60, 45, 90, 70, 85, 100, 75, 60, 80, 95, 110].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-brand-gold/5 to-brand-gold/40 rounded-t-lg transition-all hover:to-brand-gold hover:scale-x-110 cursor-pointer relative group" style={{ height: `${h}%` }}>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-gold text-black text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                   ${h}k
                 </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-gold" /> Lead Sources
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Organic Search', value: 45, color: 'bg-brand-gold' },
              { label: 'Paid Ads', value: 30, color: 'bg-white/20' },
              { label: 'Referrals', value: 15, color: 'bg-white/10' },
              { label: 'Social', value: 10, color: 'bg-white/5' },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-bold">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 mt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">4.2%</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-brand-gold/20 border-t-brand-gold flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-gold" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;