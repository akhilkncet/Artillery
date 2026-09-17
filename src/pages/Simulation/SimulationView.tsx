import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../state/SimulationContext';
import { TrajectoryCanvas } from './TrajectoryCanvas';
import { PrimaryFlightDisplay } from '../../components/hud/PrimaryFlightDisplay';
import { FuzeShellCard } from '../../components/hud/FuzeShellCard';
import { QuickMissionModal } from '../../components/hud/QuickMissionModal';
import { generateArtilleryPdfReport } from '../../utils/generatePdfReport';
import { FuzeConcept, TopCapType } from '../../types/simulation';
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Repeat,
  Sliders,
  Flame,
  FileDown,
  Cpu,
  Crosshair,
  ShieldCheck,
} from 'lucide-react';

export const SimulationView: React.FC = () => {
  const {
    simulationResult,
    configuration,
    updateConfiguration,
    generateSimulation,
  } = useSimulation();

  const [progress, setProgress] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // If no simulation result yet, auto-generate one
  useEffect(() => {
    if (!simulationResult) {
      generateSimulation();
    }
  }, [simulationResult, generateSimulation]);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Fluid, responsive animation cycle: full trajectory runs in 18.0s at 1.0x speed (slowed 50% for high-clarity tactical tracking)
  const ANIMATION_CYCLE_SECONDS = 18.0;

  useEffect(() => {
    if (!isPlaying || !simulationResult) return;

    const animate = (time: number) => {
      const deltaSec = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setProgress((prev) => {
        const next = prev + (deltaSec * playbackSpeed) / ANIMATION_CYCLE_SECONDS;
        if (next >= 1.0) {
          if (isLooping) {
            return 0.0;
          }
          setIsPlaying(false);
          return 1.0;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isLooping, playbackSpeed, simulationResult]);

  if (!simulationResult) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#121316] text-white font-mono-tech p-8">
        <div className="w-14 h-14 border-3 border-[#1A73E8] border-t-[#FF9822] rounded-full animate-spin mb-4" />
        <div className="text-base font-bold tracking-widest text-[#00FFFF] uppercase">
          INITIALIZING 155MM NUMERICAL AERODYNAMIC SOLVER...
        </div>
        <div className="text-xs text-[#8A8F9E] mt-2">
          STANAG 4355 • Balon &amp; Komenda Trailing Edge Guidance Integration
        </div>
      </div>
    );
  }

  // Sample lookup based on active scrubber progress
  const samples = simulationResult.trajectory;
  const sampleIndex = Math.min(
    samples.length - 1,
    Math.max(0, Math.floor(progress * (samples.length - 1)))
  );
  const currentPoint = samples[sampleIndex] ?? samples[0];
  const previousPoint = sampleIndex > 0 ? samples[sampleIndex - 1] : currentPoint;

  const isPsCap = configuration.scenario.topCap === 'ps_canard_cap';
  const totalDurationSec = simulationResult.simulationDuration;
  const isComplete = progress >= 0.999;
  const correctionProgress =
    simulationResult.trajectory.find((s) => s.correctionActive)?.progress ?? 0.31;
  const isCanardActive = isPsCap && progress >= correctionProgress;

  // Handlers
  const handlePlayPause = () => {
    if (isComplete) {
      setProgress(0.0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    setProgress(0.0);
    setIsPlaying(true);
  };

  const handleStep = (delta: number) => {
    setIsPlaying(false);
    setProgress((prev) => Math.min(1.0, Math.max(0.0, prev + delta)));
  };

  const handleScrub = (newProgress: number) => {
    setProgress(Math.min(1.0, Math.max(0.0, newProgress)));
  };

  const handleTopCapChange = (topCap: TopCapType) => {
    updateConfiguration({
      scenario: {
        ...configuration.scenario,
        topCap,
      },
    });
    generateSimulation();
  };

  const handleFuzeChange = (concept: FuzeConcept) => {
    updateConfiguration({
      fuze: {
        ...configuration.fuze,
        concept,
      },
    });
    generateSimulation();
  };

  const handleFireNewMission = () => {
    setProgress(0.0);
    generateSimulation();
    setIsPlaying(true);
  };

  const handleDownloadPdfReport = () => {
    generateArtilleryPdfReport(simulationResult, configuration);
  };

  return (
    <div className="w-full flex-1 flex flex-col p-3 sm:p-4 lg:p-5 gap-3.5 select-none font-mono-tech max-w-[1800px] mx-auto">
      {/* 1. TOP AVIONICS STATUS & ACTION BAR */}
      <div className="shrink-0 border border-[#33363D] bg-[#18191C] px-3.5 py-2.5 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Scenario & System Info */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF00] shadow-[0_0_8px_#00FF00]" />
            <span className="text-white font-bold text-sm tracking-wider uppercase">
              155MM ERFB/BB ARTILLERY FLIGHT DECK
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#2D3138] hidden sm:block" />

          {/* Nose Cap Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#8A8F9E] text-xs">NOSE CAP:</span>
            <button
              type="button"
              onClick={() => handleTopCapChange('original_cap')}
              className={`px-3 py-1 text-xs font-bold border uppercase transition-all rounded ${
                !isPsCap
                  ? 'border-[#FF0000] bg-[#2E1414] text-[#FF0000] shadow-[0_0_8px_rgba(255,0,0,0.4)]'
                  : 'border-[#2D3138] bg-[#121316] text-[#8A8F9E] hover:text-white'
              }`}
            >
              ORIGINAL (UNGUIDED)
            </button>
            <button
              type="button"
              onClick={() => handleTopCapChange('ps_canard_cap')}
              className={`px-3 py-1 text-xs font-bold border uppercase transition-all rounded ${
                isPsCap
                  ? 'border-[#00FF00] bg-[#142918] text-[#00FF00] shadow-[0_0_8px_rgba(0,255,0,0.4)]'
                  : 'border-[#2D3138] bg-[#121316] text-[#8A8F9E] hover:text-white'
              }`}
            >
              PS CAP (WITH FINS)
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#2D3138] hidden md:block" />

          <div className="hidden md:flex items-center gap-2 text-xs text-[#8A8F9E]">
            <span>CHARGE:</span>
            <span className="text-[#00FFFF] font-bold">
              {simulationResult.ballistics155.chargeType === 'charge_d' ? 'Charge D (908 m/s)' : 'Charge A+A+B (620 m/s)'}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#2D3138] hidden lg:block" />

          <div className="hidden lg:flex items-center gap-2 text-xs text-[#8A8F9E]">
            <span>MAX RANGE:</span>
            <span className="text-[#00FFFF] font-bold">
              {(simulationResult.ballistics155.maxRange / 1000).toFixed(1)} km
            </span>
          </div>
        </div>

        {/* Top Right Action Controls: Config, Re-fire, and REPORT GENERATION */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1A73E8] bg-[#121316] text-white hover:bg-[#1A73E8]/20 text-xs transition-colors rounded"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00FFFF]" />
            <span>FIRING PARAMETERS</span>
          </button>

          <button
            type="button"
            onClick={handleFireNewMission}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF9822] text-[#121316] hover:bg-[#FFA500] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(255,152,34,0.4)] rounded"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>RE-FIRE</span>
          </button>

          {/* PROMINENT TOP-RIGHT REPORT GENERATION BUTTON */}
          <button
            type="button"
            onClick={handleDownloadPdfReport}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(26,115,232,0.5)] border border-[#4285F4] rounded cursor-pointer"
            title="Compile all shell details, ballistics, and telemetry into a downloadable PDF report"
          >
            <FileDown className="w-4 h-4 text-white" />
            <span>GENERATE PDF REPORT</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN TACTICAL GRID (SPACIOUS, BREATHABLE 3-COLUMN ARCHITECTURE) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch min-h-[500px]">
        {/* COLUMN 1: PRIMARY FLIGHT DISPLAY (HUD) (3.5 cols on desktop) */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          {/* Primary Flight Display (Attitude, Airspeed, Altimeter, Heading) */}
          <div className="shrink-0 shadow-xl rounded-lg overflow-hidden">
            <PrimaryFlightDisplay
              currentPoint={currentPoint}
              previousPoint={previousPoint}
              totalDuration={totalDurationSec}
              canardActive={isCanardActive}
            />
          </div>

          {/* Tactical Status & Flight Phase Card */}
          <div className="flex-1 border border-[#33363D] bg-[#202124] p-3 rounded-lg flex flex-col justify-between text-xs font-mono-tech shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2D3138] pb-1.5 mb-2">
              <span className="text-xs text-white font-bold tracking-wider uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00FF00]" />
                FLIGHT STATUS
              </span>
              <span
                className={`text-[9.5px] font-bold px-2 py-0.5 border rounded ${
                  isComplete
                    ? 'border-[#00FF00] text-[#00FF00] bg-[#122416]'
                    : isCanardActive
                    ? 'border-[#00FFFF] text-[#00FFFF] bg-[#0E2024]'
                    : 'border-[#33363D] text-[#8A8F9E]'
                }`}
              >
                {isComplete ? 'TERMINAL IMPACT' : isCanardActive ? 'CANARDS ACTIVE' : 'ASCENT PHASE'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#26282E]">
                <span className="text-[#8A8F9E]">Guidance Method:</span>
                <span className={isPsCap ? 'text-[#00FF00] font-bold' : 'text-[#8A8F9E]'}>
                  {isPsCap ? 'Dual-Axis Trim Canards' : 'Fixed Ballistic Cap'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#26282E]">
                <span className="text-[#8A8F9E]">Spin Stabilization:</span>
                <span className="text-white font-bold">
                  {isCanardActive ? '1,200 RPM (De-Spun)' : '18,000 RPM (Full Spin)'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#26282E]">
                <span className="text-[#8A8F9E]">Correction Envelope:</span>
                <span className="text-[#00FFFF] font-bold">T+33.4s to Impact</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#8A8F9E]">STANAG Compliance:</span>
                <span className="text-white font-bold">STANAG 4355 MPM</span>
              </div>
            </div>

            {/* Flight Phase Progress Bar */}
            <div className="mt-3 pt-2 border-t border-[#2D3138]">
              <div className="flex items-center justify-between text-xs text-[#8A8F9E] mb-1.5">
                <span>ACTIVE PHASE:</span>
                <span className="text-[#00FF00] font-bold uppercase tracking-wider">
                  {currentPoint.phase}
                </span>
              </div>
              <div className="w-full h-2 bg-[#121316] border border-[#2D3138] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 rounded-full ${
                    isPsCap ? 'bg-[#00FF00]' : 'bg-[#FF0000]'
                  }`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: MAIN TRAJECTORY CANVAS (GRAND RELATIVE COORDINATE VIEW) (6 cols on desktop) */}
        <div className="lg:col-span-6 flex flex-col h-full min-h-[440px]">
          <TrajectoryCanvas
            result={simulationResult}
            currentProgress={progress}
            currentPoint={currentPoint}
          />
        </div>

        {/* COLUMN 3: FUZE & SHELL INTERACTIVE SCHEMATIC + SPECS (3 cols on desktop) */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          {/* 155mm Shell & Canard Graphic */}
          <div className="shrink-0 shadow-xl rounded-lg overflow-hidden">
            <FuzeShellCard
              fuzeConcept={configuration.fuze.concept}
              onSelectConcept={handleFuzeChange}
              topCap={configuration.scenario.topCap}
              onSelectTopCap={handleTopCapChange}
              currentPoint={currentPoint}
              fuzeEvent={simulationResult.fuzeEvent}
              totalDuration={totalDurationSec}
            />
          </div>

          {/* Aerodynamic & Guidance Specs Card */}
          <div className="flex-1 border border-[#33363D] bg-[#202124] p-3 rounded-lg flex flex-col justify-between text-xs font-mono-tech shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2D3138] pb-1.5 mb-2">
              <span className="text-xs text-white font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#00FF00]" />
                AERODYNAMIC TRIM
              </span>
              <span className="text-[9.5px] text-[#00FFFF] border border-[#00FFFF]/30 px-1.5 py-0.5 rounded">
                BALON &amp; KOMENDA
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#8A8F9E]">
              <div className="flex justify-between py-1 border-b border-[#26282E]">
                <span>Trailing Edge Angle:</span>
                <span className="text-[#00FF00] font-bold">3.0° Base Bleed Taper</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#26282E]">
                <span>Canard Steer Authority:</span>
                <span className={isPsCap ? 'text-[#00FF00] font-bold' : 'text-[#8A8F9E]'}>
                  {isPsCap ? '±7.5° Dual-Axis Trim' : '0° (Fixed Cap)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#26282E]">
                <span>Navigation Scheme:</span>
                <span className={isPsCap ? 'text-[#00FFFF] font-bold' : 'text-[#8A8F9E]'}>
                  {isPsCap ? simulationResult.navigationState : 'Pure Ballistic Arc'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Correction Window:</span>
                <span className="text-white font-bold">T+33.4s to Impact</span>
              </div>
            </div>

            <div className="mt-2 p-2 border border-[#2B3542] bg-[#12161E] text-[10.5px] text-[#A2B5DE] rounded">
              <div className="font-bold text-white mb-1 flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-[#FF9822]" />
                REPORT DATA READY:
              </div>
              <div>
                All shell kinematics, CEP dispersion, and aerodynamic metrics are compiled in the PDF report available on the top right.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM MASTER REPLAY CONTROLLER & TIMELINE SCRUBBER */}
      <div className="shrink-0 border border-[#33363D] bg-[#202124] px-4 py-3 rounded-lg flex flex-col gap-2 shadow-xl">
        {/* Timeline Progress Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#8A8F9E] uppercase tracking-wider px-1">
            <span className={progress >= 0.0 ? 'text-[#00FFFF] font-bold' : ''}>01 BOOST (908 m/s)</span>
            <span className={progress >= 0.25 ? 'text-[#00FFFF] font-bold' : ''}>
              02 APOGEE ({(simulationResult.ballistics155.vertexAltitude / 1000).toFixed(1)} km)
            </span>
            <span className={progress >= correctionProgress ? 'text-[#00FF00] font-bold' : ''}>
              03 CANARD TRIM (±7.5°)
            </span>
            <span className={progress >= 0.98 ? 'text-[#FF00FF] font-bold' : ''}>04 TERMINAL DETONATION</span>
          </div>

          <div className="relative w-full h-3.5 bg-[#121316] border border-[#2D3138] rounded cursor-pointer flex items-center overflow-hidden">
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={progress}
              onChange={(e) => handleScrub(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            {/* Filled track */}
            <div
              className={`h-full transition-all duration-75 ${
                isPsCap
                  ? 'bg-gradient-to-r from-[#143220] via-[#0e6138] to-[#00FF00]'
                  : 'bg-gradient-to-r from-[#381616] via-[#751b1b] to-[#FF0000]'
              }`}
              style={{ width: `${progress * 100}%` }}
            />
            {/* Needle Scrubber */}
            <div
              className="absolute top-0 bottom-0 w-3 bg-white border border-[#00FFFF] -translate-x-1/2 flex items-center justify-center pointer-events-none z-10 shadow-[0_0_10px_#ffffff] rounded-sm"
              style={{ left: `${progress * 100}%` }}
            >
              <div className="w-0.5 h-2 bg-[#202124]" />
            </div>
          </div>
        </div>

        {/* Playback Controls & Speed */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Time Readout */}
          <div className="flex items-center gap-3 text-xs text-[#8A8F9E]">
            <div className="flex items-center gap-2">
              <span className="text-[#8A8F9E] text-xs">SIM TIME:</span>
              <span className="text-[#00FFFF] font-bold font-mono px-2 py-0.5 bg-[#121316] border border-[#2D3138] text-xs rounded">
                T+{currentPoint.time.toFixed(1)}s
              </span>
              <span className="text-[#8A8F9E] text-xs">/ {totalDurationSec.toFixed(1)}s</span>
            </div>

            <div className="text-xs text-[#8A8F9E]">
              ({Math.round(progress * 100)}%)
            </div>
          </div>

          {/* Transport buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              title="Restart from T=0"
              className="p-1.5 border border-[#33363D] bg-[#121316] text-[#8A8F9E] hover:text-white hover:border-[#00FFFF] transition-colors rounded"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleStep(-0.05)}
              title="Step Backward"
              className="p-1.5 border border-[#33363D] bg-[#121316] text-[#8A8F9E] hover:text-white hover:border-[#00FFFF] transition-colors rounded"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePlayPause}
              className="px-5 py-1.5 bg-[#FF9822] text-[#121316] hover:bg-[#FFA500] font-bold flex items-center gap-1.5 transition-colors text-xs shadow-[0_0_10px_rgba(255,152,34,0.4)] rounded"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isComplete ? 'REPLAY' : 'RESUME'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleStep(0.05)}
              title="Step Forward"
              className="p-1.5 border border-[#33363D] bg-[#121316] text-[#8A8F9E] hover:text-white hover:border-[#00FFFF] transition-colors rounded"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              title={isLooping ? 'Looping Enabled' : 'Looping Disabled'}
              className={`p-1.5 border transition-colors rounded ${
                isLooping
                  ? 'border-[#00FF00] bg-[#142918] text-[#00FF00]'
                  : 'border-[#33363D] bg-[#121316] text-[#8A8F9E] hover:text-white'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#8A8F9E] mr-1">SPEED:</span>
            {[0.5, 1.0, 2.0, 4.0].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 text-xs border font-mono transition-colors rounded ${
                  playbackSpeed === spd
                    ? 'border-[#1A73E8] bg-[#1A73E8] text-white font-bold'
                    : 'border-[#33363D] bg-[#121316] text-[#8A8F9E] hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Mission Modal */}
      <QuickMissionModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={configuration}
        onUpdateConfig={updateConfiguration}
        onFire={handleFireNewMission}
      />
    </div>
  );
};
