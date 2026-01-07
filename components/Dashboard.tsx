

import React, { useState, useMemo, useRef } from 'react';
import { UserProfile, Tool, Recipe } from '../types.ts';
import { ALL_TOOLS, ALL_RECIPES } from '../constants.tsx';
import {
  User, LogOut, Settings, Search, Grid, Layers, Compass, Sparkles, Users, Briefcase, Star
} from './icons.tsx';
import ParticleEffect from './ParticleEffect.tsx';
import FloatingOrb from './FloatingOrb.tsx';
import OnboardingGuide from './OnboardingGuide.tsx';

interface DashboardProps {
  user: UserProfile;
  toolStats: { [key: string]: { usage: number } };
  onSelectTool: (tool: Tool) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onCompleteOnboarding: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  toolStats,
  onSelectTool,
  onSelectRecipe,
  onLogout,
  onOpenProfile,
  onOpenSettings,
  onCompleteOnboarding,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'All' | 'Strategy' | 'Creation' | 'Client' | 'Productivity'>('All');
    
    const onboardingRefs = {
        welcome: useRef<HTMLDivElement>(null),
        quickLaunch: useRef<HTMLDivElement>(null),
        categories: useRef<HTMLDivElement>(null),
        firstTool: useRef<HTMLDivElement>(null),
    };

    const filteredTools = useMemo(() => {
        return ALL_TOOLS.filter(tool => {
            const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
            const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || tool.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, selectedCategory]);

    const categories: ('Strategy' | 'Creation' | 'Client' | 'Productivity')[] = ['Strategy', 'Creation', 'Client', 'Productivity'];

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Strategy': return <Compass className="w-5 h-5" />;
            case 'Creation': return <Sparkles className="w-5 h-5" />;
            case 'Client': return <Users className="w-5 h-5" />;
            case 'Productivity': return <Briefcase className="w-5 h-5" />;
            default: return <Star className="w-5 h-5" />;
        }
    };
  
    return (
    <>
      {!user.hasCompletedOnboarding && (
        <OnboardingGuide
          user={user}
          onComplete={onCompleteOnboarding}
          targets={onboardingRefs}
          onSelectTool={onSelectTool}
        />
      )}
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white relative overflow-hidden flex">
        {user.themeMode === 'dark' && (
          <>
            <ParticleEffect />
            <FloatingOrb color="purple" delay={0} />
            <FloatingOrb color="blue" delay={2} />
            <FloatingOrb color="green" delay={4} />
          </>
        )}
        
        <aside ref={onboardingRefs.quickLaunch} className="w-20 bg-white/50 dark:bg-black/50 backdrop-blur-md border-r border-gray-200 dark:border-white/10 flex flex-col items-center py-6 space-y-4 z-20">
            <div className="p-2.5 bg-gradient-to-br from-brand-lavender to-brand-aqua rounded-lg text-black font-bold text-sm">R</div>
            <div className="flex-grow space-y-2">
                {ALL_TOOLS.slice(0, 8).map(tool => (
                    <button key={tool.id} onClick={() => onSelectTool(tool)} className="group relative p-3 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black rounded-lg transition-colors" title={tool.name}>
                        <div className={`p-1 bg-gradient-to-br ${tool.gradient} rounded-md text-white`}>{React.cloneElement(tool.icon, { className: 'w-5 h-5' })}</div>
                    </button>
                ))}
            </div>
        </aside>

        <div className="flex-1 flex flex-col">
            <header className="bg-white/50 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between z-20">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search for a tool..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 py-2.5 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-all font-mono rounded-lg"
                    />
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{user.role}</p>
                    </div>
                    <button onClick={onOpenProfile} className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors" title="Profile">
                        <User className="w-5 h-5" />
                    </button>
                    <button onClick={onOpenSettings} className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors" title="Settings">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button onClick={onLogout} className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors" title="Log Out">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
                <div ref={onboardingRefs.welcome} className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold font-orbitron">Welcome to the Lab, {user.name.split(' ')[0]}</h1>
                    <p className="text-gray-500 dark:text-gray-400">Your AI-powered creative suite is ready.</p>
                </div>
                
                <div className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Layers className="text-[var(--accent-color)]" /> Recipes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ALL_RECIPES.map(recipe => (
                             <div key={recipe.id} onClick={() => onSelectRecipe(recipe)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectRecipe(recipe); }} className="group relative bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-[rgba(var(--accent-color-rgb),0.2)] hover:-translate-y-1 cursor-pointer">
                                 <div className={`absolute -inset-px bg-gradient-to-br ${recipe.gradient} blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-2xl`} />
                                 <div className="relative">
                                     <div className="flex justify-between items-start">
                                         <div className="flex-1 pr-4">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{recipe.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{recipe.description}</p>
                                         </div>
                                         <div className={`p-3 bg-gradient-to-br ${recipe.gradient} rounded-lg text-white`}>
                                            {React.cloneElement(recipe.icon, { className: "w-6 h-6" })}
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-2 mt-4">
                                         {recipe.toolIds.slice(0, 4).map(toolId => {
                                             const tool = ALL_TOOLS.find(t => t.id === toolId);
                                             return tool ? <div key={tool.id} className={`p-1 bg-gradient-to-br ${tool.gradient} rounded-md text-white`} title={tool.name}>{React.cloneElement(tool.icon, { className: 'w-4 h-4' })}</div> : null;
                                         })}
                                     </div>
                                     <div onClick={(e) => e.stopPropagation()} className="mt-6">
                                        <button onClick={() => onSelectRecipe(recipe)} className="w-full bg-gradient-to-r from-brand-violet to-brand-royal-blue text-white font-bold py-2.5 rounded-lg hover:shadow-lg hover:shadow-brand-violet/50 transition-shadow">
                                            Run Recipe
                                        </button>
                                     </div>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Grid className="text-[var(--accent-color)]" /> AI Tools</h2>
                    <div ref={onboardingRefs.categories} className="flex flex-wrap gap-2 mb-6">
                        <button onClick={() => setSelectedCategory('All')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedCategory === 'All' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'}`}>All</button>
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedCategory === cat ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    {filteredTools.length > 0 ? (
                        <div ref={onboardingRefs.firstTool} className={`grid gap-6 ${user.toolLayout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {filteredTools.map(tool => (
                                <div key={tool.id} onClick={() => onSelectTool(tool)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectTool(tool); }} className="group relative bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-2xl hover:shadow-[rgba(var(--accent-color-rgb),0.2)] hover:-translate-y-1">
                                    <div className={`absolute -inset-px bg-gradient-to-br ${tool.gradient} blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-2xl`} />
                                    <div className="relative flex flex-col h-full">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 bg-gradient-to-br ${tool.gradient} rounded-lg text-white`}>
                                                {tool.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tool.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tool.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex-grow" />
                                        <div className="flex justify-between items-center mt-4">
                                             <div className="flex items-center gap-2 text-xs font-mono text-gray-400 dark:text-gray-500">
                                                {getCategoryIcon(tool.category)}
                                                <span>{tool.category}</span>
                                            </div>
                                            <div className="text-xs font-mono text-gray-400 dark:text-gray-500">
                                                {toolStats[tool.id]?.usage || 0} uses
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                             <p className="text-gray-500 dark:text-gray-400">No tools found for "{searchTerm}".</p>
                             <button onClick={() => setSearchTerm('')} className="mt-4 text-sm font-semibold text-[var(--accent-color)] hover:underline">Clear search</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;