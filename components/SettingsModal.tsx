

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types.ts';
import { X, Save, Palette, Grid, ClipboardList, Spectrum, Sun, Moon } from './icons.tsx';
import ColorPicker from './ColorPicker.tsx';

const PRESET_THEMES = ['violet', 'blue', 'green', 'aqua'];
const THEME_COLORS: { [key: string]: string } = {
  violet: '#6A44FF',
  blue: '#1E3AFF',
  green: '#4FFF7B',
  aqua: '#2BFFC2',
};

interface SettingsModalProps {
  show: boolean;
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ show, user, onClose, onUpdateUser }) => {
  const [theme, setTheme] = useState(user.platformTheme);
  const [layout, setLayout] = useState(user.toolLayout);
  const [mode, setMode] = useState(user.themeMode);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorPickerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerContainerRef.current && !colorPickerContainerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false);
      }
    };
    if (isColorPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorPickerOpen]);

  useEffect(() => {
    if (show) {
      setTheme(user.platformTheme);
      setLayout(user.toolLayout);
      setMode(user.themeMode);
    }
  }, [show, user]);

  if (!show) return null;

  const handleSave = () => {
    onUpdateUser({
      platformTheme: theme,
      toolLayout: layout,
      themeMode: mode,
    });
    onClose();
  };
  
  const Section: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h3 className="text-sm font-mono text-gray-500 dark:text-gray-400 tracking-widest mb-3">{title}</h3>
        <div className="p-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl">
            {children}
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white dark:bg-black p-6 sm:p-8 border border-gray-200 dark:border-white/20 shadow-2xl shadow-[rgba(var(--accent-color-rgb),0.2)] animate-scaleIn w-full max-w-lg rounded-3xl text-gray-900 dark:text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-orbitron">Settings</h2>
          <p className="text-gray-500 dark:text-gray-400">Personalize your lab environment.</p>
        </div>

        <div className="space-y-6">
            <Section title="APPEARANCE">
                <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 font-mono">THEME MODE</label>
                        <div className="flex p-1 bg-gray-200 dark:bg-black/50 rounded-lg">
                            <button onClick={() => setMode('light')} className={`w-1/2 py-2 flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors ${mode === 'light' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-800'}`}>
                               <Sun className="w-5 h-5"/> Day
                            </button>
                             <button onClick={() => setMode('dark')} className={`w-1/2 py-2 flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors ${mode === 'dark' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                               <Moon className="w-5 h-5"/> Night
                            </button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 font-mono">ACCENT COLOR</label>
                        <div ref={colorPickerContainerRef} className="relative flex justify-around items-center">
                          {PRESET_THEMES.map(color => (
                            <button key={color} onClick={() => { setTheme(color); setIsColorPickerOpen(false); }} className={`w-10 h-10 rounded-full bg-brand-${color === 'blue' ? 'royal-blue' : color} transition-all ${theme === color ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-black ring-white' : ''}`} />
                          ))}
                          <button 
                            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${!PRESET_THEMES.includes(theme) ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-black ring-white border-transparent' : 'border-dashed border-gray-400 dark:border-white/20'}`}
                            style={{ background: !PRESET_THEMES.includes(theme) ? theme : 'transparent' }}
                          >
                            <Spectrum className="w-8 h-8" style={{ display: PRESET_THEMES.includes(theme) ? 'block' : 'none' }}/>
                          </button>
                          {isColorPickerOpen && (
                            <div className="absolute top-full mt-3 right-0 z-20">
                                <ColorPicker 
                                    color={THEME_COLORS[theme] || theme}
                                    onChange={setTheme}
                                />
                            </div>
                          )}
                        </div>
                      </div>
                </div>
            </Section>
             <Section title="LAYOUT">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 font-mono">TOOL DISPLAY</label>
                     <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setLayout('grid')} className={`flex items-center justify-center gap-2 p-3 border-2 transition-all rounded-lg ${layout === 'grid' ? 'border-brand-aqua bg-brand-aqua/10 text-gray-900 dark:text-white' : 'border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/30 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/50'}`}>
                            <Grid className="w-5 h-5" /> Grid
                        </button>
                         <button onClick={() => setLayout('list')} className={`flex items-center justify-center gap-2 p-3 border-2 transition-all rounded-lg ${layout === 'list' ? 'border-brand-aqua bg-brand-aqua/10 text-gray-900 dark:text-white' : 'border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/30 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/50'}`}>
                            <ClipboardList className="w-5 h-5" /> List
                        </button>
                    </div>
                  </div>
            </Section>
        </div>

        <div className="mt-8 flex gap-4">
            <button
                onClick={handleSave}
                className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-[var(--accent-color)] text-white font-bold hover:shadow-lg hover:shadow-[rgba(var(--accent-color-rgb),0.5)] transform hover:scale-105 transition-all duration-200 rounded-lg"
            >
                <Save className="w-5 h-5" />
                Save Preferences
            </button>
             <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-white/20 transition-all rounded-lg"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;