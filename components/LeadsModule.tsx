import React, { useState } from 'react';
import { MOCK_LEADS } from '../constants.tsx';
import { Filter, Search, Plus, MoreHorizontal, User, Globe, Mail, TrendingUp } from 'lucide-react';
import { LeadStatus } from '../types.ts';

const STATUS_COLUMNS: { id: LeadStatus; label: string }[] = [
  { id: 'new', label: 'New Leads' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
];

const LeadsModule: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-orbitron">Lead Pipeline</h2>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-white/5 rounded-lg border border-white/10">
            <button 
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'kanban' ? 'bg-brand-gold text-black' : 'text-gray-500 hover:text-white'}`}
            >
              Kanban
            </button>
            <button 
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'list' ? 'bg-brand-gold text-black' : 'text-gray-500 hover:text-white'}`}
            >
              Table
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-black font-bold text-sm rounded-lg hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-6 overflow-x-auto pb-4 h-full scrollbar-hide">
          {STATUS_COLUMNS.map((col) => (
            <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest">{col.label}</h3>
                </div>
                <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  {MOCK_LEADS.filter(l => l.status === col.id).length}
                </span>
              </div>
              
              <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                {MOCK_LEADS.filter(l => l.status === col.id).map(lead => (
                  <div key={lead.id} className="glass p-5 rounded-2xl border-white/10 hover:border-brand-gold/30 cursor-grab active:cursor-grabbing transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-gold font-bold">
                        {lead.company[0]}
                      </div>
                      <button className="text-gray-600 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                    
                    <h4 className="text-sm font-bold text-white truncate">{lead.company}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{lead.name}</p>
                    
                    <div className="mt-4 flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Globe className="w-3 h-3 text-brand-gold" /> {lead.website}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Mail className="w-3 h-3 text-brand-gold" /> {lead.email}
                       </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-[10px] font-bold text-white">{lead.score}% Score</span>
                       </div>
                       <span className="text-xs font-bold text-brand-gold">${lead.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                <button className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-[10px] font-bold text-gray-600 hover:text-brand-gold hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all uppercase tracking-[0.2em]">
                  Drop Lead Here
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border-white/10">
           <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">
                 <tr>
                    <th className="px-6 py-4">Lead Info</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {MOCK_LEADS.map(lead => (
                   <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-gold font-bold">
                                {lead.company[0]}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-white">{lead.company}</p>
                               <p className="text-xs text-gray-500">{lead.name}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                            {lead.status}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-gold" style={{ width: `${lead.score}%` }}></div>
                         </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-sm text-white">
                         ${lead.value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="p-2 text-gray-600 hover:text-brand-gold transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default LeadsModule;