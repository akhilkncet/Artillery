import React from 'react';
import { SimulationConfiguration } from '../../types/simulation';

interface TrajectoryMiniPreviewProps {
  config: SimulationConfiguration;
}

export const TrajectoryMiniPreview: React.FC<TrajectoryMiniPreviewProps> = ({ config }) => {
  const isGuided = config.control.method !== 'passive' && config.control.correctionEnabled;
  const isCanard = config.control.method === 'canard';

  const devFactor =
    config.environment.disturbance === 'high' ? 24 : config.environment.disturbance === 'moderate' ? 14 : 6;

  const nominalPath = 'M 20 95 Q 120 15 220 95';

  let simulatedPath = '';
  if (!isGuided) {
    const endX = 220 - devFactor * 0.8;
    const endY = 95 - devFactor * 0.5;
    simulatedPath = `M 20 95 Q ${120 - devFactor * 0.5} ${20 - devFactor} ${endX} ${endY}`;
  } else if (isCanard) {
    simulatedPath = `M 20 95 Q ${100 - devFactor} ${18 - devFactor} 135 48 T 220 95`;
  } else {
    simulatedPath = `M 20 95 Q ${110 - devFactor} ${18 - devFactor} 145 52 T 220 95`;
  }

  return (
    <div className="border border-[#133822] bg-[#06100a] p-2 flex flex-col h-full">
      <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#4e7a5e] mb-1">
        <span>TRAJECTORY PREVIEW</span>
        <span className="text-[#05ffa1]">{isGuided ? 'GUIDED' : 'BALLISTIC'}</span>
      </div>

      <div className="relative flex-1 min-h-[90px] bg-[#030704] border border-[#0e2518] flex items-center justify-center overflow-hidden radar-grid-fine">
        <svg viewBox="0 0 240 110" className="w-full h-full">
          <rect x="216" y="91" width="8" height="8" fill="none" stroke="#ff3b30" strokeWidth="1.2" />
          <circle cx="220" cy="95" r="1.5" fill="#ff3b30" />
          <circle cx="20" cy="95" r="2.5" fill="#05ffa1" />

          {config.settings.showNominalTrajectory && (
            <path d={nominalPath} fill="none" stroke="#4e7a5e" strokeWidth="1.2" strokeDasharray="3 3" />
          )}

          {config.settings.showSimulatedTrajectory && (
            <path d={simulatedPath} fill="none" stroke="#05ffa1" strokeWidth="1.8" />
          )}

          {isGuided && config.settings.showCorrectionEvents && (
            <polygon points="135,45 138,48 135,51 132,48" fill="#05ffa1" stroke="#030704" strokeWidth="0.8" />
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono-tech text-[#849588] mt-1.5 px-1">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-[1px] bg-[#4e7a5e] border-b border-dashed border-[#849588]" />
          <span>Nominal</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-[2px] bg-[#05ffa1]" />
          <span className="text-[#05ffa1]">{isGuided ? 'Guided' : 'Simulated'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 border border-[#ff3b30]" />
          <span className="text-[#ff3b30]">Target</span>
        </div>
      </div>
    </div>
  );
};
