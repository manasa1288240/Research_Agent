import { motion } from "motion/react";
import React from "react";

export const Background: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div id="app-background" className="h-screen w-full bg-[#020617] relative overflow-hidden font-sans flex flex-col">
      {/* Sophisticated Radial Gradient */}
      <div className="absolute inset-0 bg-dashboard-gradient pointer-events-none" />
      
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};
