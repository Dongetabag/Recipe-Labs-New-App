import React, { useState, useRef } from 'react';
import { UserProfile } from '../types.ts';
import { GoogleGenAI } from '@google/genai';
import { 
  Sparkles, Image as ImageIcon, Download, Wand2, 
  Loader2, Maximize2, Layers, Palette, RefreshCcw, 
  Trash2, Monitor, Share2, Upload, X, History, ArrowRight,
  Fingerprint, Zap
} from 'lucide-react';

interface MediaModuleProps {
  user: UserProfile;
}

interface MediaAsset {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
  style: string;
  isReference?: boolean;
}

const STYLE_PRESETS = [
  { id: 'photorealistic', name: 'Photorealistic', description: 'Studio lighting, 8k resolution.', prompt: 'highly detailed, studio photography, 8k, cinematic lighting, sharp focus' },
  { id: 'minimalist', name: 'Minimalist 3D', description: 'Soft shadows, clay-like textures.', prompt: 'minimalist 3d render, blender style, soft global illumination, pastel gradients' },
  { id: 'noir', name: 'Noir Agency', description: 'Deep shadows, dramatic high-contrast.', prompt: 'film noir style, high contrast, dramatic shadows, black and white cinematic' },
  { id: 'abstract', name: 'Fluid Abstract', description: 'Dynamic movement, metallic surfaces.', prompt: 'abstract liquid metal, fluid dynamics, vibrant iridescence, futuristic' },
  { id: 'corporate', name: 'High-End Corp', description: 'Clean, professional, glass and steel.', prompt: 'professional corporate photography, premium glass textures, bright airy aesthetic' }
];

const MediaModule: React.FC<MediaModuleProps> = ({ user }) => {
  const [prompt, setPrompt] = useState('');
  const [activeStyle, setActiveStyle] = useState(STYLE_PRESETS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<MediaAsset[]>([]);
  const [activeReference, setActiveReference] = useState<MediaAsset | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setActiveReference({
        id: `ref-${Date.now()}`,
        url: base64,
        prompt: 'Imported Reference',
        timestamp: new Date().toISOString(),
        style: 'None',
        isReference: true
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRevise = (asset: MediaAsset) => {
    setActiveReference({ ...asset, isReference: true });
    setPrompt(asset.prompt);
    // Scroll to input
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const finalPrompt = `Professional ${activeStyle.name} asset for ${user.agencyCoreCompetency} agency. Concept: ${prompt}. Visual Style: ${activeStyle.prompt}. Aspect Ratio: ${aspectRatio}.`;
      
      let contents: any;
      if (activeReference) {
        // Send reference image for editing/revision
        const base64Data = activeReference.url.split(',')[1];
        contents = {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: `Revise this image based on the following: ${finalPrompt}` }
          ]
        };
      } else {
        contents = { parts: [{ text: finalPrompt }] };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
        config: {
          imageConfig: { aspectRatio: aspectRatio as any }
        }
      });

      const newAssets: MediaAsset[] = [];
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          newAssets.push({
            id: `gen-${Date.now()}-${Math.random()}`,
            url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            prompt: prompt,
            timestamp: new Date().toISOString(),
            style: activeStyle.name
          });
        }
      }
      
      if (newAssets.length > 0) {
        setGeneratedImages(prev => [...newAssets, ...prev]);
        setActiveReference(null); // Clear reference after successful generation
      }
    } catch (err) {
      console.error('Synthesis failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fadeIn h-full flex flex-col bg-[#050505]">
      {/* Immersive Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/20 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
             <Zap className="w-6 h-6 text-brand-gold" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white font-orbitron tracking-tighter uppercase">Media Studio</h2>
            <p className="text-sm text-gray-500 mt-1">Multi-stage generation & revision workspace</p>
          </div>
        </div>
        <div className="flex gap-4">
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-all"
          >
             <Upload className="w-4 h-4" /> Import Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
        {/* Workspace Controls */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
          
          {/* Active Reference Rack */}
          {activeReference && (
            <div className="glass p-5 rounded-3xl border-brand-gold/30 bg-brand-gold/5 space-y-4 animate-slideIn">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Fingerprint className="w-4 h-4 text-brand-gold" />
                     <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">Active Reference</span>
                  </div>
                  <button onClick={() => setActiveReference(null)} className="text-gray-500 hover:text-white transition-colors">
                     <X className="w-4 h-4" />
                  </button>
               </div>
               <div className="relative aspect-square rounded-2xl overflow-hidden border border-brand-gold/20">
                  <img src={activeReference.url} className="w-full h-full object-cover grayscale opacity-60" alt="Reference" />
                  <div className="absolute inset-0 bg-brand-gold/10 flex items-center justify-center">
                     <RefreshCcw className="w-8 h-8 text-brand-gold animate-spin-slow" />
                  </div>
               </div>
               <p className="text-[9px] text-gray-400 italic">This image will be used as the structural and style basis for the next generation.</p>
            </div>
          )}

          <div className="glass p-6 rounded-3xl border-white/5 space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em]">Creative Directive</label>
              <RefreshCcw className="w-3 h-3 text-gray-600 hover:text-brand-gold cursor-pointer" onClick={() => {setPrompt(''); setActiveReference(null);}} />
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={activeReference ? "Describe the changes you want to make to the reference..." : "E.g., High-tech neural network visualization..."}
              className="w-full h-36 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-brand-gold/30 transition-all resize-none leading-relaxed"
            />
            
            <div className="space-y-4">
               <div className="flex p-1 bg-black/40 rounded-xl border border-white/10">
                {['1:1', '16:9', '9:16', '4:3'].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${aspectRatio === ratio ? 'bg-brand-gold text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full relative group overflow-hidden py-4 bg-brand-gold text-black font-bold rounded-2xl transition-all shadow-xl hover:shadow-brand-gold/20 active:scale-95 disabled:opacity-50"
              >
                <div className="relative flex items-center justify-center gap-2">
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                  <span className="uppercase tracking-widest text-xs font-orbitron">{isGenerating ? 'Synthesizing...' : activeReference ? 'Execute Revision' : 'Generate Asset'}</span>
                </div>
              </button>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
               <Palette className="w-4 h-4 text-brand-gold" />
               <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Style Presets</h3>
            </div>
            <div className="space-y-2">
              {STYLE_PRESETS.map(style => (
                <button 
                  key={style.id} 
                  onClick={() => setActiveStyle(style)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    activeStyle.id === style.id 
                      ? 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold shadow-[inset_0_0_15px_rgba(255,215,0,0.05)]' 
                      : 'bg-white/5 border-transparent text-gray-500 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase truncate">{style.name}</p>
                  <p className="text-[9px] opacity-60 truncate mt-0.5">{style.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Workspace Display */}
        <div className="lg:col-span-3 glass rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col bg-black/40 relative">
          
          {/* Visual Canvas */}
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            {generatedImages.length === 0 && !isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                   <div className="absolute inset-0 bg-brand-gold blur-3xl opacity-5 scale-150"></div>
                   <div className="relative p-12 rounded-[3rem] bg-white/5 border border-dashed border-white/10">
                     <ImageIcon className="w-24 h-24 text-gray-800" />
                   </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold text-white font-orbitron">Neural Canvas Empty</h4>
                  <p className="max-w-xs text-xs text-gray-500 mx-auto">Upload a reference or provide a prompt to start the synthesis process.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isGenerating && (
                  <div className={`relative rounded-[2rem] overflow-hidden border border-brand-gold/30 bg-brand-gold/5 flex flex-col items-center justify-center gap-6 animate-pulse`} style={{ aspectRatio: aspectRatio === '1:1' ? '1/1' : aspectRatio === '16:9' ? '16/9' : aspectRatio === '9:16' ? '9/16' : '4/3' }}>
                    <div className="relative">
                       <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
                       <div className="absolute inset-0 bg-brand-gold blur-xl opacity-20"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.3em] font-orbitron">Synthesizing Asset...</p>
                      <div className="flex gap-1 justify-center">
                         {[1,2,3].map(i => <div key={i} className={`w-1 h-1 bg-brand-gold rounded-full animate-bounce [animation-delay:${i*0.2}s]`} />)}
                      </div>
                    </div>
                  </div>
                )}
                
                {generatedImages.map((img) => (
                  <div key={img.id} className="group relative rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-brand-gold/30 transition-all shadow-2xl bg-brand-dark animate-fadeIn">
                    <img src={img.url} alt="Generated" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    
                    {/* Immersive Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2">
                              <History className="w-3 h-3 text-brand-gold" />
                              <span className="text-[9px] font-bold text-brand-gold uppercase tracking-widest">Generation Metadata</span>
                           </div>
                           <p className="text-xs text-white/90 font-medium leading-relaxed italic line-clamp-2">"{img.prompt}"</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleRevise(img)}
                            className="flex-1 py-3 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold hover:text-black transition-all border border-white/10 flex items-center justify-center gap-2"
                          >
                            <RefreshCcw className="w-3 h-3" /> Revise
                          </button>
                          <button className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all border border-white/10">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all border border-white/10">
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Meta info badge */}
                    <div className="absolute top-6 left-6 flex gap-2">
                       <span className="text-[8px] font-bold text-black bg-brand-gold px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                          <Fingerprint className="w-2.5 h-2.5" /> ID: {img.id.slice(4, 10)}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Lab Status Bar */}
          <div className="p-5 bg-white/5 border-t border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Neural Link: Stable</span>
                </div>
                <div className="h-3 w-px bg-white/10"></div>
                <span className="text-[10px] font-mono text-gray-600">ASSETS IN CACHE: {generatedImages.length}</span>
             </div>
             <div className="flex items-center gap-2 text-gray-600 hover:text-brand-gold cursor-pointer transition-colors">
                <History className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Full History</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaModule;