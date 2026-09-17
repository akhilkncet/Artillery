import React from 'react';
import { TrajectorySample } from '../../types/simulation';

interface PrimaryFlightDisplayProps {
  currentPoint: TrajectorySample;
  previousPoint?: TrajectorySample;
  totalDuration: number;
  chargeZone?: number;
  canardActive?: boolean;
}

export const PrimaryFlightDisplay: React.FC<PrimaryFlightDisplayProps> = ({
  currentPoint,
  previousPoint,
  canardActive = false,
}) => {
  // Dynamic kinematics calculations
  const vx = previousPoint ? (currentPoint.position.x - previousPoint.position.x) : 80;
  const vy = previousPoint ? (currentPoint.position.y - previousPoint.position.y) : 60;
  const speed = Math.sqrt(vx * vx + vy * vy) * 12; // Speed in m/s
  const mach = speed / 340; // Mach number

  // Pitch angle in degrees: arctan2(vy, vx)
  const pitchAngle = Math.atan2(vy, Math.max(1, Math.abs(vx))) * (180 / Math.PI);
  // Roll angle in degrees: simulated spin and canard stabilization
  const rollAngle = canardActive
    ? Math.sin(currentPoint.time * 4) * 6
    : ((currentPoint.time * 720) % 360) - 180;

  const altitude = Math.max(0, currentPoint.position.y); // Real meters
  const verticalSpeed = (vy * 12).toFixed(1); // m/s climb or descent
  const heading = (90 + currentPoint.deviation * 0.4) % 360; // Degrees

  // G-load estimate
  const gLoad = Math.max(1.0, (1.0 + Math.abs(vy) * 0.4 + (currentPoint.progress < 0.1 ? 8 : 0))).toFixed(1);

  // Flight director guidance offset for steerable flight path crossbars
  const pitchTrim = canardActive ? Math.sin(currentPoint.time * 6) * 8 : 0;
  const yawTrim = canardActive ? -currentPoint.deviation * 1.5 : 0;

  // Horizon translation based on pitch (pixels per degree)
  const pitchPxPerDeg = 2.4;
  const horizonTranslateY = pitchAngle * pitchPxPerDeg;

  return (
    <div className="flex flex-col bg-[#202124] border border-[#33363D] rounded-none overflow-hidden select-none font-mono-tech shadow-xl">
      {/* Top HUD / PFD Flight Mode Annunciator (FMA) Bar */}
      <div className="bg-[#18191C] px-3 py-1.5 border-b border-[#2D3138] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-3">
          <span className="text-[#00FF00] font-bold tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse" />
            PFD-155 / EFIS
          </span>
          <span className="text-[#8A8F9E] hidden sm:inline">ATTITUDE DIRECTOR</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span
            className={`px-1.5 py-0.5 border font-bold ${
              canardActive
                ? 'border-[#00FF00] text-[#00FF00] bg-[#112616]'
                : 'border-[#424652] text-[#8A8F9E]'
            }`}
          >
            {canardActive ? 'CANARD GUIDED' : 'BALLISTIC FREE'}
          </span>
          <span className="text-[#FFA500] font-bold">M {mach.toFixed(2)}</span>
        </div>
      </div>

      {/* Main EFIS Instrument Display (Artificial Horizon, Speed Tape, Alt Tape) */}
      <div className="relative w-full h-[250px] sm:h-[280px] bg-[#121316] overflow-hidden border-b border-[#2D3138]">
        {/* ARTIFICIAL HORIZON SPHERE */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[320px] h-[320px] rounded-full overflow-hidden relative border-2 border-[#383C46] shadow-[inset_0_0_35px_rgba(0,0,0,0.9)]"
            style={{
              transform: `rotate(${-rollAngle * 0.15}deg)`,
              transition: 'transform 0.05s linear',
            }}
          >
            {/* Upper Sky Arc (Deep Aviation Sky Blue) */}
            <div
              className="absolute inset-x-0 top-0 bottom-1/2 bg-gradient-to-b from-[#143254] to-[#1E4D82]"
              style={{
                transform: `translateY(${horizonTranslateY}px)`,
                transition: 'transform 0.05s linear',
              }}
            />
            {/* Lower Ground Arc (Avionics Earth Brown) */}
            <div
              className="absolute inset-x-0 top-1/2 bottom-0 bg-gradient-to-b from-[#3D2C1E] to-[#241A12]"
              style={{
                transform: `translateY(${horizonTranslateY}px)`,
                transition: 'transform 0.05s linear',
              }}
            />

            {/* Pitch Ladder Lines (Crisp White per EFIS spec) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{
                transform: `translateY(${horizonTranslateY}px)`,
                transition: 'transform 0.05s linear',
              }}
            >
              {/* Horizon Center Line */}
              <div className="w-full flex items-center justify-center">
                <div className="w-18 h-[2px] bg-[#FFFFFF] shadow-[0_0_2px_#FFFFFF]" />
                <div className="w-6 h-[2px] bg-transparent" />
                <div className="w-18 h-[2px] bg-[#FFFFFF] shadow-[0_0_2px_#FFFFFF]" />
              </div>

              {/* +30 deg */}
              <div className="absolute top-[28px] flex items-center gap-2">
                <span className="text-[9px] text-[#FFFFFF] font-mono font-bold">30</span>
                <div className="w-12 h-[1.5px] bg-[#FFFFFF]" />
                <span className="text-[9px] text-[#FFFFFF] font-mono font-bold">30</span>
              </div>

              {/* +20 deg */}
              <div className="absolute top-[58px] flex items-center gap-2">
                <span className="text-[9px] text-[#FFFFFF] font-mono font-bold">20</span>
                <div className="w-16 h-[1.5px] bg-[#FFFFFF]" />
                <span className="text-[9px] text-[#FFFFFF] font-mono font-bold">20</span>
              </div>

              {/* +10 deg */}
              <div className="absolute top-[92px] flex items-center gap-2">
                <span className="text-[9px] text-[#FFFFFF] font-mono font-bold">10</span>
                <div className="w-20 h-[1.5px] bg-[#FFFFFF]" />
                <span className="text-[9px] text-[#FFFFFF] font-mono font-bold">10</span>
              </div>

              {/* -10 deg */}
              <div className="absolute bottom-[92px] flex items-center gap-2">
                <span className="text-[9px] text-[#FFA500] font-mono font-bold">10</span>
                <div className="w-20 h-[1.5px] border-b border-dashed border-[#FFA500]" />
                <span className="text-[9px] text-[#FFA500] font-mono font-bold">10</span>
              </div>

              {/* -20 deg */}
              <div className="absolute bottom-[58px] flex items-center gap-2">
                <span className="text-[9px] text-[#FFA500] font-mono font-bold">20</span>
                <div className="w-16 h-[1.5px] border-b border-dashed border-[#FFA500]" />
                <span className="text-[9px] text-[#FFA500] font-mono font-bold">20</span>
              </div>

              {/* -30 deg */}
              <div className="absolute bottom-[28px] flex items-center gap-2">
                <span className="text-[9px] text-[#FF0000] font-mono font-bold">30</span>
                <div className="w-12 h-[1.5px] border-b border-dashed border-[#FF0000]" />
                <span className="text-[9px] text-[#FF0000] font-mono font-bold">30</span>
              </div>
            </div>

            {/* Roll Scale Arc on Top */}
            <svg viewBox="0 0 200 60" className="absolute top-0 inset-x-0 w-full h-[60px] pointer-events-none">
              <path d="M 40 45 A 70 70 0 0 1 160 45" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 6" opacity="0.7" />
              <polygon points="100,12 95,20 105,20" fill="#FFA500" />
            </svg>
          </div>
        </div>

        {/* FLIGHT DIRECTOR (MAGENTA #FF00FF PER AVIONICS SPEC FOR "FLY-TO" GUIDANCE) */}
        {canardActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
            <div
              className="relative w-28 h-28 flex items-center justify-center transition-transform duration-75"
              style={{
                transform: `translate(${yawTrim * 1.5}px, ${pitchTrim * 1.5}px)`,
              }}
            >
              {/* Magenta crossbars */}
              <div className="absolute w-24 h-[2px] bg-[#FF00FF] shadow-[0_0_8px_#FF00FF]" />
              <div className="absolute h-24 w-[2px] bg-[#FF00FF] shadow-[0_0_8px_#FF00FF]" />
              <div className="w-3 h-3 rounded-full border-2 border-[#FF00FF] shadow-[0_0_8px_#FF00FF]" />
            </div>
          </div>
        )}

        {/* CENTER BORESIGHT RETICLE (AIRPLANE / SHELL SYMBOL) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="relative flex items-center justify-center">
            {/* Left wing */}
            <div className="w-8 h-[3px] bg-[#FFA500] shadow-[0_0_4px_#FFA500]" />
            <div className="w-[3px] h-3 bg-[#FFA500] shadow-[0_0_4px_#FFA500]" />
            {/* Center dot */}
            <div className="w-2 h-2 mx-1.5 rounded-full border border-[#FFA500] bg-[#FFA500]" />
            {/* Right wing */}
            <div className="w-[3px] h-3 bg-[#FFA500] shadow-[0_0_4px_#FFA500]" />
            <div className="w-8 h-[3px] bg-[#FFA500] shadow-[0_0_4px_#FFA500]" />
          </div>
        </div>

        {/* SPEED TAPE (LEFT) */}
        <div className="absolute top-2 bottom-6 left-2 w-16 bg-[#18191C]/95 border border-[#33363D] flex flex-col items-center justify-between py-1 z-20 backdrop-blur-sm">
          <span className="text-[9px] text-[#00FFFF] font-bold tracking-wider">SPEED</span>
          
          {/* Rolling ticks indicator */}
          <div className="relative flex-1 w-full flex flex-col justify-around px-1 overflow-hidden">
            <div className="w-full flex justify-between items-center text-[9px] text-[#8A8F9E]">
              <span>-</span>
              <span>{Math.round(speed + 50)}</span>
            </div>
            <div className="w-full flex justify-between items-center text-[9px] text-[#8A8F9E]">
              <span>-</span>
              <span>{Math.round(speed + 25)}</span>
            </div>
            <div className="w-full flex justify-between items-center text-[10px] text-[#FFFFFF] font-bold border-y border-[#00FFFF] py-0.5 bg-[#202124]">
              <span className="text-[#00FFFF] font-bold">►</span>
              <span>{Math.round(speed)}</span>
            </div>
            <div className="w-full flex justify-between items-center text-[9px] text-[#8A8F9E]">
              <span>-</span>
              <span>{Math.max(0, Math.round(speed - 25))}</span>
            </div>
            <div className="w-full flex justify-between items-center text-[9px] text-[#8A8F9E]">
              <span>-</span>
              <span>{Math.max(0, Math.round(speed - 50))}</span>
            </div>
          </div>
          
          <div className="text-[9px] text-[#00FFFF] font-bold">M/S</div>
        </div>

        {/* ALTITUDE TAPE (RIGHT) */}
        <div className="absolute top-2 bottom-6 right-2 w-20 bg-[#18191C]/95 border border-[#33363D] flex flex-col items-center justify-between py-1 z-20 backdrop-blur-sm">
          <span className="text-[9px] text-[#00FFFF] font-bold tracking-wider">ALTITUDE</span>
          
          {/* Rolling altitude numbers */}
          <div className="relative flex-1 w-full flex flex-col justify-around px-1 overflow-hidden">
            <div className="w-full flex justify-between items-center text-[9px] text-[#8A8F9E]">
              <span>{(altitude / 1000 + 0.4).toFixed(1)}k</span>
              <span>-</span>
            </div>
            <div className="w-full flex justify-between items-center text-[9px] text-[#8A8F9E]">
              <span>{(altitude / 1000 + 0.2).toFixed(1)}k</span>
              <span>-</span>
            </div>
            <div className="w-full flex justify-between items-center text-[10px] text-[#FFFFFF] font-bold border-y border-[#00FFFF] py-0.5 bg-[#202124]">
              <span>{(altitude / 1000).toFixed(2)}k</span>
              <span className="text-[#00FFFF] font-bold">◄</span>
            </div>
            <div className="w-full flex justify-between items-center text-[9px] text-[#8A8F9E]">
              <span>{Math.max(0, altitude / 1000 - 0.2).toFixed(1)}k</span>
              <span>-</span>
            </div>
            <div className="w-full flex justify-between items-center text-[9px] text-[#8A8F9E]">
              <span>{Math.max(0, altitude / 1000 - 0.4).toFixed(1)}k</span>
              <span>-</span>
            </div>
          </div>
          
          <div className="text-[9px] text-[#00FFFF] font-bold">KM (MSL)</div>
        </div>

        {/* VERTICAL SPEED INDICATOR (VSI) BUG (CYAN #00FFFF PER SPEC) */}
        <div className="absolute right-23 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20 pointer-events-none">
          <span className="text-[8px] text-[#00FFFF] font-bold">VSI</span>
          <span className={`text-[9px] font-bold px-1 py-0.2 ${Number(verticalSpeed) >= 0 ? 'text-[#00FF00]' : 'text-[#FFA500]'}`}>
            {Number(verticalSpeed) > 0 ? `+${verticalSpeed}` : verticalSpeed}
          </span>
        </div>

        {/* BOTTOM HORIZONTAL COMPASS / HEADING TAPE */}
        <div className="absolute bottom-0 inset-x-0 h-6 bg-[#18191C] border-t border-[#33363D] flex items-center justify-center z-20">
          <div className="relative w-64 h-full flex items-center justify-center overflow-hidden">
            {/* Lubber line marker */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 flex flex-col items-center justify-start z-10 pointer-events-none">
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-[#FFA500]" />
              <div className="w-[1.5px] h-full bg-[#FFA500]" />
            </div>

            {/* Compass degree numbers (Cyan #00FFFF Selected preset bugs) */}
            <div className="flex items-center gap-6 text-[10px] font-mono text-[#8A8F9E]">
              <span>{String(Math.round((heading - 20 + 360) % 360)).padStart(3, '0')}</span>
              <span>{String(Math.round((heading - 10 + 360) % 360)).padStart(3, '0')}</span>
              <span className="text-[#00FFFF] font-bold px-1 bg-[#202124] border border-[#00FFFF]/50">
                {String(Math.round(heading)).padStart(3, '0')}°
              </span>
              <span>{String(Math.round((heading + 10) % 360)).padStart(3, '0')}</span>
              <span>{String(Math.round((heading + 20) % 360)).padStart(3, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Telemetry Status Grid */}
      <div className="px-3 py-2 bg-[#141518] border-t border-[#2D3138] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
        <div>
          <span className="text-[#8A8F9E]">G-LOAD:</span>{' '}
          <span className="text-[#FFFFFF] font-bold">{gLoad} G</span>
        </div>
        <div>
          <span className="text-[#8A8F9E]">CROSS-TRACK:</span>{' '}
          <span className={Math.abs(currentPoint.deviation) > 10 ? 'text-[#FFA500] font-bold' : 'text-[#00FF00] font-bold'}>
            {currentPoint.deviation.toFixed(1)} m
          </span>
        </div>
        <div>
          <span className="text-[#8A8F9E]">DOWNRANGE:</span>{' '}
          <span className="text-[#FFFFFF] font-bold">{(currentPoint.position.x / 1000).toFixed(2)} km</span>
        </div>
        <div>
          <span className="text-[#8A8F9E]">TIME:</span>{' '}
          <span className="text-[#00FFFF] font-bold">T+{currentPoint.time.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};
