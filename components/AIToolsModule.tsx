import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage, Agent, ChatThread } from '../types.ts';
import { GoogleGenAI } from '@google/genai';
import { 
  Sparkles, Send, Paperclip, Eraser, Command, Search, 
  Bot, User, Brain, MessageSquare, Terminal, ChevronRight,
  TrendingUp, Globe, FileText, Zap
} from 'lucide-react';

interface AIToolsModuleProps {
  user: UserProfile;
}

const AGENTS: Agent[] = [
  { 
    id: 'researcher', 
    name: 'Market Researcher', 
    role: 'Business Intelligence',
    description: 'Specializes in competitor analysis and market trends.',
    systemInstruction: 'You are a high-level Market Researcher. Provide data-driven insights and detailed competitor landscapes.',
    icon: <Globe className="w-4 h-4" />,
    color: 'text-blue-400'
  },
  { 
    id: 'copywriter', 
    name: 'CopyCraft Pro', 
    role: 'Creative Writing',
    description: 'Expert in high-conversion agency copywriting.',
    systemInstruction: 'You are a world-class Copywriter. Focus on emotional hooks, conversion metrics, and brand voice alignment.',
    icon: <FileText className="w-4 h-4" />,
    color: 'text-orange-400'
  },
  { 
    id: 'analyst', 
    name: 'Data Strategist', 
    role: 'Predictive Analytics',
    description: 'Translates raw data into actionable agency growth.',
    systemInstruction: 'You are a Data Strategist. Focus on KPIs, ROI projections, and scaling strategies.',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-green-400'
  }
];

const AIToolsModule: React.FC<AIToolsModuleProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [activeAgent, setActiveAgent] = useState<Agent>(AGENTS[0]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, isTyping, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date().toISOString() };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: `${activeAgent.systemInstruction}. You are assisting ${user.name}, an agency ${user.role}. Agency Focus: ${user.agencyCoreCompetency}. Industry: ${user.primaryClientIndustry}. Tone: Futuristic, professional, and slightly bold.`,
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: response.text || 'Synthesis complete.', 
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [...prev, modelMsg]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'model', text: 'Cognitive disruption detected. Please re-initiate command.', timestamp: new Date().toISOString() }]);
    } finally {
      setIsTyping(false);
      setIsThinking(false);
    }
  };

  return (
    <div className="flex h-full animate-fadeIn overflow-hidden">
      {/* Sidebar: Agents & Context */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-brand-dark/20">
        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Active Agents</h3>
            <div className="space-y-2">
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                    activeAgent.id === agent.id 
                      ? 'bg-brand-gold/10 border-brand-gold/20' 
                      : 'border-transparent hover:bg-white/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-white/5 ${agent.color}`}>
                    {agent.icon}
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className={`text-sm font-bold truncate ${activeAgent.id === agent.id ? 'text-brand-gold' : 'text-white'}`}>
                      {agent.name}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{agent.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Prompt Templates</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Market Audit', icon: <Search className="w-3 h-3" /> },
                { label: 'Campaign Pivot', icon: <Zap className="w-3 h-3" /> },
                { label: 'Brand Archetype', icon: <Brain className="w-3 h-3" /> }
              ].map((template, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(`Perform a ${template.label} for our core industry: ${user.primaryClientIndustry}`)}
                  className="flex items-center gap-2 p-2.5 text-[10px] font-bold text-gray-400 hover:text-white bg-white/5 border border-white/10 rounded-lg transition-all"
                >
                  {template.icon} {template.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20">
                <Terminal className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">Cognitive State</p>
                <p className="text-[10px] text-green-500 font-mono">ENCRYPTED & SYNCED</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-[#0a0a0a]">
        {/* Chat Header */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-brand-gold animate-pulse shadow-[0_0_10px_#FFD700]' : 'bg-green-500'}`}></div>
            <span className="text-xs font-bold text-white uppercase tracking-widest">
              Live with <span className="text-brand-gold">{activeAgent.name}</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
            <span>MEM: 1.4GB</span>
            <span>LATENCY: 42ms</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-12 scroll-smooth">
          {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-gold blur-2xl opacity-10 animate-pulse scale-150"></div>
                <div className="relative w-24 h-24 bg-brand-card border border-brand-gold/20 rounded-[2rem] flex items-center justify-center shadow-2xl">
                  <Bot className="w-12 h-12 text-brand-gold animate-glow" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-white font-orbitron">Cognitive Interface v3.1</h4>
                <p className="text-sm text-gray-500 leading-relaxed px-12">
                  Ready to architect high-performance solutions for your {user.primaryClientIndustry} client. Initiate a command to begin.
                </p>
              </div>
            </div>
          )}

          {history.map((msg, i) => (
            <div key={i} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'animate-fadeIn'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold'
              }`}>
                {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
              </div>
              <div className={`max-w-3xl space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`p-5 rounded-3xl text-sm leading-relaxed whitespace-pre-line shadow-xl border ${
                  msg.role === 'user' 
                    ? 'bg-white/5 text-gray-200 border-white/10 rounded-tr-none' 
                    : 'glass-gold border-brand-gold/10 text-gray-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <div className={`flex items-center gap-3 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                   <span className="text-[10px] text-gray-600 font-mono uppercase tracking-tighter">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                   </span>
                   {msg.role === 'model' && (
                     <div className="flex gap-2">
                        <button className="text-[10px] text-gray-600 hover:text-brand-gold font-bold uppercase tracking-widest transition-colors">Export</button>
                        <button className="text-[10px] text-gray-600 hover:text-brand-gold font-bold uppercase tracking-widest transition-colors">Copy</button>
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
          
          {isThinking && (
             <div className="flex gap-6 animate-fadeIn">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 glass-gold border border-brand-gold/20 text-brand-gold">
                   <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-3 max-w-xl">
                  <div className="p-4 rounded-3xl glass-gold border border-brand-gold/10 flex items-center gap-4">
                    <div className="flex gap-1.5">
                       <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                       <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-xs font-mono text-brand-gold/80 animate-pulse tracking-widest uppercase">Thinking Deeply...</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-brand-gold/40 w-2/3 animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
             </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-md">
          <div className="max-w-4xl mx-auto relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-gold/50 to-orange-500/50 rounded-2xl opacity-0 group-focus-within:opacity-20 transition-opacity blur-lg"></div>
             
             <div className="relative flex items-end gap-3 bg-brand-card border border-white/10 rounded-2xl p-2 focus-within:border-brand-gold/50 transition-all shadow-2xl">
                <div className="flex flex-col items-center gap-1 px-3 py-2">
                   <button className="p-2 text-gray-500 hover:text-brand-gold transition-colors" title="Attach Context">
                      <Paperclip className="w-5 h-5" />
                   </button>
                </div>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`Command ${activeAgent.name}...`}
                  className="w-full bg-transparent border-none py-3 px-2 text-sm text-white focus:ring-0 placeholder-gray-600 resize-none min-h-[48px] max-h-[200px]"
                  rows={1}
                />
                
                <div className="flex items-center gap-2 p-1">
                   <button 
                      onClick={() => setHistory([])}
                      className="p-2 text-gray-600 hover:text-red-400 transition-colors" 
                      title="Purge Memory"
                   >
                      <Eraser className="w-5 h-5" />
                   </button>
                   <button 
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      className="p-3 bg-brand-gold text-black rounded-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shadow-lg"
                   >
                      <Send className="w-5 h-5" />
                   </button>
                </div>
             </div>

             <div className="absolute -bottom-10 left-0 right-0 flex items-center justify-between px-2">
                <div className="flex gap-4">
                   <span className="flex items-center gap-1.5 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      <Command className="w-3 h-3" /> + Enter to send
                   </span>
                </div>
                <div className="flex gap-4">
                  <span className="text-[10px] text-gray-600 font-mono">ENCRYPTION: AES-256</span>
                  <span className="text-[10px] text-gray-600 font-mono">TOKEN CAP: 8K</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolsModule;