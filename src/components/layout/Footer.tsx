import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#2B2E36] bg-[#121316] py-2.5 text-[11px] font-mono-tech text-[#8A8F9E] tracking-wider select-none">
      <div className="max-w-[1720px] mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00FF00]" />
          <span className="text-[#00FF00] font-bold">EFIS AVIONICS DISPLAY</span>
          <span className="text-[#4E5360]">•</span>
          <span>STANAG 4355 / MODIFIED POINT MASS BALLISTICS</span>
        </div>
        <div className="text-[10px] text-[#6B7180]">
          COLOR CODE: <span className="text-[#FF00FF]">MAGENTA (TARGET/GPS)</span> | <span className="text-[#00FFFF]">CYAN (DATA)</span> | <span className="text-[#00FF00]">GREEN (ACTIVE)</span> | <span className="text-[#FFA500]">AMBER (CAUTION)</span> | <span className="text-[#FF0000]">RED (WARN)</span>
        </div>
      </div>
    </footer>
  );
};
