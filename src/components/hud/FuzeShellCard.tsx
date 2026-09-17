import React from 'react';
import { FuzeConcept, TrajectorySample, FuzeEvent, TopCapType } from '../../types/simulation';
import { Shield, Zap, Radio, Clock, Crosshair, Sparkles } from 'lucide-react';

interface FuzeShellCardProps {
  fuzeConcept: FuzeConcept;
  onSelectConcept?: (concept: FuzeConcept) => void;
  topCap?: TopCapType;
  onSelectTopCap?: (cap: TopCapType) => void;
  currentPoint: TrajectorySample;
  fuzeEvent?: FuzeEvent;
  totalDuration: number;
}

const FUZE_CONFIGS: Record<
  FuzeConcept,
  { label: string; icon: React.FC<{ className?: string }>; description: string }
> = {
  impact: {
    label: 'POINT DETONATING (IMPACT)',
    icon: Crosshair,
    description: 'Direct kinetic ground contact trigger with inertia deceleration switch.',
  },
  time: {
    label: 'ELECTRONIC TIME (AIRBURST)',
    icon: Clock,
    description: 'Precision crystal chronometer for airburst over target coordinates.',
  },
  proximity: {
    label: 'DOPPLER RADAR PROXIMITY',
    icon: Radio,
    description: 'RF Doppler transceiver sensing ground height of burst (HOB).',
  },
  multimode: {
    label: 'SMART MULTI-MODE',
    icon: Zap,
    description: 'Dual-sensor fusion: Doppler RF proximity with backup contact trigger.',
  },
};

export const FuzeShellCard: React.FC<FuzeShellCardProps> = ({
  fuzeConcept,
  onSelectConcept,
  topCap = 'ps_canard_cap',
  onSelectTopCap,
  currentPoint,
  fuzeEvent,
}) => {
  const currentProgress = currentPoint.progress;
  const isPsCap = topCap === 'ps_canard_cap';

  // Arming state machine
  const isArmed = currentProgress >= 0.15;
  const isCanardDeploy = isPsCap && (currentPoint.correctionActive || currentProgress >= 0.31);
  const isProxActive = (fuzeConcept === 'proximity' || fuzeConcept === 'multimode') && currentProgress >= 0.65;
  const isDetonated = currentProgress >= 0.98;

  const getArmingBadge = () => {
    if (isDetonated) {
      return (
        <span className="px-2 py-0.5 border border-[#FF0000] bg-[#2E1212] text-[#FF0000] font-bold text-[10px] animate-pulse">
          DETONATION TRIGGERED
        </span>
      );
    }
    if (isProxActive) {
      return (
        <span className="px-2 py-0.5 border border-[#FFA500] bg-[#261C0D] text-[#FFA500] font-bold text-[10px]">
          PROX RADAR ACTIVE
        </span>
      );
    }
    if (isCanardDeploy) {
      return (
        <span className="px-2 py-0.5 border border-[#00FF00] bg-[#122416] text-[#00FF00] font-bold text-[10px] animate-pulse">
          CANARD FINS STEERING
        </span>
      );
    }
    if (isArmed) {
      return (
        <span className="px-2 py-0.5 border border-[#00FF00] bg-[#122416] text-[#00FF00] font-bold text-[10px]">
          ARMED (IN FLIGHT)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 border border-[#383C46] bg-[#18191C] text-[#8A8F9E] text-[10px]">
        BORE SAFE / UNARMED
      </span>
    );
  };

  return (
    <div className="flex flex-col bg-[#202124] border border-[#33363D] overflow-hidden font-mono-tech select-none shadow-xl">
      {/* Header */}
      <div className="bg-[#18191C] px-3 py-1.5 border-b border-[#2D3138] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#00FFFF]" />
          <span className="text-[#FFFFFF] font-bold tracking-wider">
            155MM NOSE CAP &amp; SHELL SCHEMATIC
          </span>
        </div>
        <div>{getArmingBadge()}</div>
      </div>

      {/* Primary Top Cap Toggle: Original Cap vs PS Cap with Fins */}
      <div className="grid grid-cols-2 border-b border-[#2D3138] bg-[#16171A]">
        <button
          type="button"
          onClick={() => onSelectTopCap?.('original_cap')}
          className={`py-2 px-3 text-center text-xs uppercase font-bold transition-all border-r border-[#2D3138] flex flex-col items-center gap-0.5 ${
            !isPsCap
              ? 'bg-[#2E1414] text-[#FF0000] border-b-2 border-b-[#FF0000]'
              : 'text-[#8A8F9E] hover:text-white hover:bg-[#202124]'
          }`}
        >
          <span className="flex items-center gap-1">
            <span>ORIGINAL TOP CAP</span>
          </span>
          <span className="text-[9px] font-normal opacity-80">
            Standard M557/M739 • No Fins
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTopCap?.('ps_canard_cap')}
          className={`py-2 px-3 text-center text-xs uppercase font-bold transition-all flex flex-col items-center gap-0.5 ${
            isPsCap
              ? 'bg-[#15291B] text-[#00FF00] border-b-2 border-b-[#00FF00]'
              : 'text-[#8A8F9E] hover:text-white hover:bg-[#202124]'
          }`}
        >
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF9822]" />
            <span className="text-[#FF9822]">OUR PS CAP (WITH FINS)</span>
          </span>
          <span className="text-[9px] font-normal text-[#00FF00]/80">
            Precision Canard Steering Kit
          </span>
        </button>
      </div>

      {/* Interactive Fuze Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#2D3138] bg-[#121316]">
        {(['impact', 'time', 'proximity', 'multimode'] as FuzeConcept[]).map((concept) => {
          const active = fuzeConcept === concept;
          const conf = FUZE_CONFIGS[concept];
          const Icon = conf.icon;
          return (
            <button
              key={concept}
              type="button"
              onClick={() => onSelectConcept?.(concept)}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] tracking-wider uppercase transition-colors border-r last:border-r-0 border-[#2D3138] ${
                active
                  ? 'bg-[#1A73E8] text-white font-bold'
                  : 'text-[#8A8F9E] hover:text-white hover:bg-[#1C1E22]'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="truncate">{concept}</span>
            </button>
          );
        })}
      </div>

      {/* Technical SVG Shell Diagram */}
      <div className="p-3 flex flex-col items-center bg-[#121316] relative">
        <svg viewBox="0 0 240 105" className="w-full max-w-[280px] h-auto drop-shadow-md">
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#30343D" />
              <stop offset="50%" stopColor="#252830" />
              <stop offset="100%" stopColor="#1C1E24" />
            </linearGradient>
            <linearGradient id="psFuzeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1C3823" />
              <stop offset="100%" stopColor="#00FF00" />
            </linearGradient>
            <linearGradient id="origFuzeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3D1A1A" />
              <stop offset="100%" stopColor="#FF0000" />
            </linearGradient>
          </defs>

          {/* Projectile Body (155mm ERFB) */}
          <path
            d="M 60 22 L 175 22 Q 195 22 195 52 Q 195 82 175 82 L 60 82 Z"
            fill="url(#bodyGrad)"
            stroke="#4A505C"
            strokeWidth="1.5"
          />

          {/* Boat-tail 3° taper base */}
          <path d="M 38 34 L 60 22 L 60 82 L 38 70 Z" fill="#202124" stroke="#4A505C" strokeWidth="1.5" />

          {/* Copper alloy Driving Band */}
          <line x1="68" y1="22" x2="68" y2="82" stroke="#FF9822" strokeWidth="3" opacity="0.9" />
          <line x1="95" y1="22" x2="95" y2="82" stroke="#33363D" strokeWidth="1" />
          <line x1="135" y1="22" x2="135" y2="82" stroke="#33363D" strokeWidth="1" />

          {/* Bourrelet Nubs */}
          <rect x="152" y="20.5" width="6" height="3" fill="#FF9822" opacity="0.9" />
          <rect x="152" y="80.5" width="6" height="3" fill="#FF9822" opacity="0.9" />

          {/* Tail Stabilizing / Base Burn Ejection Orifice */}
          <path d="M 38 42 L 30 42 L 30 62 L 38 62 Z" fill="#18191C" stroke="#383C46" strokeWidth="1" />
          <circle cx="28" cy="52" r="3" fill="#FFA500" opacity="0.9" className="animate-pulse" />

          {/* NOSE CONE / FUZE ASSEMBLY */}
          {isPsCap ? (
            /* OUR PS CAP WITH 4X STEERABLE CANARD FINS */
            <g>
              <path
                d="M 175 22 Q 192 24 204 46 L 206 52 L 204 58 Q 192 80 175 82 Z"
                fill="url(#psFuzeGrad)"
                stroke="#00FF00"
                strokeWidth="1.5"
              />

              {/* Despin Ring / Bearing Seam */}
              <line x1="178" y1="22" x2="178" y2="82" stroke="#00FFFF" strokeWidth="1.2" strokeDasharray="2 2" />

              {/* Top Canard Fin (Steerable) */}
              <path
                d="M 188 28 L 180 10 L 196 10 L 198 28 Z"
                fill="#00FF00"
                stroke="#FFFFFF"
                strokeWidth="1"
                className={isCanardDeploy ? 'animate-pulse' : ''}
              />
              {/* Bottom Canard Fin (Steerable) */}
              <path
                d="M 188 76 L 180 94 L 196 94 L 198 76 Z"
                fill="#00FF00"
                stroke="#FFFFFF"
                strokeWidth="1"
                className={isCanardDeploy ? 'animate-pulse' : ''}
              />

              {/* Lateral Fin Hint */}
              <polygon points="192,50 200,44 196,52" fill="#00FF00" opacity="0.8" />

              {/* GPS Antenna Ring in Magenta #FF00FF */}
              <circle cx="198" cy="52" r="4.5" fill="#121316" stroke="#FF00FF" strokeWidth="1.2" />
              <circle cx="198" cy="52" r="2" fill="#00FFFF" />

              {/* Fin label callouts */}
              <line x1="188" y1="10" x2="188" y2="4" stroke="#00FF00" strokeWidth="0.8" />
              <text x="188" y="2" textAnchor="middle" fill="#00FF00" fontSize="6.5" fontFamily="Space Mono, monospace" fontWeight="bold">
                CANARD FIN
              </text>
            </g>
          ) : (
            /* ORIGINAL STANDARD SOLID TOP CAP (NO FINS - M557/M739) */
            <g>
              <path
                d="M 175 22 Q 192 24 204 46 L 208 52 L 204 58 Q 192 80 175 82 Z"
                fill="url(#origFuzeGrad)"
                stroke="#FF0000"
                strokeWidth="1.5"
              />
              <line x1="176" y1="22" x2="176" y2="82" stroke="#FF0000" strokeWidth="1" />
              <circle cx="204" cy="52" r="3" fill="#FF0000" />

              <line x1="192" y1="26" x2="192" y2="12" stroke="#FF0000" strokeWidth="0.8" />
              <text x="192" y="10" textAnchor="middle" fill="#FF0000" fontSize="6.5" fontFamily="Space Mono, monospace" fontWeight="bold">
                ORIGINAL NO-FIN CAP
              </text>
            </g>
          )}
        </svg>

        {/* Live Fuze & Cap Description */}
        <div className="w-full mt-2 pt-2 border-t border-[#252830] flex flex-col gap-1 text-[11px]">
          <div className="flex items-center justify-between font-bold">
            <span className={isPsCap ? 'text-[#00FF00]' : 'text-[#FF0000]'}>
              {isPsCap ? 'PS CAP: PRECISION COURSE CORRECTION (CANARDS)' : 'ORIGINAL CAP: UNGUIDED MECHANICAL FUZE'}
            </span>
            <span className="text-[#FFA500] text-[10px]">
              {fuzeEvent ? `BURST @ T+${fuzeEvent.time.toFixed(1)}s` : 'BURST: READY'}
            </span>
          </div>
          <p className="text-[10px] text-[#8A8F9E] leading-tight">
            {isPsCap
              ? 'Features 4 steerable canard fins with despin bearing to cancel range & crosswind deflection in real time.'
              : 'Standard M557/M739 conical tip without aerodynamic steering fins. Pure unguided ballistic flight.'}
          </p>
        </div>
      </div>
    </div>
  );
};
