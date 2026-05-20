import { motion, AnimatePresence } from "motion/react";
import { Send, Trash2, LogOut, Plus, MessageSquare, Clock } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";

interface Message {
  role: 'user' | 'assistant';
  text: string;
  agent?: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ResearchDashboardProps {
  user: string;
  language: string;
  onLogout: () => void;
}

export const ResearchDashboard: React.FC<ResearchDashboardProps> = ({ user, language, onLogout }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState('Coordinator');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('research_chats');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChats(parsedChats);
        if (parsedChats.length > 0) {
          const lastChat = parsedChats[parsedChats.length - 1];
          setCurrentChatId(lastChat.id);
          setMessages(lastChat.messages);
        } else {
          createNewChat();
        }
      } catch (err) {
        console.error('Failed to load chats:', err);
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('research_chats', JSON.stringify(chats));
  }, [chats]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Chat - ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    setMessages([]);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      if (chats.length > 1) {
        const remainingChats = chats.filter(c => c.id !== chatId);
        const nextChat = remainingChats[remainingChats.length - 1];
        setCurrentChatId(nextChat.id);
        setMessages(nextChat.messages);
      } else {
        createNewChat();
      }
    }
  };

  const switchChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const updateCurrentChat = (newMessages: Message[]) => {
    setMessages(newMessages);
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: newMessages, updatedAt: new Date() }
        : chat
    ));
  };

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

    const newMessages = [...messages, userMessage];
    updateCurrentChat(newMessages);
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

      updateCurrentChat([...newMessages, assistantMessage]);
      
      // Update chat title based on first message
      if (messages.length === 0) {
        const title = input.substring(0, 40) + (input.length > 40 ? '...' : '');
        setChats(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, title }
            : chat
        ));
      }
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      updateCurrentChat([...newMessages, {
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
      {/* Left Navigation: Chat Sidebar */}
      <aside className="w-64 bg-[#050b1a] border-r border-blue-900/40 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] flex items-center justify-center">
            <span className="font-bold text-white text-sm">M</span>
          </div>
          <span className="text-lg font-display font-semibold tracking-tight text-blue-400">MARS <span className="text-[10px] align-top opacity-50 font-mono">v2.0</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-3 overflow-y-auto no-scrollbar py-4 flex flex-col">
          {/* New Chat Button */}
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all font-medium text-sm mb-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>

          {/* Chat History Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="text-[10px] uppercase tracking-[0.2em] text-blue-500/60 font-bold mb-3 px-2">Chat History</div>
            
            {chats.length === 0 ? (
              <div className="text-[11px] text-slate-500 italic px-2 py-3">No chats yet</div>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-start gap-2 p-2 rounded-lg transition-all cursor-pointer ${
                      currentChatId === chat.id 
                        ? 'bg-blue-950/40 border-l-2 border-cyan-400' 
                        : 'hover:bg-white/5 border-l-2 border-transparent'
                    }`}
                  >
                    <button
                      onClick={() => switchChat(chat.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${currentChatId === chat.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className={`text-xs truncate ${currentChatId === chat.id ? 'text-cyan-100' : 'text-slate-400'}`}>
                          {chat.title}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-600 mt-0.5 ml-5">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              Research Chat: <span className="text-white font-semibold">{chats.find(c => c.id === currentChatId)?.title || 'New Chat'}</span>
            </h2>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <MessageSquare className="w-16 h-16 text-blue-500 mb-6" />
              <h3 className="text-xl font-display font-light text-white tracking-[0.2em] uppercase">Start a New Conversation</h3>
              <p className="text-xs uppercase tracking-widest mt-2">Ask about any research topic</p>
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
                placeholder="Ask your research question..."
                className="bg-transparent border-none focus:outline-none text-slate-200 text-sm flex-1 px-4 py-3 placeholder:text-slate-700"
              />
              <div className="flex gap-2 pr-2">
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:shadow-none active:scale-95"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
