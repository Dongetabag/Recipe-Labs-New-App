import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types.ts';
import { Sparkles, TrendingUp, Users, DollarSign, MousePointer2, ArrowUpRight } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface DashboardHomeProps {
  user: UserProfile;
  onNavigate?: (id: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ user, onNavigate }) => {
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateBriefing = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Generate a short, professional "Morning Briefing" for ${user.name}, an agency ${user.role}. Mention it's a great day to scale their agency's core competency: ${user.agencyCoreCompetency}. Use a futuristic, motivating tone. Keep it to 3 bullet points.`,
        });
        setBriefing(response.text || 'Welcome back to the Lab.');
      } catch (err) {
        setBriefing('Systems online. High conversion probability detected in your current pipeline.');
      } finally {
        setLoading(false);
      }
    };
    generateBriefing();
  }, [user]);

  const stats = [
    { label: 'Total Leads', value: '2,482', change: '+12.5%', icon: <Users className="w-5 h-5 text-brand-gold" /> },
    { label: 'Pipeline Value', value: '$84.2k', change: '+8.2%', icon: <DollarSign className="w-5 h-5 text-brand-gold" /> },
    { label: 'Active Campaigns', value: '14', change: '+2', icon: <TrendingUp className="w-5 h-5 text-brand-gold" /> },
    { label: 'Conversion Rate', value: '4.2%', change: '+0.5%', icon: <MousePointer2 className="w-5 h-5 text-brand-gold" /> },
  ];

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white font-orbitron">Systems Overview</h2>
            <p className="text-sm text-gray-500 font-mono">2025-05-24 • 09:42 AM</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="glass p-5 rounded-2xl hover:border-brand-gold/30 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-brand-gold/10 rounded-lg group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <span className="text-xs font-bold text-brand-gold flex items-center gap-0.5">
                    {stat.change} <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1 font-orbitron">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-gold p-6 rounded-2xl border-brand-gold/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 group-hover:scale-[1.7] transition-transform duration-700">
               <Sparkles className="w-24 h-24 text-brand-gold" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
                <h3 className="text-sm font-bold text-brand-gold uppercase tracking-[0.2em]">AI Intelligence Briefing</h3>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-white/5 animate-pulse rounded"></div>
                  <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded"></div>
                </div>
              ) : (
                <div className="text-gray-200 text-sm leading-relaxed space-y-2 whitespace-pre-line font-medium">
                  {briefing}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 space-y-6">
          <h3 className="text-lg font-bold text-white font-orbitron">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate?.('campaigns')}
              className="w-full flex items-center gap-4 p-4 bg-brand-gold text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Launch New Campaign</span>
            </button>
            <button 
              onClick={() => onNavigate?.('leads')}
              className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
            >
              <Users className="w-5 h-5 text-brand-gold" />
              <span>Add Priority Lead</span>
            </button>
            <button 
              onClick={() => onNavigate?.('reports')}
              className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
            >
              <DollarSign className="w-5 h-5 text-brand-gold" />
              <span>Financial Overview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;