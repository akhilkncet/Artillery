import React from 'react';
import { FuzeConcept } from '../../types/simulation';

interface ShellPreviewProps {
  fuzeConcept: FuzeConcept;
}

const FUZE_LABELS: Record<FuzeConcept, string> = {
  impact: 'IMPACT',
  time: 'TIME',
  proximity: 'PROXIMITY',
  multimode: 'MULTI-MODE',
};

export const ShellPreview: React.FC<ShellPreviewProps> = ({ fuzeConcept }) => {
  return (
    <div className="border border-[#133822] bg-[#06100a] p-4 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-[11px] font-mono-tech text-[#4e7a5e] uppercase tracking-wider">
          Shell / Fuze Concept
        </span>
        <span className="text-[10px] font-mono-tech text-[#05ffa1] font-bold uppercase tracking-widest px-1.5 py-0.5 border border-[#133822] bg-[#0b1a11]">
          {FUZE_LABELS[fuzeConcept]}
        </span>
      </div>

      <svg viewBox="0 0 220 100" className="w-full max-w-[280px] h-auto">
        {/* Body */}
        <path
          d="M 60 20 L 170 20 Q 190 20 190 50 Q 190 80 170 80 L 60 80 Z"
          fill="#0b1a11"
          stroke="#1a442b"
          strokeWidth="1.5"
        />

        {/* Boat-tail */}
        <path d="M 40 32 L 60 20 L 60 80 L 40 68 Z" fill="#0b1a11" stroke="#1a442b" strokeWidth="1.5" />

        {/* Body seam lines */}
        <line x1="90" y1="20" x2="90" y2="80" stroke="#163523" strokeWidth="1" />
        <line x1="130" y1="20" x2="130" y2="80" stroke="#163523" strokeWidth="1" />

        {/* Nose / fuze section — visually reflects the selected fuze concept */}
        <g>
          <path
            d="M 170 20 Q 190 20 190 50 Q 190 80 170 80 L 190 50 Z"
            fill="none"
          />
          <path
            d="M 190 50 L 170 20 Q 190 20 190 50 Q 190 80 170 80 Z"
            fill="#0d2416"
            stroke="#05ffa1"
            strokeWidth="1.5"
          />

          {fuzeConcept === 'impact' && (
            <circle cx="185" cy="50" r="3" fill="#05ffa1" />
          )}

          {fuzeConcept === 'time' && (
            <>
              <circle cx="180" cy="50" r="9" fill="none" stroke="#05ffa1" strokeWidth="1.2" />
              <line x1="180" y1="50" x2="180" y2="44" stroke="#05ffa1" strokeWidth="1.2" />
              <line x1="180" y1="50" x2="185" y2="50" stroke="#05ffa1" strokeWidth="1.2" />
            </>
          )}

          {fuzeConcept === 'proximity' && (
            <>
              <path d="M 178 40 Q 200 50 178 60" fill="none" stroke="#05ffa1" strokeWidth="1.2" opacity="0.9" />
              <path d="M 174 35 Q 205 50 174 65" fill="none" stroke="#05ffa1" strokeWidth="1" opacity="0.55" />
            </>
          )}

          {fuzeConcept === 'multimode' && (
            <>
              <circle cx="177" cy="50" r="6" fill="none" stroke="#05ffa1" strokeWidth="1.2" />
              <path d="M 182 42 Q 198 50 182 58" fill="none" stroke="#05ffa1" strokeWidth="1" opacity="0.75" />
            </>
          )}
        </g>

        {/* Fin */}
        <path d="M 40 40 L 28 34 L 28 46 L 40 44 Z" fill="#0b1a11" stroke="#1a442b" strokeWidth="1" />
        <path d="M 40 60 L 28 54 L 28 66 L 40 56 Z" fill="#0b1a11" stroke="#1a442b" strokeWidth="1" />
      </svg>

      <div className="text-[10px] font-mono-tech text-[#4e7a5e] mt-2 text-center leading-snug">
        Conceptual nose marker reflects the selected fuze mode.
      </div>
    </div>
  );
};
