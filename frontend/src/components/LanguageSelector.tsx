import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Languages, Check } from "lucide-react";

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
        className="flex items-center bg-blue-950/50 border border-blue-800/40 rounded-lg p-1 group hover:border-blue-700/60 transition-all"
      >
        <div className="flex items-center">
            {LANGUAGES.slice(0, 3).map((lang) => (
                <div 
                    key={lang}
                    className={`px-3 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        current === lang 
                        ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(lang);
                    }}
                >
                    {lang.slice(0, 2).toUpperCase()}
                </div>
            ))}
            <div 
                className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-300 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                ...
            </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-48 bg-[#0a1228] backdrop-blur-2xl border border-blue-900/30 rounded-xl overflow-hidden shadow-2xl p-2"
            >
              <div className="grid grid-cols-1 gap-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      onSelect(lang);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                      current === lang 
                        ? 'bg-blue-600/20 text-white border border-blue-500/20' 
                        : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold tracking-widest uppercase">{lang}</span>
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
