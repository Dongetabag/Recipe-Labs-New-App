import React from 'react';
import { MOCK_CAMPAIGNS } from '../constants.tsx';
import { Mail, Plus, TrendingUp, BarChart2, Pause, Play, Trash2 } from 'lucide-react';

const CampaignsModule: React.FC = () => {
  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-orbitron">Campaign sequences</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-black font-bold text-sm rounded-lg hover:scale-105 transition-all">
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_CAMPAIGNS.map((campaign) => (
          <div key={campaign.id} className="glass p-5 rounded-2xl border-white/5 flex items-center justify-between group hover:border-brand-gold/30 transition-all">
            <div className="flex items-center gap-6 flex-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${campaign.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-gray-500'}`}>
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{campaign.name}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${campaign.status === 'active' ? 'border-green-500/50 text-green-500 bg-green-500/5' : 'border-gray-500/50 text-gray-500'}`}>
                    {campaign.status}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {campaign.sent} Sent
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12 px-12">
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Open Rate</p>
                <p className="text-xl font-bold text-white">{campaign.openRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Click Rate</p>
                <p className="text-xl font-bold text-brand-gold">{campaign.clickRate}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="View Analytics">
                <BarChart2 className="w-5 h-5" />
              </button>
              {campaign.status === 'active' ? (
                <button className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/5 rounded-lg transition-all" title="Pause">
                  <Pause className="w-5 h-5" />
                </button>
              ) : (
                <button className="p-2 text-brand-gold hover:bg-brand-gold/5 rounded-lg transition-all" title="Play">
                  <Play className="w-5 h-5" />
                </button>
              )}
              <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all" title="Delete">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="glass p-6 rounded-2xl">
          <p className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest">Global Deliverability</p>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-white font-orbitron">99.2%</span>
            <span className="text-xs text-green-500 font-bold mb-1">+0.4% this month</span>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl">
          <p className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest">Total Replies</p>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-white font-orbitron">482</span>
            <span className="text-xs text-brand-gold font-bold mb-1">24 new leads</span>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl">
          <p className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest">Active Sequences</p>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-white font-orbitron">8</span>
            <span className="text-xs text-gray-500 font-bold mb-1">Cap: 20</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsModule;