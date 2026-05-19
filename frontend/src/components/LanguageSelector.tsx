import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Languages, Check, ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  current: string;
  onSelect: (lang: string) => void;
}

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", "Hindi"
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ current, onSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed top-4 right-8 z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-950/40 border border-blue-800/50 rounded-lg px-3 py-2 group hover:border-blue-700/60 hover:bg-blue-950/60 transition-all"
      >
        <Languages className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[11px] font-bold tracking-widest text-slate-300">{current.toUpperCase().slice(0, 2)}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 mt-2 w-40 bg-[#0a1228] backdrop-blur-2xl border border-blue-900/40 rounded-lg overflow-hidden shadow-2xl p-2"
            >
              <div className="space-y-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      onSelect(lang);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-left text-sm ${
                      current === lang 
                        ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40' 
                        : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-semibold tracking-wide">{lang}</span>
                    {current === lang && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
