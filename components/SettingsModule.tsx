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
    <div className="p-8 space-y-8 animate-fadeIn max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-orbitron uppercase tracking-widest">Agency Configuration</h2>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-brand-gold text-black font-bold text-sm rounded-lg hover:scale-105 transition-all shadow-lg shadow-brand-gold/20"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="space-y-8">
        {/* Personal Profile */}
        <div className="glass p-8 rounded-3xl border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-brand-gold" />
            <h3 className="text-lg font-bold text-white font-orbitron uppercase tracking-widest text-sm">Personal profile</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-brand-dark/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-gold/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full bg-brand-dark/50 border border-white/10 rounded-xl p-3 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Agency Identity */}
        <div className="glass p-8 rounded-3xl border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-brand-gold" />
            <h3 className="text-lg font-bold text-white font-orbitron uppercase tracking-widest text-sm">Agency intelligence</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Core Competency</label>
              <input
                type="text"
                value={formData.agencyCoreCompetency}
                onChange={e => setFormData({...formData, agencyCoreCompetency: e.target.value})}
                className="w-full bg-brand-dark/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-gold/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Brand Voice Descriptor</label>
              <textarea
                value={formData.agencyBrandVoice}
                onChange={e => setFormData({...formData, agencyBrandVoice: e.target.value})}
                className="w-full h-24 bg-brand-dark/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-gold/50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass p-8 rounded-3xl border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-brand-gold" />
            <h3 className="text-lg font-bold text-white font-orbitron uppercase tracking-widest text-sm">Preferences</h3>
          </div>
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifications"
                className="w-4 h-4 rounded bg-brand-dark border-white/10 text-brand-gold focus:ring-brand-gold"
              />
              <label htmlFor="notifications" className="text-sm text-gray-400">Email Notifications</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="analytics"
                defaultChecked
                className="w-4 h-4 rounded bg-brand-dark border-white/10 text-brand-gold focus:ring-brand-gold"
              />
              <label htmlFor="analytics" className="text-sm text-gray-400">Share Usage Analytics</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;