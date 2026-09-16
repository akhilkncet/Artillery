import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../state/SimulationContext';
import { TrajectoryCanvas } from './TrajectoryCanvas';
import {
  Pause,
  Play,
  RotateCcw,
  Square,
  ArrowRight,
  TrendingUp,
  Sliders,
} from 'lucide-react';

export const SimulationView: React.FC = () => {
  const { simulationResult, setCurrentPage } = useSimulation();

  if (!simulationResult) {
    return (
      <div className="max-w-[1600px] mx-auto p-8 text-center text-xs font-mono-tech">
        <p className="text-[#ffb4ab] mb-4">No simulation data currently available.</p>
        <button
          type="button"
          onClick={() => setCurrentPage('configure')}
          className="px-4 py-2 bg-[#05ffa1] text-[#030704] font-bold"
        >
          Return to Configuration
        </button>
      </div>
    );
  }

  const [progress, setProgress] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const speedMultiplier = (() => {
    switch (simulationResult.configurationSnapshot.settings.animationSpeed) {
      case '0.5x':
        return 0.5;
      case '1.5x':
        return 1.5;
      case '2.0x':
        return 2.0;
      case 'normal':
      default:
        return 1.0;
    }
  })();

  const totalDurationSec = simulationResult.simulationDuration;

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || isComplete) {
      lastTimeRef.current = null;
      return;
    }

    const animate = (time: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (time - lastTimeRef.current) / 1000;
        const progressIncrement = (deltaSec / totalDurationSec) * speedMultiplier;

        setProgress((prev) => {
          const next = prev + progressIncrement;
          if (next >= 1.0) {
            setIsPlaying(false);
            setIsComplete(true);
            return 1.0;
          }
          return next;
        });
      }

      lastTimeRef.current = time;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isComplete, totalDurationSec, speedMultiplier]);

  const handlePauseResume = () => {
    if (isComplete) {
      setProgress(0);
      setIsComplete(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReplay = () => {
    setProgress(0);
    setIsComplete(false);
    setIsPlaying(true);
  };

  const handleExit = () => {
    setIsPlaying(false);
    setCurrentPage('configure');
  };

  const pointIndex = Math.min(
    simulationResult.trajectory.length - 1,
    Math.max(0, Math.floor(progress * (simulationResult.trajectory.length - 1)))
  );
  const currentPoint = simulationResult.trajectory[pointIndex];

  const isGuided = simulationResult.correctionApplied;
  const correctionProgress = simulationResult.correctionEvents[0]?.progress ?? 1.0;

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#122b1d] pb-3">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-[#05ffa1]" />
          <div>
            <h1 className="text-sm sm:text-base font-mono-tech font-bold text-white tracking-wider">
              TRAJECTORY SIMULATION
            </h1>
            <span className="text-[11px] font-mono-tech text-[#4e7a5e] tracking-widest">
              RELATIVE COORDINATE VIEW
            </span>
          </div>
        </div>

        <div className="border border-[#05ffa1]/50 bg-[#06100a] px-3 py-1 text-xs font-mono-tech text-[#05ffa1] tracking-wider uppercase flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isComplete ? 'bg-[#05ffa1]' : isPlaying ? 'bg-[#05ffa1]' : 'bg-[#ffb4ab]'}`} />
          <span>{isComplete ? 'SIMULATION COMPLETE' : isPlaying ? 'SIMULATION RUNNING' : 'SIMULATION PAUSED'}</span>
        </div>
      </div>

      <div className="w-full">
        <TrajectoryCanvas result={simulationResult} currentProgress={progress} currentPoint={currentPoint} />
      </div>

      <div className="border border-[#122b1d] bg-[#060e09] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#4e7a5e] uppercase tracking-wider px-1">
          <span className={progress >= 0.0 ? 'text-[#05ffa1] font-bold' : ''}>INITIALIZE</span>
          <span className={progress >= 0.25 ? 'text-[#05ffa1] font-bold' : ''}>FLIGHT</span>
          <span className={progress >= 0.5 ? 'text-[#05ffa1] font-bold' : ''}>CORRECTION</span>
          <span className={progress >= 0.98 ? 'text-[#05ffa1] font-bold' : ''}>ENDPOINT</span>
        </div>

        <div className="relative w-full h-4 bg-[#030704] border border-[#133822] overflow-hidden flex items-center">
          <div
            className="h-full bg-gradient-to-r from-[#00a572] to-[#05ffa1] transition-all duration-75"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-2.5 bg-white border border-[#05ffa1] -translate-x-1/2 flex items-center justify-center"
            style={{ left: `${progress * 100}%` }}
          >
            <div className="w-0.5 h-2 bg-[#030704]" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-6 text-xs font-mono-tech text-[#849588]">
            <span>0%</span>
            <span>25%</span>
            <span className="text-[#05ffa1] font-bold font-mono-tech px-2 py-0.5 bg-[#0b1a11] border border-[#133822]">
              {Math.round(progress * 100)}%
            </span>
            <span>75%</span>
            <span>100%</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handlePauseResume}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#133822] bg-[#030704] text-[#05ffa1] hover:bg-[#0b1a11] hover:border-[#05ffa1] text-xs font-mono-tech tracking-wider uppercase transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'PAUSE' : isComplete ? 'RESTART' : 'RESUME'}</span>
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#133822] bg-[#030704] text-[#849588] hover:text-white hover:border-[#4e7a5e] text-xs font-mono-tech tracking-wider uppercase transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPLAY</span>
            </button>

            <button
              type="button"
              onClick={handleExit}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#ff3b30]/80 bg-[#1c0808]/70 text-[#ff3b30] hover:bg-[#ff3b30] hover:text-[#030704] text-xs font-mono-tech tracking-wider uppercase transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              <span>EXIT SIMULATION</span>
            </button>

            <button
              type="button"
              disabled={!isComplete}
              onClick={() => isComplete && setCurrentPage('results')}
              className={`flex items-center gap-2 px-5 py-1.5 font-mono-tech font-bold text-xs uppercase tracking-wider transition-colors ${
                isComplete
                  ? 'bg-[#05ffa1] text-[#030704] hover:bg-[#1df4c9]'
                  : 'bg-[#0b1a11] text-[#4e7a5e] cursor-not-allowed'
              }`}
            >
              <span>VIEW RESULTS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="border border-[#122b1d] bg-[#060e09] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#0f2317] pb-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-white uppercase tracking-wider">
              <span>SIMULATION STATUS</span>
            </div>
            <span
              className={`text-[10px] font-mono-tech font-bold px-2 py-0.5 border ${
                isComplete ? 'border-[#05ffa1] bg-[#0b1a11] text-[#05ffa1]' : 'border-[#133822] bg-[#030704] text-[#05ffa1]'
              }`}
            >
              {isComplete ? 'COMPLETE' : 'RUNNING'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono-tech">
            <div className="flex items-center justify-between py-1 border-b border-[#0e2518]">
              <span className="text-[#849588]">01 INITIALIZATION</span>
              <span className="text-[#05ffa1] font-bold">✓ COMPLETE</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#0e2518]">
              <span className="text-[#849588]">02 NAVIGATION</span>
              <span className="text-[#05ffa1] font-bold">{progress >= 0.08 ? '✓ ACTIVE' : '○ PENDING'}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#0e2518]">
              <span className="text-[#849588]">03 FLIGHT</span>
              <span className={`font-bold ${isComplete ? 'text-[#05ffa1]' : progress >= 0.22 ? 'text-[#05ffa1]' : 'text-[#4e7a5e]'}`}>
                {isComplete ? '✓ COMPLETE' : progress >= 0.22 ? '● RUNNING' : '○ PENDING'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#0e2518]">
              <span className="text-[#849588]">04 CORRECTION</span>
              <span
                className={`font-bold ${
                  !isGuided ? 'text-[#4e7a5e]' : progress >= correctionProgress ? 'text-[#05ffa1]' : 'text-[#4e7a5e]'
                }`}
              >
                {!isGuided
                  ? '— DISABLED'
                  : progress >= 0.88
                  ? '✓ COMPLETE'
                  : progress >= correctionProgress
                  ? '● ACTIVE'
                  : '○ PENDING'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#849588]">05 ENDPOINT</span>
              <span className={`font-bold ${isComplete ? 'text-[#05ffa1]' : 'text-[#4e7a5e]'}`}>
                {isComplete ? '✓ REACHED' : '○ PENDING'}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-[#122b1d] bg-[#060e09] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#0f2317] pb-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-white uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-[#05ffa1]" />
              <span>ACTIVE CONFIGURATION</span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono-tech">
            <div className="flex items-center justify-between py-1 border-b border-[#0e2518]">
              <span className="text-[#849588]">Navigation:</span>
              <span className="text-white font-bold">
                {simulationResult.configurationSnapshot.navigation.scheme === 'sensor_fusion'
                  ? 'Sensor Fusion'
                  : simulationResult.configurationSnapshot.navigation.scheme === 'gnss'
                  ? 'GNSS-Assisted'
                  : 'Inertial Concept'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#0e2518]">
              <span className="text-[#849588]">Control:</span>
              <span className="text-white font-bold">
                {simulationResult.configurationSnapshot.control.method === 'canard'
                  ? 'Canard Concept'
                  : simulationResult.configurationSnapshot.control.method === 'aerodynamic'
                  ? 'Aerodynamic Correction'
                  : 'Passive / Ballistic'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#0e2518]">
              <span className="text-[#849588]">Fuze:</span>
              <span className="text-white font-bold">
                {simulationResult.configurationSnapshot.fuze.concept === 'multimode'
                  ? 'Multi-mode'
                  : simulationResult.configurationSnapshot.fuze.concept === 'proximity'
                  ? 'Proximity'
                  : simulationResult.configurationSnapshot.fuze.concept === 'time'
                  ? 'Time'
                  : 'Impact'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#849588]">Disturbance:</span>
              <span className="text-white font-bold capitalize">
                {simulationResult.configurationSnapshot.environment.disturbance}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
