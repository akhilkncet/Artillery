import React from 'react';
import { SimulationResult, TrajectorySample } from '../../types/simulation';
import { Activity } from 'lucide-react';

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

  // Visual layout boundaries matching reference image
  const paddingLeft = 65;
  const paddingRight = 65;
  const paddingTop = 60;
  const paddingBottom = 75;

  const isPsCap = result.topCap === 'ps_canard_cap';
  const drawWidth = viewBoxWidth - paddingLeft - paddingRight;
  const drawHeight = viewBoxHeight - paddingTop - paddingBottom;
  const groundY = viewBoxHeight - paddingBottom;

  // Coordinate mapping from real simulation data (LocalSimulationEngine)
  const allSamples = [...result.nominalTrajectory, ...result.trajectory];
  const maxX = Math.max(
    result.targetPosition.x,
    ...allSamples.map((p) => p.position.x),
    100
  );
  const minX = Math.min(
    result.startPosition.x,
    ...allSamples.map((p) => p.position.x),
    0
  );
  const maxY = Math.max(
    ...allSamples.map((p) => p.position.y),
    10
  );

  const toSvgX = (wx: number) => {
    const normX = maxX > minX ? (wx - minX) / (maxX - minX) : 0;
    return paddingLeft + normX * drawWidth;
  };

  const toSvgY = (wy: number) => {
    // Vertex is kept comfortably below the top edge with ample margin for callouts
    const normY = maxY > 0 ? wy / (maxY * 1.18) : 0;
    return groundY - normY * drawHeight;
  };

  // 1. Nominal Path from LocalSimulationEngine (pure projectile parabola)
  const nominalSvgPoints = result.nominalTrajectory.map((p) => ({
    x: toSvgX(p.position.x),
    y: toSvgY(p.position.y),
  }));
  const nominalPathD =
    nominalSvgPoints.length > 0
      ? `M ${nominalSvgPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
      : '';

  // 2. Simulated Path from LocalSimulationEngine (atmospheric flight with aerodynamic lift, wind & guidance)
  const simSvgPoints = result.trajectory.map((p) => ({
    x: toSvgX(p.position.x),
    y: toSvgY(p.position.y),
    progress: p.progress,
    correctionActive: p.correctionActive,
  }));
  const fullSimPathD =
    simSvgPoints.length > 0
      ? `M ${simSvgPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
      : '';

  // Active simulated path up to current scrubber progress
  const activeSimPoints = simSvgPoints.filter((p) => p.progress <= currentProgress + 0.001);
  const activeSimPathD =
    activeSimPoints.length > 1
      ? `M ${activeSimPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
      : '';

  // Interpolated vehicle current position
  const currentX = toSvgX(currentPoint.position.x);
  const currentY = toSvgY(currentPoint.position.y);

  // Key reference points
  const startPoint = { x: toSvgX(result.startPosition.x), y: groundY };
  const targetPoint = { x: toSvgX(result.targetPosition.x), y: groundY };

  // Correction event point (diamond ◆ at crest of stage 1 climb)
  const corrSample =
    result.trajectory.find((p) => p.correctionActive) ??
    result.trajectory[Math.min(result.trajectory.length - 1, Math.floor(result.trajectory.length * 0.31))];
  const corrPoint = { x: toSvgX(corrSample.position.x), y: toSvgY(corrSample.position.y) };

  const strokeColor = isPsCap ? '#00FF00' : '#FF3B30';

  return (
    <div className="w-full h-full min-h-[440px] flex flex-col bg-[#202124] border border-[#33363D] rounded-lg overflow-hidden select-none font-mono-tech shadow-xl">
      {/* Avionics Card Header matching PFD and FuzeShellCard */}
      <div className="bg-[#18191C] px-3.5 py-2 border-b border-[#2D3138] flex items-center justify-between text-[11px] shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#00FFFF]" />
          <span className="text-white font-bold tracking-wider uppercase">
            RELATIVE COORDINATE TRAJECTORY DISPLAY
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 border border-[#2D3138] bg-[#121316] text-[#8A8F9E] text-[10px]">
            STANAG 4355 MPM
          </span>
          <span
            className={`px-2 py-0.5 border font-bold text-[10px] rounded-sm ${
              isPsCap
                ? 'border-[#00FF00] bg-[#122416] text-[#00FF00]'
                : 'border-[#FF3B30] bg-[#2E1414] text-[#FF3B30]'
            }`}
          >
            {isPsCap ? '2-AXIS CANARD GUIDED' : 'UNGUIDED BALLISTIC'}
          </span>
        </div>
      </div>

      {/* Inner HUD Canvas */}
      <div className="relative flex-1 w-full bg-[#121316] overflow-hidden flex flex-col justify-between">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full flex-1"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Tactical oscilloscope coordinate grid matching cockpit theme */}
            <pattern
              id="tacticalHUDGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1B202B"
                strokeWidth="0.8"
              />
            </pattern>

            {/* Major grid lines */}
            <pattern
              id="majorHUDGrid"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <rect width="120" height="120" fill="url(#tacticalHUDGrid)" />
              <path
                d="M 120 0 L 0 0 0 120"
                fill="none"
                stroke="#252C3A"
                strokeWidth="1.2"
              />
            </pattern>

            {/* High-intensity glow filter for illuminated active path */}
            <filter id="hudNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur1" />
              <feGaussianBlur stdDeviation="5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. BACKGROUND GRID */}
          <rect width="100%" height="100%" fill="#121316" />
          <rect width="100%" height="100%" fill="url(#majorHUDGrid)" />

          {/* Ground Reference Baseline */}
          <line
            x1="30"
            y1={groundY}
            x2={viewBoxWidth - 30}
            y2={groundY}
            stroke="#2B3546"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />

          {/* 2. NOMINAL PATH (DASHED REFERENCE DIRECTED ARTERY) */}
          <path
            d={nominalPathD}
            fill="none"
            stroke="#556176"
            strokeWidth="2.2"
            strokeDasharray="6 6"
            opacity="0.9"
          />

          {/* 3. FULL SIMULATED PATH (PROJECTED TRACE WITH ATMOSPHERIC TURBULENCE) */}
          <path
            d={fullSimPathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.22"
          />

          {/* Active Illuminated Simulated Path with Glow */}
          {activeSimPathD && (
            <path
              d={activeSimPathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3.0"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#hudNeonGlow)"
            />
          )}

          {/* 4. START MARKER & CALLOUT BOX */}
          <g transform={`translate(${startPoint.x}, ${startPoint.y})`}>
            <circle cx="0" cy="0" r="5" fill="#00FFFF" />
            <circle cx="0" cy="0" r="9" fill="none" stroke="#00FFFF" strokeWidth="1.2" opacity="0.6" />
            {/* Tick line pointing down */}
            <line x1="0" y1="9" x2="0" y2="20" stroke="#00FFFF" strokeWidth="1" />
            {/* Box: [ START ] */}
            <rect
              x="-28"
              y="20"
              width="56"
              height="22"
              fill="#18191C"
              stroke="#2D3138"
              strokeWidth="1.2"
              rx="2"
            />
            <text
              x="0"
              y="35"
              textAnchor="middle"
              fill="#8A8F9E"
              fontSize="10"
              fontFamily="Space Mono, monospace"
              fontWeight="bold"
            >
              START
            </text>
          </g>

          {/* 5. CORRECTION EVENT MARKER & CALLOUT BOX (MATCHING REFERENCE IMAGE) */}
          {isPsCap && (
            <g transform={`translate(${corrPoint.x}, ${corrPoint.y})`}>
              {/* Diamond symbol ◆ */}
              <polygon
                points="0,-7 7,0 0,7 -7,0"
                fill="#00FF00"
                stroke="#00FF00"
                strokeWidth="1.2"
                className="drop-shadow-[0_0_6px_rgba(0,255,0,0.8)]"
              />
              {/* Vertical connecting line directly upward */}
              <line x1="0" y1="-7" x2="0" y2="-22" stroke="#00FF00" strokeWidth="1.2" />
              {/* Box: [ CORRECTION EVENT ] centered right over diamond */}
              <rect
                x="-66"
                y="-44"
                width="132"
                height="22"
                fill="#122416"
                stroke="#00FF00"
                strokeWidth="1.2"
                rx="2"
              />
              <text
                x="0"
                y="-29"
                textAnchor="middle"
                fill="#00FF00"
                fontSize="9.5"
                fontFamily="Space Mono, monospace"
                fontWeight="bold"
                letterSpacing="0.04em"
              >
                CORRECTION EVENT
              </text>
            </g>
          )}

          {/* 6. TARGET MARKER & CALLOUT BOX */}
          <g transform={`translate(${targetPoint.x}, ${targetPoint.y})`}>
            {/* Target crosshair with concentric rings */}
            <circle cx="0" cy="0" r="15" fill="none" stroke="#00FFFF" strokeWidth="1.4" />
            <circle cx="0" cy="0" r="8" fill="none" stroke="#00FFFF" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="2.5" fill="#00FFFF" />
            <line x1="-22" y1="0" x2="22" y2="0" stroke="#00FFFF" strokeWidth="1.2" />
            <line x1="0" y1="-22" x2="0" y2="22" stroke="#00FFFF" strokeWidth="1.2" />

            {/* Vertical connecting line straight up to TARGET box */}
            <line x1="0" y1="-15" x2="0" y2="-28" stroke="#00FFFF" strokeWidth="1.2" />

            {/* Box: [ TARGET ] */}
            <rect
              x="-30"
              y="-50"
              width="60"
              height="22"
              fill="#18191C"
              stroke="#00FFFF"
              strokeWidth="1.2"
              rx="2"
            />
            <text
              x="0"
              y="-35"
              textAnchor="middle"
              fill="#00FFFF"
              fontSize="10"
              fontFamily="Space Mono, monospace"
              fontWeight="bold"
            >
              TARGET
            </text>
          </g>

          {/* 7. CURRENT POSITION CALLOUT BOX */}
          {currentProgress > 0.02 && (
            <g transform={`translate(${currentX}, ${currentY})`}>
              {/* Outer halo ring */}
              <circle
                cx="0"
                cy="0"
                r="12"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.4"
                opacity="0.7"
              />
              {/* Inner core pip */}
              <circle
                cx="0"
                cy="0"
                r="4.5"
                fill="#FFFFFF"
                stroke={strokeColor}
                strokeWidth="2"
                className="drop-shadow-[0_0_8px_#FFFFFF]"
              />

              {/* Tick line connecting to callout */}
              <line x1="0" y1="4" x2="16" y2="20" stroke={strokeColor} strokeWidth="1.2" />
              <line x1="16" y1="20" x2="26" y2="20" stroke={strokeColor} strokeWidth="1.2" />

              {/* Box: [ CURRENT POSITION ] */}
              <rect
                x="26"
                y="9"
                width="134"
                height="22"
                fill="#18191C"
                stroke={strokeColor}
                strokeWidth="1.2"
                rx="2"
              />
              <text
                x="93"
                y="24"
                textAnchor="middle"
                fill={strokeColor}
                fontSize="9.5"
                fontFamily="Space Mono, monospace"
                fontWeight="bold"
                letterSpacing="0.04em"
              >
                CURRENT POSITION
              </text>
            </g>
          )}

          {/* 8. BOTTOM LEGEND BOX (MATCHING AVIONICS COCKPIT THEME) */}
          <g transform="translate(30, 460)">
            <rect
              x="0"
              y="0"
              width="505"
              height="34"
              fill="rgba(24, 25, 28, 0.95)"
              stroke="#2D3138"
              strokeWidth="1.2"
              rx="3"
            />

            {/* Legend 1: Nominal Path */}
            <line x1="18" y1="17" x2="46" y2="17" stroke="#556176" strokeWidth="2.2" strokeDasharray="5 4" />
            <text x="54" y="21" fill="#8A8F9E" fontSize="11" fontFamily="Space Mono, monospace">
              Nominal Path
            </text>

            {/* Legend 2: Simulated Path */}
            <line x1="168" y1="17" x2="198" y2="17" stroke={strokeColor} strokeWidth="2.8" />
            <text x="206" y="21" fill={strokeColor} fontSize="11" fontFamily="Space Mono, monospace" fontWeight="bold">
              Simulated Path
            </text>

            {/* Legend 3: Target */}
            <circle cx="340" cy="17" r="5.5" fill="none" stroke="#00FFFF" strokeWidth="1.2" />
            <circle cx="340" cy="17" r="2" fill="#00FFFF" />
            <text x="352" y="21" fill="#8A8F9E" fontSize="11" fontFamily="Space Mono, monospace">
              Target
            </text>

            {/* Legend 4: Correction Event */}
            <polygon points="420,17 424.5,12.5 429,17 424.5,21.5" fill="#00FF00" stroke="#00FF00" strokeWidth="0.8" />
            <text x="436" y="21" fill="#8A8F9E" fontSize="11" fontFamily="Space Mono, monospace">
              Correction Event
            </text>
          </g>

          {/* Live Telemetry Coordinate Readout at bottom right */}
          <g transform="translate(680, 474)">
            <text
              x="290"
              y="10"
              textAnchor="end"
              fill="#8A8F9E"
              fontSize="10.5"
              fontFamily="Space Mono, monospace"
            >
              T+{currentPoint.time.toFixed(1)}s • RANGE:{' '}
              <tspan fill="#00FFFF">{currentPoint.position.x.toFixed(0)}m</tspan> • ALT:{' '}
              <tspan fill="#00FFFF">{currentPoint.position.y.toFixed(0)}m</tspan> • DEV:{' '}
              <tspan fill={isPsCap ? '#00FF00' : '#FF3B30'}>{currentPoint.deviation.toFixed(1)}m</tspan>
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
