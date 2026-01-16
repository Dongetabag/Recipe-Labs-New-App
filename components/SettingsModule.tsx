import React, { useState } from 'react';
import { UserProfile } from '../types.ts';
import { User, Shield, Palette, Bell, Globe, Save } from 'lucide-react';

interface SettingsModuleProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const SettingsModule: React.FC<SettingsModuleProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState(user);

  const handleSave = () => {
    onUpdate(formData);
    localStorage.setItem('agency_user_profile', JSON.stringify(formData));
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron uppercase tracking-widest">Agency Configuration</h2>
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] bg-brand-gold text-black font-bold text-sm rounded-lg hover:scale-105 active:scale-[0.98] transition-all shadow-lg shadow-brand-gold/20 touch-manipulation"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Personal Profile */}
        <div className="glass p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-white/5 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-brand-gold" />
            <h3 className="text-sm font-bold text-white font-orbitron uppercase tracking-widest">Personal profile</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-brand-dark/50 border border-white/10 rounded-xl p-3 min-h-[48px] text-base focus:outline-none focus:border-brand-gold/50 touch-manipulation"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full bg-brand-dark/50 border border-white/10 rounded-xl p-3 min-h-[48px] text-base text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Agency Identity */}
        <div className="glass p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-white/5 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-brand-gold" />
            <h3 className="text-sm font-bold text-white font-orbitron uppercase tracking-widest">Agency intelligence</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Core Competency</label>
              <input
                type="text"
                value={formData.agencyCoreCompetency}
                onChange={e => setFormData({...formData, agencyCoreCompetency: e.target.value})}
                className="w-full bg-brand-dark/50 border border-white/10 rounded-xl p-3 min-h-[48px] text-base focus:outline-none focus:border-brand-gold/50 touch-manipulation"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Brand Voice Descriptor</label>
              <textarea
                value={formData.agencyBrandVoice}
                onChange={e => setFormData({...formData, agencyBrandVoice: e.target.value})}
                className="w-full h-24 bg-brand-dark/50 border border-white/10 rounded-xl p-3 text-base focus:outline-none focus:border-brand-gold/50 resize-none touch-manipulation"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-white/5 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-brand-gold" />
            <h3 className="text-sm font-bold text-white font-orbitron uppercase tracking-widest">Preferences</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <label htmlFor="notifications" className="flex items-center gap-3 p-3 sm:p-0 bg-white/5 sm:bg-transparent rounded-lg cursor-pointer touch-manipulation">
              <input
                type="checkbox"
                id="notifications"
                className="w-5 h-5 rounded bg-brand-dark border-white/10 text-brand-gold focus:ring-brand-gold touch-manipulation"
              />
              <span className="text-sm text-gray-400">Email Notifications</span>
            </label>
            <label htmlFor="analytics" className="flex items-center gap-3 p-3 sm:p-0 bg-white/5 sm:bg-transparent rounded-lg cursor-pointer touch-manipulation">
              <input
                type="checkbox"
                id="analytics"
                defaultChecked
                className="w-5 h-5 rounded bg-brand-dark border-white/10 text-brand-gold focus:ring-brand-gold touch-manipulation"
              />
              <span className="text-sm text-gray-400">Share Usage Analytics</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
