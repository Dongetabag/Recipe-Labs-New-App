import React from 'react';
import { Folder, File, Image, Video, MoreVertical, Search, Filter } from 'lucide-react';

const AssetsModule: React.FC = () => {
  const assets = [
    { id: '1', name: 'Logo_Master_v2.png', type: 'image', size: '2.4 MB', date: '2 hours ago' },
    { id: '2', name: 'Brand_Guidelines_Final.pdf', type: 'doc', size: '12.1 MB', date: 'Yesterday' },
    { id: '3', name: 'Commercial_Q1.mp4', type: 'video', size: '142 MB', date: '3 days ago' },
    { id: '4', name: 'Pitch_Deck_Apex.pptx', type: 'doc', size: '8.4 MB', date: 'Last week' },
  ];

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-orbitron">Asset Library</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-lg hover:bg-white/10 transition-all">
            <Folder className="w-4 h-4" /> New Folder
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-black font-bold text-sm rounded-lg hover:scale-105 transition-all">
            Upload Files
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {['All Files', 'Images', 'Documents', 'Videos'].map((cat, i) => (
          <button key={i} className={`p-4 rounded-xl border transition-all text-left ${i === 0 ? 'bg-brand-gold/10 border-brand-gold/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${i === 0 ? 'text-brand-gold' : 'text-gray-500'}`}>{cat}</p>
            <p className="text-xl font-bold text-white mt-1">{[142, 54, 82, 6][i]}</p>
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden border-white/5">
        <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Search files..." className="bg-brand-dark/50 border border-white/10 rounded-lg py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-brand-gold/50" />
             </div>
             <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white px-2"><Filter className="w-3 h-3" /> Filter</button>
          </div>
          <span className="text-[10px] font-mono text-gray-600">Storage: 42.8 GB / 100 GB</span>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Uploaded</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {assets.map(asset => (
              <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {asset.type === 'image' && <Image className="w-5 h-5 text-blue-400" />}
                    {asset.type === 'doc' && <File className="w-5 h-5 text-gray-400" />}
                    {asset.type === 'video' && <Video className="w-5 h-5 text-red-400" />}
                    <span className="text-sm font-medium text-white group-hover:text-brand-gold transition-colors">{asset.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold uppercase text-gray-500">{asset.type}</span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400 font-mono">{asset.size}</td>
                <td className="px-6 py-4 text-xs text-gray-400">{asset.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-600 hover:text-brand-gold transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetsModule;