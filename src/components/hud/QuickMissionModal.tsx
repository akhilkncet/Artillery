import React from 'react';
import {
  SimulationConfiguration,
  EnvironmentDisturbance,
  TopCapType,
  PropellingChargeType,
  BaseGeometryType,
} from '../../types/simulation';
import { Sliders, X, RefreshCw, Sparkles } from 'lucide-react';

interface QuickMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SimulationConfiguration;
  onUpdateConfig: (patch: Partial<SimulationConfiguration>) => void;
  onFire: () => void;
}

export const QuickMissionModal: React.FC<QuickMissionModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onFire,
}) => {
  if (!isOpen) return null;

  const currentTopCap = config.scenario.topCap ?? 'ps_canard_cap';
  const currentCharge = config.scenario.charge ?? 'charge_d';
  const currentBase = config.scenario.baseGeometry ?? 'erfb_bb';
  const currentQe = config.scenario.quadrantElevationMil ?? 700;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm font-mono-tech select-none">
      <div className="bg-[#202124] border border-[#33363D] w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#18191C] px-4 py-3 border-b border-[#2D3138] flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-[#00FFFF]" />
            <span className="tracking-wider">155MM ERFB BALLISTICS &amp; MISSION SETUP</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8A8F9E] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs bg-[#121316]">
          {/* 1. TOP CAP SELECTION (CRITICAL USER REQUEST) */}
          <div className="border border-[#2D3138] bg-[#18191C] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[#00FFFF] font-bold block text-[11px] uppercase tracking-wider">
                1. NOSE TOP CAP HARDWARE (ORIGINAL VS PS CAP)
              </label>
              <span className="text-[10px] text-[#8A8F9E]">Controls Error Radius &amp; Steering</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({
                    scenario: { ...config.scenario, topCap: 'original_cap' },
                    control: { ...config.control, method: 'passive', correctionEnabled: false },
                  })
                }
                className={`p-2.5 border text-left flex flex-col gap-1 transition-all ${
                  currentTopCap === 'original_cap'
                    ? 'bg-[#2E1414] text-[#FF0000] border-[#FF0000] shadow-[0_0_8px_rgba(255,0,0,0.4)] font-bold'
                    : 'bg-[#121316] text-[#8A8F9E] border-[#2D3138] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px]">ORIGINAL TOP CAP</span>
                  <span className="text-[9px] px-1 border border-current">M557 / M739</span>
                </div>
                <div className="text-[10px] opacity-80 leading-tight">
                  Standard unguided ballistic fuze without canard fins. Natural atmospheric dispersion (~200m CEP).
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({
                    scenario: { ...config.scenario, topCap: 'ps_canard_cap' },
                    control: { ...config.control, method: 'canard', correctionEnabled: true },
                  })
                }
                className={`p-2.5 border text-left flex flex-col gap-1 transition-all ${
                  currentTopCap === 'ps_canard_cap'
                    ? 'bg-[#15291B] text-[#00FF00] border-[#00FF00] shadow-[0_0_8px_rgba(0,255,0,0.4)] font-bold'
                    : 'bg-[#121316] text-[#8A8F9E] border-[#2D3138] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#FF9822]" /> OUR PS CAP (WITH FINS)
                  </span>
                  <span className="text-[9px] px-1 border border-current">PGK CANARDS</span>
                </div>
                <div className="text-[10px] opacity-80 leading-tight">
                  4x steerable aerodynamic canard fins. Active trajectory course correction achieving &lt;10m CEP.
                </div>
              </button>
            </div>
          </div>

          {/* 2. PROPELLING CHARGE (Balon & Komenda Table 5) */}
          <div className="border border-[#2D3138] bg-[#18191C] p-3 space-y-2">
            <label className="text-[#00FFFF] font-bold block text-[11px] uppercase tracking-wider">
              2. 155MM PROPELLING CHARGE (STANAG 4355)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'charge_d' as PropellingChargeType,
                  title: 'CHARGE D (V₀ = 908 m/s)',
                  desc: 'Triple-base stick propellant. Max range 38.5 km (ERFB/BB).',
                },
                {
                  id: 'charge_aab' as PropellingChargeType,
                  title: 'CHARGE A+A+B (V₀ = 620 m/s)',
                  desc: 'Single-base 7-hole propellant. Max range 21.0 km.',
                },
              ].map((c) => {
                const isSelected = currentCharge === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      onUpdateConfig({
                        scenario: { ...config.scenario, charge: c.id },
                      })
                    }
                    className={`p-2 border text-left flex flex-col gap-0.5 transition-colors ${
                      isSelected
                        ? 'bg-[#1A73E8] text-white border-[#1A73E8] font-bold shadow-[0_0_8px_rgba(26,115,232,0.5)]'
                        : 'bg-[#121316] text-[#8A8F9E] border-[#2D3138] hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-[10px]">{c.title}</span>
                    <span className="text-[9px] opacity-80">{c.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. BASE GEOMETRY (ERFB/BB vs ERFB/BT) */}
          <div className="border border-[#2D3138] bg-[#18191C] p-3 space-y-2">
            <label className="text-[#00FFFF] font-bold block text-[11px] uppercase tracking-wider">
              3. BASE GEOMETRY CONFIGURATION
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'erfb_bb' as BaseGeometryType,
                  title: 'ERFB/BB (BASE BURN / BASE BLEED)',
                  desc: 'Combustion gas generator reduces base drag by 24.5%.',
                },
                {
                  id: 'erfb_bt' as BaseGeometryType,
                  title: 'ERFB/BT (BOAT TAIL)',
                  desc: '3° boat tail taper without active base burn grain.',
                },
              ].map((b) => {
                const isSelected = currentBase === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() =>
                      onUpdateConfig({
                        scenario: { ...config.scenario, baseGeometry: b.id },
                      })
                    }
                    className={`p-2 border text-left flex flex-col gap-0.5 transition-colors ${
                      isSelected
                        ? 'bg-[#1A73E8] text-white border-[#1A73E8] font-bold shadow-[0_0_8px_rgba(26,115,232,0.5)]'
                        : 'bg-[#121316] text-[#8A8F9E] border-[#2D3138] hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-[10px]">{b.title}</span>
                    <span className="text-[9px] opacity-80">{b.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. QUADRANT ELEVATION (QE) */}
          <div className="border border-[#2D3138] bg-[#18191C] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[#00FFFF] font-bold block text-[11px] uppercase tracking-wider">
                4. QUADRANT ELEVATION (MIL / DEGREES)
              </label>
              <span className="text-[#00FF00] font-bold">{currentQe} mil ({(currentQe * 0.05625).toFixed(1)}°)</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { qe: 300, label: '300 mil (23.5km)' },
                { qe: 500, label: '500 mil (30.4km)' },
                { qe: 700, label: '700 mil (35.8km)' },
                { qe: 894, label: '894 mil (38.5km)' },
              ].map((q) => {
                const isSelected = currentQe === q.qe;
                return (
                  <button
                    key={q.qe}
                    type="button"
                    onClick={() =>
                      onUpdateConfig({
                        scenario: { ...config.scenario, quadrantElevationMil: q.qe },
                      })
                    }
                    className={`py-1.5 px-2 border text-[10px] uppercase font-bold transition-colors ${
                      isSelected
                        ? 'bg-[#FF9822] text-[#121316] border-[#FF9822] shadow-[0_0_8px_rgba(255,152,34,0.5)]'
                        : 'bg-[#121316] text-[#8A8F9E] border-[#2D3138] hover:text-white'
                    }`}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. ATMOSPHERIC DISTURBANCE */}
          <div className="border border-[#2D3138] bg-[#18191C] p-3 space-y-2">
            <label className="text-[#00FFFF] font-bold block text-[11px] uppercase tracking-wider">
              5. CROSSWIND &amp; ATMOSPHERIC DISTURBANCE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: 'Calm (<5 m/s)' },
                { id: 'moderate', label: 'Moderate (10 m/s)' },
                { id: 'high', label: 'High Crosswind (20 m/s)' },
              ].map((dist) => {
                const isSelected = config.environment.disturbance === dist.id;
                return (
                  <button
                    key={dist.id}
                    type="button"
                    onClick={() =>
                      onUpdateConfig({
                        environment: {
                          ...config.environment,
                          disturbance: dist.id as EnvironmentDisturbance,
                        },
                      })
                    }
                    className={`py-1.5 px-2 border text-[10px] uppercase font-bold transition-colors ${
                      isSelected
                        ? 'bg-[#1A73E8] text-white border-[#1A73E8] shadow-[0_0_8px_rgba(26,115,232,0.5)]'
                        : 'bg-[#121316] text-[#8A8F9E] border-[#2D3138] hover:text-white'
                    }`}
                  >
                    {dist.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#18191C] p-3 border-t border-[#2D3138] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-[#33363D] text-[#8A8F9E] hover:text-white hover:border-[#6B7180] text-xs font-bold uppercase transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onFire();
              onClose();
            }}
            className="px-5 py-1.5 bg-[#FF9822] text-[#121316] hover:bg-[#FFA500] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_12px_rgba(255,152,34,0.4)] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>APPLY &amp; RUN BALLISTIC SIMULATION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
