import React from 'react';
import { MOCK_CLIENTS } from '../constants.tsx';
import { Plus, MoreVertical, Shield, ExternalLink, Activity } from 'lucide-react';

const ClientsModule: React.FC = () => {
  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-orbitron">Client Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-black font-bold text-sm rounded-lg hover:scale-105 transition-all shadow-lg shadow-brand-gold/20">
          <Plus className="w-4 h-4" /> New Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CLIENTS.map((client) => (
          <div key={client.id} className="glass p-6 rounded-2xl border-white/5 hover:border-brand-gold/20 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-gold/10 transition-all"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-gold font-bold text-lg">
                  {client.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{client.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{client.industry}</p>
                </div>
              </div>
              <button className="text-gray-600 hover:text-white"><MoreVertical className="w-5 h-5" /></button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Health Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${client.healthScore === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm font-bold text-white uppercase">{client.healthScore}</span>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Total Value</p>
                <p className="text-sm font-bold text-brand-gold mt-1">${client.totalValue.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Activity className="w-4 h-4 text-brand-gold" />
                <span>{client.activeProjects} Active Projects</span>
              </div>
              <button className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                Portal <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsModule;