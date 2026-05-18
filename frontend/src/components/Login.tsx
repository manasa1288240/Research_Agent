import { motion } from "motion/react";
import { Lock, User, Cpu } from "lucide-react";
import React, { useState } from "react";

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const endpoint = isRegistering ? "/api/register" : "/api/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        if (isRegistering) {
            setSuccess("Account created successfully. You can now login.");
            setIsRegistering(false);
        } else {
            onLogin(username);
        }
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-container" className="flex items-center justify-center h-screen px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[400px]"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.6)] mb-8"
          >
            <span className="text-2xl font-bold text-white">N</span>
          </motion.div>
          <h1 className="text-3xl font-display font-medium tracking-tight text-white mb-2 uppercase italic">
            Nexus <span className="text-blue-400">Mars</span>
          </h1>
          <p className="text-[10px] text-blue-500/60 uppercase tracking-[0.4em] font-bold">
            {isRegistering ? "Access Registration" : "Terminal Clearance"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-blue-950/10 border border-blue-900/30 p-8 rounded-2xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
          {/* Subtle Scanning Line Effect */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-cyan-500/20 z-0 pointer-events-none"
          />

          <div className="space-y-2 relative z-10">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500/60 ml-1">Access ID</label>
            <div className="relative group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="CREATE_OR_ENTER_ID"
                className="w-full bg-[#050b1a] border border-blue-900/40 rounded-lg py-3 px-4 text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all font-mono text-xs placeholder:text-slate-800"
                required
              />
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500/60 ml-1">Secure Key</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050b1a] border border-blue-900/40 rounded-lg py-3 px-4 text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all font-mono text-xs placeholder:text-slate-800"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-[10px] font-mono text-center uppercase tracking-widest bg-red-950/20 py-2 rounded border border-red-900/30"
            >
              [!] ALERT: {error}
            </motion.p>
          )}

          {success && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-400 text-[10px] font-mono text-center uppercase tracking-widest bg-green-950/20 py-2 rounded border border-green-900/30"
            >
              [+] SUCCESS: {success}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative z-10 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-[0.98] disabled:opacity-50 mt-4 uppercase text-[10px] tracking-[0.3em] cursor-pointer"
          >
            {isLoading ? "Synchronizing..." : isRegistering ? "Register New Identity" : "Establish Neural Link"}
          </button>
          
          <div className="mt-6 text-center border-t border-blue-900/20 pt-6 relative z-10 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
                setSuccess("");
              }}
              className="text-[10px] text-cyan-400 hover:text-white uppercase tracking-[0.2em] font-bold transition-colors cursor-pointer"
            >
              {isRegistering ? "→ Use Existing Credentials" : "→ Create New Access ID"}
            </button>
          </div>
        </form>
        
        <div className="mt-8 flex justify-center gap-8 opacity-20">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[9px] font-mono tracking-tighter">SECURE_CHANNEL_v4</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[9px] font-mono tracking-tighter">ENCRYPT_AES_256</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
