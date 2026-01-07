import React, { useState, useEffect } from 'react';
// Fix: Add file extension to import to resolve module
import { UserProfile } from '../types.ts';
// Fix: Add .tsx file extension for component imports
import { X, User as UserIcon, Mail, Save, Briefcase, Tag, Shield, MapPin, Brain, Target, FileText, ClipboardList, Award } from './icons.tsx';

interface ProfileModalProps {
  show: boolean;
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
}

const EditableField: React.FC<{
  name: keyof UserProfile;
  label: string;
  value: string | readonly string[] | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  icon: React.ReactNode;
  as?: 'input' | 'textarea' | 'select';
  type?: string;
  options?: string[];
  placeholder?: string;
  disabled?: boolean;
  helpText?: string;
}> = ({ name, label, icon, as = 'input', helpText, ...props }) => {
    const commonClasses = "w-full bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 py-2.5 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-all font-mono rounded-lg disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-black/50 disabled:text-gray-500";
    
    const renderInput = () => {
        switch(as) {
            case 'textarea':
                return <textarea name={name} {...props} className={`${commonClasses} resize-none h-24`} />;
            case 'select':
                return (
                    <select name={name} {...props} className={`${commonClasses} appearance-none`}>
                        {props.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            default:
                return <input name={name} {...props} className={commonClasses} />;
        }
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 font-mono">{label.toUpperCase()}</label>
            <div className="relative">
                <div className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500">{icon}</div>
                {renderInput()}
            </div>
            {helpText && <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">{helpText}</p>}
        </div>
    );
};

const ProfileModal: React.FC<ProfileModalProps> = ({ show, user, onClose, onUpdateUser }) => {
  const [formData, setFormData] = useState<UserProfile>(user);

  useEffect(() => {
    if (show) {
      setFormData(user);
    }
  }, [user, show]);

  if (!show) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    const goalsArray = typeof formData.primaryGoals === 'string'
      // @ts-ignore - It will be a string from the form input
      ? formData.primaryGoals.split(',').map(g => g.trim()).filter(Boolean)
      : formData.primaryGoals;

    onUpdateUser({ ...formData, primaryGoals: goalsArray });
    onClose();
  };
  
  const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2 mb-4 font-orbitron">{children}</h3>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white dark:bg-black p-6 sm:p-8 border border-gray-200 dark:border-white/20 shadow-2xl shadow-[rgba(var(--accent-color-rgb),0.2)] animate-scaleIn w-full max-w-2xl rounded-3xl flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6 flex-shrink-0">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-orbitron">USER PROFILE</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage and retrain your AI assistant</p>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 -mr-4 flex-grow" style={{maxHeight: '65vh'}}>
            <SectionTitle>Core Identity</SectionTitle>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField name="name" label="Display Name" value={formData.name} onChange={handleChange} icon={<UserIcon />} />
                <EditableField name="email" label="Email Address" value={formData.email} onChange={handleChange} icon={<Mail />} disabled />
                <EditableField
                    name="role"
                    label="Assigned Role"
                    value={formData.role}
                    onChange={handleChange}
                    icon={<Briefcase />}
                    as="select"
                    options={['Designer', 'Copywriter', 'Strategist', 'Account Manager']}
                />
            </div>

            <SectionTitle>AI Recipe</SectionTitle>
            <p className="-mt-3 mb-4 text-sm text-gray-500 dark:text-gray-400">This information helps the AI tailor its responses to your agency's specific needs.</p>
            <div className="space-y-4">
                <EditableField name="agencyBrandVoice" label="Agency Brand Voice" value={formData.agencyBrandVoice} onChange={handleChange} icon={<Brain />} placeholder="e.g., Witty, Professional, Bold"/>
                <EditableField name="agencyCoreCompetency" label="Agency Core Competency" value={formData.agencyCoreCompetency} onChange={handleChange} icon={<Shield />} placeholder="e.g., B2B SaaS Marketing"/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditableField name="primaryClientIndustry" label="Primary Client Industry" value={formData.primaryClientIndustry} onChange={handleChange} icon={<Tag />} placeholder="e.g., E-commerce"/>
                    <EditableField name="targetLocation" label="Target Market Location" value={formData.targetLocation} onChange={handleChange} icon={<MapPin />} placeholder="e.g., New York City, Global"/>
                </div>
                <EditableField name="idealClientProfile" label="Ideal Client Profile" value={formData.idealClientProfile} onChange={handleChange} icon={<Target />} placeholder="e.g., Startups with 10-50 employees"/>
                <EditableField name="clientWorkExamples" label="Past Work Examples" value={formData.clientWorkExamples} onChange={handleChange} icon={<FileText />} as="textarea" helpText="Provide links or descriptions of successful projects."/>
                <EditableField name="primaryGoals" label="Primary Goals" value={Array.isArray(formData.primaryGoals) ? formData.primaryGoals.join(', ') : ''} onChange={handleChange} icon={<ClipboardList />} helpText="What you want to achieve with this AI. Separate with commas."/>
                <EditableField name="successMetric" label="#1 Success Metric" value={formData.successMetric} onChange={handleChange} icon={<Award />} placeholder="e.g., Client Retention Rate"/>
            </div>
        </div>

        <div className="mt-8 flex gap-4 flex-shrink-0">
            <button
                onClick={handleSave}
                className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-[var(--accent-color)] text-white font-bold hover:shadow-lg hover:shadow-[rgba(var(--accent-color-rgb),0.5)] transform hover:scale-105 transition-all duration-200 rounded-lg"
            >
                <Save className="w-5 h-5" />
                Save & Retrain AI
            </button>
             <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-all rounded-lg"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
