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
        className="flex items-center gap-2 bg-blue-950/50 border border-blue-800/60 rounded-lg px-4 py-2 hover:border-blue-700/80 hover:bg-blue-950/70 transition-all shadow-lg"
        title={current}
      >
        <Languages className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-cyan-300 tracking-wide min-w-[60px]">{current}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.94 }}
              className="absolute right-0 mt-2 w-44 bg-[#0a1228] backdrop-blur-2xl border border-blue-900/50 rounded-lg overflow-hidden shadow-2xl"
            >
              <div className="p-2 space-y-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      onSelect(lang);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition-all text-sm font-medium ${
                      current === lang 
                        ? 'bg-blue-600/40 text-cyan-300 border border-blue-500/50' 
                        : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-semibold tracking-wide">{lang}</span>
                    {current === lang && <Check className="w-4 h-4 text-cyan-400" />}
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
