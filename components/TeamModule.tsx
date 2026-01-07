import React from 'react';
import { MOCK_TEAM, MOCK_ACTIVITY } from '../constants.tsx';
import { UserPlus, MoreHorizontal, Activity, CheckCircle2, Clock, ShieldCheck, User } from 'lucide-react';

const TeamModule: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-fadeIn h-full flex flex-col bg-[#050505]">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white font-orbitron tracking-tighter uppercase">Team Collaboration</h2>
          <p className="text-sm text-gray-500 mt-1">Manage workloads, roles, and real-time agency activity.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-black font-bold text-sm rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-gold/20">
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Members List */}
        <div className="xl:col-span-2 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_TEAM.map((member) => (
              <div key={member.id} className="glass p-6 rounded-3xl border-white/5 hover:border-brand-gold/30 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-gold font-bold text-xl relative">
                      {member.avatar}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1a1a1a] ${member.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500'}`}></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-gold transition-colors">{member.name}</h3>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">{member.role}</p>
                    </div>
                  </div>
                  <button className="text-gray-600 hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
                </div>

                <div className="mt-8 space-y-3 relative z-10">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                    <span>Active Workload</span>
                    <span className={member.workload > 80 ? 'text-red-400' : 'text-brand-gold'}>{member.workload}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${member.workload > 80 ? 'bg-red-500' : 'bg-brand-gold'}`}
                      style={{ width: `${member.workload}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4 relative z-10">
                   <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold" /> 12 Tasks
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 text-brand-gold" /> 4 Ongoing
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team Tasks Section */}
          <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Active Collaborative Tasks</h3>
                <span className="text-[10px] font-mono text-gray-500">6 PENDING</span>
             </div>
             <div className="space-y-3">
                {[
                  { title: 'Brand Identity Refresh - Nexus IT', owner: 'Elena R.', priority: 'High' },
                  { title: 'Campaign Strategy V2 - Apex Corp', owner: 'Sarah C.', priority: 'Medium' },
                  { title: 'AI Copy Generation - GreenLife', owner: 'James S.', priority: 'High' }
                ].map((task, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-gold/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-brand-gold'}`}></div>
                       <div>
                          <p className="text-xs font-bold text-white">{task.title}</p>
                          <p className="text-[10px] text-gray-500 uppercase mt-0.5">Assigned to {task.owner}</p>
                       </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 uppercase tracking-widest">Due tomorrow</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Panel: Activity Log */}
        <div className="glass rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col bg-black/40">
          <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Activity className="w-4 h-4 text-brand-gold" />
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Agency Pulse</h3>
            </div>
            <ShieldCheck className="w-4 h-4 text-green-500/50" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {MOCK_ACTIVITY.map((activity) => (
              <div key={activity.id} className="relative pl-6 border-l border-white/10">
                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-brand-gold border-2 border-[#111111]"></div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-300">
                    <span className="font-bold text-white">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-[10px] font-bold text-brand-gold uppercase tracking-tighter">Target: {activity.target}</p>
                  <p className="text-[10px] text-gray-600 font-mono">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white/5 border-t border-white/5">
             <div className="p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em]">Network Status</p>
                <p className="text-[9px] text-gray-500 font-mono mt-1">ENCRYPTED COLLABORATION ACTIVE</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamModule;