import React from 'react';
import { SimulationResult, TrajectorySample } from '../../types/simulation';

interface TrajectoryCanvasProps {
  result: SimulationResult;
  currentProgress: number;
  currentPoint: TrajectorySample;
}

export const TrajectoryCanvas: React.FC<TrajectoryCanvasProps> = ({
  result,
  currentProgress,
  currentPoint,
}) => {
  const viewBoxWidth = 1000;
  const viewBoxHeight = 520;
  const paddingPx = 70;

  // Auto-fit: compute bounding box across every point we might draw, then map
  // the physically-derived (arbitrary-scale) coordinates into the SVG canvas.
  const allPoints = [
    ...result.nominalTrajectory.map((s) => s.position),
    ...result.trajectory.map((s) => s.position),
    result.startPosition,
    result.targetPosition,
  ];
  const minX = Math.min(...allPoints.map((p) => p.x));
  const maxX = Math.max(...allPoints.map((p) => p.x));
  const minY = Math.min(...allPoints.map((p) => p.y));
  const maxY = Math.max(...allPoints.map((p) => p.y));
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);

  const drawWidth = viewBoxWidth - paddingPx * 2;
  const drawHeight = viewBoxHeight - paddingPx * 2 - 40;

  const toSvgX = (x: number) => paddingPx + ((x - minX) / spanX) * drawWidth;
  const toSvgY = (y: number) => viewBoxHeight - paddingPx - ((y - minY) / spanY) * drawHeight;

  const pathFrom = (samples: TrajectorySample[]) =>
    `M ${samples.map((s) => `${toSvgX(s.position.x)},${toSvgY(s.position.y)}`).join(' L ')}`;

  const nominalPathD = pathFrom(result.nominalTrajectory);

  const activeSeries = result.trajectory.filter((p) => p.progress <= currentProgress);
  const simulatedPathD = activeSeries.length > 0 ? pathFrom(activeSeries) : '';
  const fullSimPathD = pathFrom(result.trajectory);

  const currentSvgX = toSvgX(currentPoint.position.x);
  const currentSvgY = toSvgY(currentPoint.position.y);

  const startSvgX = toSvgX(result.startPosition.x);
  const startSvgY = toSvgY(result.startPosition.y);

  const targetSvgX = toSvgX(result.targetPosition.x);
  const targetSvgY = toSvgY(result.targetPosition.y);

  const correctionEvent = result.correctionEvents[0] ?? null;
  const hasReachedCorrection = correctionEvent !== null && currentProgress >= correctionEvent.progress;
  const correctionSvgX = correctionEvent ? toSvgX(correctionEvent.position.x) : 0;
  const correctionSvgY = correctionEvent ? toSvgY(correctionEvent.position.y) : 0;

  const settings = result.configurationSnapshot.settings;

  return (
    <div className="w-full h-full min-h-[360px] lg:min-h-[460px] bg-[#030704] border border-[#0e2518] relative overflow-hidden radar-grid select-none flex flex-col justify-between">
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <span className="text-[11px] font-mono-tech text-[#4e7a5e] tracking-wider uppercase">
          RELATIVE COORDINATE VIEW
        </span>
        <div className="border border-[#05ffa1]/40 bg-[#06100a]/80 px-2 py-0.5 text-[10px] font-mono-tech text-[#05ffa1] tracking-widest uppercase">
          CONCEPTUAL SIMULATION
        </div>
      </div>

      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full flex-1"
        preserveAspectRatio="xMidYMid meet"
      >
        <line
          x1={paddingPx - 20}
          y1={viewBoxHeight - paddingPx}
          x2={viewBoxWidth - paddingPx + 20}
          y2={viewBoxHeight - paddingPx}
          stroke="#0f2918"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {settings.showNominalTrajectory && (
          <path d={nominalPathD} fill="none" stroke="#1d4830" strokeWidth="2" strokeDasharray="6 6" />
        )}

        {settings.showSimulatedTrajectory && (
          <path d={fullSimPathD} fill="none" stroke="#0b2416" strokeWidth="1.5" strokeDasharray="3 3" />
        )}

        {settings.showSimulatedTrajectory && simulatedPathD && (
          <path
            d={simulatedPathD}
            fill="none"
            stroke="#05ffa1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Start Point */}
        <g transform={`translate(${startSvgX}, ${startSvgY})`}>
          <circle cx="0" cy="0" r="4.5" fill="#05ffa1" />
          <rect x="-24" y="10" width="48" height="18" fill="#06100a" stroke="#133822" strokeWidth="1" />
          <text x="0" y="22" textAnchor="middle" fill="#849588" fontSize="10" fontFamily="Space Mono, monospace" fontWeight="bold">
            START
          </text>
        </g>

        {/* Target Point */}
        {settings.showTarget && (
          <g transform={`translate(${targetSvgX}, ${targetSvgY})`}>
            <circle cx="0" cy="0" r="14" fill="none" stroke="#05ffa1" strokeWidth="1.2" opacity="0.8" />
            <circle cx="0" cy="0" r="4" fill="#05ffa1" />
            <line x1="-24" y1="0" x2="24" y2="0" stroke="#05ffa1" strokeWidth="1" opacity="0.7" />
            <line x1="0" y1="-24" x2="0" y2="24" stroke="#05ffa1" strokeWidth="1" opacity="0.7" />
            <g transform="translate(-28, -46)">
              <rect x="0" y="0" width="60" height="18" fill="#06100a" stroke="#05ffa1" strokeWidth="1" />
              <text x="30" y="13" textAnchor="middle" fill="#05ffa1" fontSize="9" fontFamily="Space Mono, monospace" fontWeight="bold">
                TARGET
              </text>
            </g>
          </g>
        )}

        {/* Correction Event */}
        {settings.showCorrectionEvents && correctionEvent && hasReachedCorrection && (
          <g transform={`translate(${correctionSvgX}, ${correctionSvgY})`}>
            <polygon points="0,-8 8,0 0,8 -8,0" fill="#05ffa1" stroke="#030704" strokeWidth="1.5" />
            <g transform="translate(14, -40)">
              <rect x="0" y="0" width="130" height="18" fill="#06100a" stroke="#05ffa1" strokeWidth="1" />
              <text x="65" y="13" textAnchor="middle" fill="#05ffa1" fontSize="9" fontFamily="Space Mono, monospace" fontWeight="bold">
                CORRECTION EVENT
              </text>
            </g>
          </g>
        )}

        {/* Current Position */}
        <g transform={`translate(${currentSvgX}, ${currentSvgY})`}>
          <circle cx="0" cy="0" r="8" fill="#05ffa1" opacity="0.4" />
          <circle cx="0" cy="0" r="4.5" fill="#ffffff" stroke="#05ffa1" strokeWidth="2" />
          <g transform="translate(14, 18)">
            <line x1="0" y1="0" x2="-14" y2="-18" stroke="#05ffa1" strokeWidth="1" opacity="0.7" />
            <rect x="0" y="0" width="106" height="20" fill="#06100a" stroke="#05ffa1" strokeWidth="1" />
            <text x="53" y="14" textAnchor="middle" fill="#05ffa1" fontSize="9" fontFamily="Space Mono, monospace" fontWeight="bold">
              CURRENT POSITION
            </text>
          </g>
        </g>
      </svg>

      <div className="absolute bottom-3 left-4 p-2 bg-[#06100a]/90 border border-[#133822] flex items-center gap-4 text-[10px] font-mono-tech text-[#849588] z-10 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-[1px] border-b border-dashed border-[#4e7a5e]" />
          <span>Nominal Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-[2px] bg-[#05ffa1]" />
          <span className="text-[#05ffa1] font-bold">Simulated Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#05ffa1]">⊙</span>
          <span>Target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#05ffa1]">◆</span>
          <span>Correction Event</span>
        </div>
      </div>
    </div>
  );
};
