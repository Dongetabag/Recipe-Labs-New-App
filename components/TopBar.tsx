import React from 'react';
import { Search, Bell, Command, User, Menu } from 'lucide-react';
import { UserProfile } from '../types.ts';

interface TopBarProps {
  user: UserProfile;
  onMenuToggle?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, onMenuToggle }) => {
  return (
    <header className="h-16 border-b border-white/5 bg-brand-dark/50 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-2 md:gap-4 flex-1 md:w-1/3">
        {/* Hamburger menu for mobile */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={onMenuToggle}
        >
          <Menu className="w-6 h-6" />
        </button>
        {/* Search - hidden on mobile for cleaner look */}
        <div className="relative group hidden sm:block w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-gold transition-colors" />
          <input
            type="text"
            placeholder="Search leads, campaigns..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-gold rounded-full border-2 border-brand-dark"></span>
        </button>

        <div className="h-8 w-px bg-white/10 mx-1 md:mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Hide text info on mobile, just show avatar */}
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-tighter">{user.role}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-gold font-bold">
            {user.name[0]}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;