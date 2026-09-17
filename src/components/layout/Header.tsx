import React from 'react';
import { Target, Compass, Radio, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-[#122b1d] bg-[#060e09]/95 backdrop-blur-sm sticky top-0 z-50 select-none">
      <div className="max-w-[1720px] mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Left: Brand / System Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#05ffa1]/70 flex items-center justify-center bg-[#0b1a11] text-[#05ffa1] shadow-[0_0_8px_rgba(5,255,161,0.25)]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono-tech font-bold tracking-wider text-sm sm:text-base text-white">
                TACTICAL ARTILLERY HUD &amp; FLIGHT REPLAY CONSOLE
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#0b1a11] border border-[#05ffa1]/50 text-[#05ffa1] font-mono-tech uppercase font-bold">
                HUD PFD / REPLAY
              </span>
            </div>
            <div className="text-[11px] font-mono-tech text-[#4e7a5e] tracking-widest flex items-center gap-2">
              <span>BALLISTIC ATTITUDE DIRECTOR</span>
              <span className="text-[#193a26]">•</span>
              <span>TELEMETRY TIME-HISTORY</span>
              <span className="text-[#193a26]">•</span>
              <span>FUZE LOGIC</span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry link status */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 text-[11px] font-mono-tech text-[#849588] pr-3 border-r border-[#133822]">
            <div className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-[#05ffa1]" />
              <span>RF LINK: <strong className="text-white">100%</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#05ffa1]" />
              <span>INS/GPS: <strong className="text-white">LOCKED</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-[#06100a] border border-[#133822] text-[#05ffa1] text-xs font-mono-tech tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#05ffa1] animate-pulse" />
            <span>HUD CONSOLE READY</span>
          </div>
        </div>
      </div>
    </header>
  );
};
