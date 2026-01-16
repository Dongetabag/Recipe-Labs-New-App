import React from 'react';
import { Zap, Shield, CheckCircle2, ChevronRight, Slack, MessageSquare, Globe, Database } from 'lucide-react';

const IntegrationsModule: React.FC = () => {
  const integrations = [
    { name: 'Slack', desc: 'Real-time agency notifications and lead alerts.', icon: <Slack className="w-6 h-6 text-purple-400" />, status: 'Connected' },
    { name: 'HubSpot', desc: 'Sync leads and client CRM data automatically.', icon: <Database className="w-6 h-6 text-orange-400" />, status: 'Not Connected' },
    { name: 'Google Drive', desc: 'Direct asset storage and collaboration.', icon: <Globe className="w-6 h-6 text-blue-400" />, status: 'Connected' },
    { name: 'Notion', desc: 'Project documentation and agency wiki sync.', icon: <Shield className="w-6 h-6 text-white" />, status: 'Not Connected' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="max-w-4xl">
        <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron uppercase tracking-widest">Integrations Hub</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">Connect Recipe Labs to your existing workflow and synchronize data across all your agency platforms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl">
        {integrations.map((item) => (
          <div
            key={item.name}
            className="glass p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-white/5 flex gap-4 sm:gap-6 hover:border-brand-gold/30 active:scale-[0.99] transition-all cursor-pointer group touch-manipulation"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-all">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">{item.name}</h3>
                {item.status === 'Connected' ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" /> <span className="hidden xs:inline">{item.status}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-600 uppercase whitespace-nowrap">
                    {item.status}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 leading-relaxed line-clamp-2">{item.desc}</p>
              <button className="mt-3 sm:mt-4 flex items-center gap-1 text-xs font-bold text-brand-gold hover:underline active:scale-95 transition-transform touch-manipulation min-h-[44px] -ml-1 pl-1">
                Configure Settings <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-dashed border-white/10 max-w-5xl flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500">
          <Zap className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-white">Custom Webhooks & API</h3>
          <p className="text-xs sm:text-sm text-gray-500">Build custom automations using our enterprise API or n8n webhooks.</p>
        </div>
        <button className="px-6 py-3 min-h-[48px] bg-white/5 border border-white/10 text-white font-bold text-sm rounded-lg hover:bg-white/10 active:scale-[0.98] transition-all touch-manipulation">
          Generate API Key
        </button>
      </div>
    </div>
  );
};

export default IntegrationsModule;
