import { motion, AnimatePresence } from "motion/react";
import { Send, Globe, Database, Shield, Zap, Search, LogOut, ChevronRight, Activity, Cpu, Layers } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";

interface Message {
  role: 'user' | 'assistant';
  text: string;
  agent?: string;
  timestamp: Date;
}

interface ResearchDashboardProps {
  user: string;
  language: string;
  onLogout: () => void;
}

const AGENTS = [
  { id: 'Coordinator', icon: Zap, label: 'Central Coordinator', desc: 'Routes tasks and synthesizes views' },
  { id: 'Researcher', icon: Search, label: 'Deep Researcher', desc: 'Detailed data gathering and fact finding' },
  { id: 'Analyst', icon: Database, label: 'Data Analyst', desc: 'Quantitative analysis and pattern detection' },
  { id: 'Security', icon: Shield, label: 'Security Auditor', desc: 'Compliance and safety check' },
];

export const ResearchDashboard: React.FC<ResearchDashboardProps> = ({ user, language, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState('Coordinator');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-10),
          agent: selectedAgent,
          language
        }),
      });

      const data = await response.json();

      let responseText: string;
      if (data.text) {
        responseText = data.text;
      } else if (data.error) {
        responseText = `⚠️ **Backend Error:** ${data.error}`;
      } else {
        responseText = "⚠️ System Error: No response from backend.";
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        text: responseText,
        agent: selectedAgent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `⚠️ **Network Error:** Could not reach the backend. Make sure \`python app.py\` is running on port 5000.\n\nDetails: ${errMsg}`,
        agent: selectedAgent,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div id="dashboard-layout" className="flex h-screen w-full relative overflow-hidden bg-[#020617] text-slate-200 font-sans">
      {/* Left Navigation: Research Sidebar */}
      <aside className="w-64 bg-[#050b1a] border-r border-blue-900/40 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] flex items-center justify-center">
            <span className="font-bold text-white text-sm">M</span>
          </div>
          <span className="text-lg font-display font-semibold tracking-tight text-blue-400">MARS <span className="text-[10px] align-top opacity-50 font-mono">v2.0</span></span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-blue-500/60 font-bold mb-4 px-2">Active Research Agents</div>
          <div className="space-y-1">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  selectedAgent === agent.id 
                    ? 'bg-blue-950/40 border-l-2 border-cyan-400 text-cyan-100' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <agent.icon className={`w-4 h-4 ${selectedAgent === agent.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-xs font-medium tracking-wide">{agent.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 text-[10px] uppercase tracking-[0.2em] text-blue-500/60 font-bold mb-4 px-2">Neural Status</div>
          <div className="space-y-3 px-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Synthesizer-01</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Parser-Alpha</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Researcher-Omega</span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            </div>
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-blue-900/30">
          <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-blue-900/50 flex items-center justify-center text-[10px] font-bold text-blue-400 uppercase">
              {user[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-white truncate uppercase tracking-wider">{user}</div>
              <div className="text-[9px] text-blue-500 font-mono">AUTHORIZED_SESSION</div>
            </div>
            <button onClick={onLogout} className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content: The Chatbot Interface */}
      <main className="flex-1 flex flex-col bg-dashboard-gradient relative">
        <header className="h-16 border-b border-blue-900/30 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md z-10">
          <div className="flex items-center gap-6">
            <h2 className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Project Scope: <span className="text-white font-semibold">Multi-Agent Orchestration</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] bg-blue-950/30 px-3 py-1.5 rounded-full border border-blue-900/40 text-blue-400 font-mono">
              <Activity className="w-3 h-3" />
              <span>LATENCY: 42ms</span>
            </div>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <Cpu className="w-16 h-16 text-blue-500 mb-6" />
              <h3 className="text-xl font-display font-light text-white tracking-[0.2em] uppercase">System Ready</h3>
              <p className="text-xs uppercase tracking-widest mt-2">Awaiting neural input commands</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold ${
                msg.role === 'user' 
                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                : 'bg-blue-900/30 border border-blue-500/50 text-blue-400'
              }`}>
                {msg.role === 'user' ? 'R' : msg.agent?.[0] || 'S'}
              </div>
              <div className={`max-w-2xl p-4 rounded-2xl border ${
                msg.role === 'user' 
                ? 'bg-slate-800/40 border-slate-700/50 rounded-tr-none' 
                : 'bg-blue-950/20 border-blue-900/30 rounded-tl-none'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex gap-2 mb-3">
                    <span className="text-[9px] bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded border border-blue-800/40 font-mono">
                      {msg.agent}
                    </span>
                    <span className="text-[9px] bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded border border-blue-800/40 font-mono">
                      CONFIDENCE: 98.4%
                    </span>
                  </div>
                )}
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-900/30 border border-blue-500/50 flex-shrink-0 flex items-center justify-center text-blue-400 font-mono text-[10px] animate-pulse">
                M
              </div>
              <div className="p-4 border-l-2 border-blue-500/50 bg-blue-950/10 italic text-slate-400 text-[11px] tracking-wide uppercase">
                Orchestrating agents... Synthesizer-01 is retrieving neural logs
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 bg-black/30 backdrop-blur-md border-t border-blue-900/30">
          <div className="relative max-w-4xl mx-auto group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition-opacity"></div>
            <form onSubmit={handleSend} className="relative bg-[#0a1228] border border-blue-900/50 rounded-xl flex items-center p-1 shadow-2xl">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Query the multi-agent system...`}
                className="bg-transparent border-none focus:outline-none text-slate-200 text-sm flex-1 px-4 py-3 placeholder:text-slate-700"
              />
              <div className="flex gap-2 pr-2">
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:shadow-none active:scale-95"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">Process</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
            <div className="mt-3 flex justify-center gap-6">
              <div className="flex items-center gap-2 text-[9px] text-slate-600 uppercase tracking-widest font-mono">
                <div className="w-1 h-1 rounded-full bg-blue-500/40"></div>
                <span>Agent Collaboration: ON</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-slate-600 uppercase tracking-widest font-mono">
                <div className="w-1 h-1 rounded-full bg-cyan-500/40"></div>
                <span>Language: {language}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Contextual Data */}
      <aside className="w-72 bg-[#050b1a] border-l border-blue-900/40 p-6 flex flex-col z-20">
        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-6">Contextual Analysis</div>
        
        <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/30">
            <div className="text-[9px] text-slate-500 uppercase font-bold mb-3 tracking-widest">Resource Allocation</div>
            <div className="flex items-end gap-1.5 h-16">
              <div className="flex-1 bg-blue-600/40 rounded-sm" style={{ height: '40%' }}></div>
              <div className="flex-1 bg-blue-600/70 rounded-sm shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ height: '85%' }}></div>
              <div className="flex-1 bg-blue-600/30 rounded-sm" style={{ height: '30%' }}></div>
              <div className="flex-1 bg-blue-600/60 rounded-sm" style={{ height: '60%' }}></div>
              <div className="flex-1 bg-cyan-600/80 rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.4)]" style={{ height: '95%' }}></div>
            </div>
            <div className="mt-2 text-right text-[10px] font-mono text-blue-400 tracking-tighter">7.4 PFLOPS / ACTIVE</div>
          </div>

          <div className="space-y-3">
            <div className="text-[9px] text-slate-500 uppercase font-bold mb-3 tracking-widest">Agent Activity Logs</div>
            <div className="text-[10px] font-mono p-2 bg-black/40 border border-blue-900/20 rounded text-green-400/60 leading-tight">
              [14:22:01] SYNTH_INIT_01
            </div>
            <div className="text-[10px] font-mono p-2 bg-black/40 border border-blue-900/20 rounded text-blue-400/60 leading-tight">
              [14:22:05] DATA_FETCH_SUCCESS
            </div>
            <div className="text-[10px] font-mono p-2 bg-black/40 border border-blue-900/20 rounded text-cyan-400/60 leading-tight">
              [14:23:12] MATRIX_VLD_PASS
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
             <div className="flex items-center gap-2 mb-3">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Knowledge Base</span>
             </div>
             <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                   <span className="text-slate-500">CORPUS_SIZE</span>
                   <span className="text-blue-400 font-mono">1.2 TB</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                   <span className="text-slate-500">INDEX_STATUS</span>
                   <span className="text-green-500 font-mono">OPTIMIZED</span>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-auto pt-6">
           <div className="text-[9px] text-slate-500 uppercase font-bold mb-3 tracking-widest">Core Stability</div>
           <div className="flex items-center gap-3">
             <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '75%' }}
                 className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" 
               />
             </div>
             <span className="text-[10px] font-mono text-cyan-400">75%</span>
           </div>
        </div>
      </aside>
    </div>
  );
};
