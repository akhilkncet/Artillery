import React from 'react';
import { useSimulation } from '../../state/SimulationContext';
import {
  RotateCcw,
  ArrowLeft,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Activity,
} from 'lucide-react';

export const ResultsView: React.FC = () => {
  const { simulationResult, setCurrentPage } = useSimulation();

  if (!simulationResult) {
    return (
      <div className="max-w-[1600px] mx-auto p-8 text-center text-xs font-mono-tech">
        <p className="text-[#ffb4ab] mb-4">No simulation data available to display.</p>
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

  const {
    configurationSnapshot: configuration,
    deviationOverTime,
    peakDeviation,
    finalDeviation,
    peakDeviationProgress,
    correctionEffect,
    correctionApplied,
    navigationState,
    fuzeEvent,
    trajectory,
  } = simulationResult;

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            reportTitle: 'Shell & Fuze Concept Simulation Report',
            generatedAt: new Date().toISOString(),
            configuration,
            metrics: {
              peakDeviation: `${peakDeviation} m`,
              finalDeviation: `${finalDeviation} m`,
              peakDeviationProgress: `${Math.round(peakDeviationProgress * 100)}%`,
              correctionEffect: `${correctionEffect}%`,
              navigationState,
              fuzeEvent: fuzeEvent.description,
            },
            trajectory,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `simulation_${configuration.scenario.scenarioName.toLowerCase()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const chartWidth = 700;
  const chartHeight = 220;
  const paddingX = 50;
  const paddingY = 30;

  const maxDev = Math.max(10, peakDeviation * 1.15);

  const pointsString = deviationOverTime
    .map((p) => {
      const x = paddingX + p.progress * (chartWidth - paddingX * 2);
      const y = chartHeight - paddingY - (p.deviation / maxDev) * (chartHeight - paddingY * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPointsString = `${paddingX},${chartHeight - paddingY} ${pointsString} ${
    chartWidth - paddingX
  },${chartHeight - paddingY}`;

  const peakSvgX = paddingX + peakDeviationProgress * (chartWidth - paddingX * 2);
  const peakSvgY = chartHeight - paddingY - (peakDeviation / maxDev) * (chartHeight - paddingY * 2);

  const navigationSchemeLabel =
    configuration.navigation.scheme === 'sensor_fusion'
      ? 'Sensor-Fusion Concept'
      : configuration.navigation.scheme === 'gnss'
      ? 'GNSS-Assisted Concept'
      : 'Inertial Concept';

  const actuationLabel =
    configuration.control.method === 'canard'
      ? 'Canard-Based Correction'
      : configuration.control.method === 'aerodynamic'
      ? 'Aerodynamic Correction'
      : 'Passive / Ballistic';

  const fuzeLabel =
    configuration.fuze.concept === 'multimode'
      ? 'Multi-Mode'
      : configuration.fuze.concept === 'proximity'
      ? 'Proximity'
      : configuration.fuze.concept === 'time'
      ? 'Time'
      : 'Impact';

  const navigationObservation = `Navigation configuration: ${navigationSchemeLabel}. Simulated state estimate classified as ${navigationState}.`;

  const controlObservation = correctionApplied
    ? `Correction enabled using ${actuationLabel}. Reduced final deviation by an estimated ${correctionEffect}% relative to an uncorrected reference run.`
    : `Correction disabled (${actuationLabel}). Trajectory deviation accumulated without an active correction model.`;

  const fuzeObservation = `Conceptual event mode: ${fuzeLabel}. ${fuzeEvent.description} at ${Math.round(
    fuzeEvent.progress * 100
  )}% of flight progress.`;

  const simulationObservation = `Generated trajectory contains ${trajectory.length} samples over ${simulationResult.simulationDuration}s of simulated flight.`;

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#122b1d] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono-tech font-bold text-white tracking-wider">
            SIMULATION RESULTS
          </h1>
          <p className="text-xs sm:text-sm font-mono-tech text-[#849588] mt-1">
            Metrics and graphs calculated from the generated simulation run.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#06100a] border border-[#133822] text-[#05ffa1] text-xs font-mono-tech tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#05ffa1]" />
          <span>SIMULATION COMPLETE</span>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#122b1d] bg-[#060e09] p-4">
          <div className="text-[10px] font-mono-tech text-[#4e7a5e] uppercase tracking-wider mb-2">
            FINAL TRAJECTORY DEVIATION
          </div>
          <div className="text-3xl font-mono-tech font-bold text-[#05ffa1] mb-1">{finalDeviation} M</div>
          <p className="text-[11px] font-mono-tech text-[#849588] leading-tight">
            Distance between final simulated position and target
          </p>
        </div>

        <div className="border border-[#122b1d] bg-[#060e09] p-4">
          <div className="text-[10px] font-mono-tech text-[#4e7a5e] uppercase tracking-wider mb-2">
            PEAK DEVIATION
          </div>
          <div className="text-3xl font-mono-tech font-bold text-white mb-1">{peakDeviation} M</div>
          <p className="text-[11px] font-mono-tech text-[#849588] leading-tight">
            Maximum divergence from the nominal reference path
          </p>
        </div>

        <div className="border border-[#122b1d] bg-[#060e09] p-4">
          <div className="text-[10px] font-mono-tech text-[#4e7a5e] uppercase tracking-wider mb-2">
            CORRECTION EFFECT
          </div>
          <div className="text-3xl font-mono-tech font-bold text-[#05ffa1] mb-1">
            {correctionApplied ? `${correctionEffect}%` : 'N/A'}
          </div>
          <p className="text-[11px] font-mono-tech text-[#849588] leading-tight">
            Reduction in final deviation vs. an uncorrected reference run
          </p>
        </div>

        <div className="border border-[#122b1d] bg-[#060e09] p-4">
          <div className="text-[10px] font-mono-tech text-[#4e7a5e] uppercase tracking-wider mb-2">
            NAVIGATION STATE
          </div>
          <div className="text-3xl font-mono-tech font-bold text-white mb-1">{navigationState}</div>
          <p className="text-[11px] font-mono-tech text-[#849588] leading-tight">
            Derived from the selected navigation configuration
          </p>
        </div>
      </div>

      {/* Middle Grid: Deviation Chart & Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 border border-[#122b1d] bg-[#060e09] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#0f2317] pb-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-white uppercase tracking-wider">
              <Activity className="w-4 h-4 text-[#05ffa1]" />
              <span>TRAJECTORY DEVIATION OVER PROGRESS</span>
            </div>
            <span className="text-[10px] font-mono-tech text-[#4e7a5e]">RELATIVE ERROR (METERS)</span>
          </div>

          <div className="w-full bg-[#030704] border border-[#0e2518] p-2 radar-grid-fine relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                const labelVal = Math.round(ratio * maxDev);
                return (
                  <g key={ratio}>
                    <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#0f2918" strokeWidth="1" strokeDasharray="4 4" />
                    <text x={paddingX - 8} y={y + 3} textAnchor="end" fill="#4e7a5e" fontSize="9" fontFamily="Space Mono, monospace">
                      {labelVal}m
                    </text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="deviationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#05ffa1" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#05ffa1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <polygon points={areaPointsString} fill="url(#deviationGradient)" opacity="0.35" />
              <polyline points={pointsString} fill="none" stroke="#05ffa1" strokeWidth="2.5" />

              <g transform={`translate(${peakSvgX}, ${peakSvgY})`}>
                <circle cx="0" cy="0" r="4" fill="#ffffff" stroke="#05ffa1" strokeWidth="2" />
                <rect x="-30" y="-24" width="60" height="16" fill="#06100a" stroke="#05ffa1" strokeWidth="1" />
                <text x="0" y="-13" textAnchor="middle" fill="#05ffa1" fontSize="8" fontFamily="Space Mono, monospace" fontWeight="bold">
                  PEAK {peakDeviation}M
                </text>
              </g>

              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#133822" strokeWidth="1.5" />
            </svg>

            <div className="flex items-center justify-between text-[9px] font-mono-tech text-[#849588] px-6 mt-2">
              <span>0% INITIALIZE</span>
              <span>25% FLIGHT</span>
              <span>50% CORRECTION</span>
              <span>75% APPROACH</span>
              <span>100% ENDPOINT</span>
            </div>
          </div>

          <div className="mt-3 text-[11px] font-mono-tech text-[#4e7a5e] flex items-center justify-between">
            <span>Profile: {configuration.scenario.scenarioName}</span>
            <span>Disturbance Impact: {configuration.environment.disturbance.toUpperCase()}</span>
          </div>
        </div>

        <div className="lg:col-span-5 border border-[#122b1d] bg-[#060e09] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#0f2317] pb-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-white uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#05ffa1]" />
                <span>OBSERVATIONS</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono-tech">
              <div className="border border-[#133822] bg-[#030704] p-3">
                <div className="font-bold text-white mb-1">NAVIGATION</div>
                <p className="text-[11px] text-[#849588] leading-relaxed">{navigationObservation}</p>
              </div>

              <div className="border border-[#133822] bg-[#030704] p-3">
                <div className="font-bold text-white mb-1">CONTROL</div>
                <p className="text-[11px] text-[#849588] leading-relaxed">{controlObservation}</p>
              </div>

              <div className="border border-[#133822] bg-[#030704] p-3">
                <div className="font-bold text-white mb-1">FUZE</div>
                <p className="text-[11px] text-[#849588] leading-relaxed">{fuzeObservation}</p>
              </div>

              <div className="border border-[#133822] bg-[#030704] p-3">
                <div className="font-bold text-white mb-1">SIMULATION</div>
                <p className="text-[11px] text-[#849588] leading-relaxed">{simulationObservation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Used Snapshot */}
      <div className="border border-[#122b1d] bg-[#060e09] p-4">
        <div className="text-xs font-mono-tech font-bold text-white uppercase tracking-wider border-b border-[#0f2317] pb-2 mb-3">
          CONFIGURATION USED
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-mono-tech">
          <div>
            <div className="text-[10px] text-[#4e7a5e] uppercase mb-1">Scenario</div>
            <div className="text-white font-bold">{configuration.scenario.scenarioName}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#4e7a5e] uppercase mb-1">Navigation</div>
            <div className="text-white font-bold">{navigationSchemeLabel}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#4e7a5e] uppercase mb-1">Control</div>
            <div className="text-white font-bold">{actuationLabel}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#4e7a5e] uppercase mb-1">Fuze</div>
            <div className="text-white font-bold">{fuzeLabel}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#4e7a5e] uppercase mb-1">Environment</div>
            <div className="text-white font-bold capitalize">{configuration.environment.disturbance}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#4e7a5e] uppercase mb-1">Duration</div>
            <div className="text-white font-bold">{configuration.settings.duration}</div>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="border border-[#2a3c1a] bg-[#0c1409] p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#05ffa1] shrink-0 mt-0.5" />
        <div className="text-xs font-mono-tech">
          <div className="font-bold text-[#05ffa1] uppercase tracking-wider mb-1">Conceptual Simulation Notice</div>
          <p className="text-[#849588] leading-relaxed">
            This is a generic, normalized computational model intended for conceptual demonstration only.
            It does not use real firing tables, real weapon dimensions, or operational targeting data.
          </p>
        </div>
      </div>

      {/* Bottom Command Bar */}
      <div className="mt-4 pt-4 border-t border-[#122b1d] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#060e09] p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setCurrentPage('simulation')}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#133822] bg-[#030704] text-[#849588] hover:text-white hover:border-[#4e7a5e] text-xs font-mono-tech uppercase tracking-wider transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REPLAY SIMULATION</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage('configure')}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#133822] bg-[#030704] text-[#849588] hover:text-white hover:border-[#4e7a5e] text-xs font-mono-tech uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>NEW CONFIGURATION</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0b1a11] border border-[#163523] text-[#05ffa1] hover:bg-[#0e2518] text-xs font-mono-tech tracking-wider uppercase transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT REPORT (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#05ffa1] hover:bg-[#1df4c9] text-[#030704] font-mono-tech font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT REPORT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
