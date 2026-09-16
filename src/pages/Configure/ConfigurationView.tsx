import React, { useState } from 'react';
import { useSimulation } from '../../state/SimulationContext';
import {
  NavigationScheme,
  ControlConcept,
  FuzeConcept,
  EnvironmentDisturbance,
  SensorQuality,
  NavigationAvailability,
} from '../../types/simulation';
import { TrajectoryMiniPreview } from './TrajectoryMiniPreview';
import { ShellPreview } from '../../components/shell/ShellPreview';
import {
  Save,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Compass,
  Clock,
  Radio,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';

export const ConfigurationView: React.FC = () => {
  const {
    configuration,
    updateConfiguration,
    validation,
    generateSimulation,
    resetConfiguration,
    saveConfigurationToStorage,
    loadConfigurationFromStorage,
    saveStatusMessage,
  } = useSimulation();

  const [activeSection, setActiveSection] = useState<string>('01 Scenario');

  const scrollToSection = (id: string, name: string) => {
    setActiveSection(name);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navTabs = [
    { num: '01', name: 'Scenario', id: 'section-scenario' },
    { num: '02', name: 'Navigation', id: 'section-navigation' },
    { num: '03', name: 'Control', id: 'section-control' },
    { num: '04', name: 'Fuze', id: 'section-fuze' },
    { num: '05', name: 'Environment', id: 'section-environment' },
    { num: '06', name: 'Simulation', id: 'section-simulation' },
  ];

  return (
    <div className="flex-1 flex flex-col xl:flex-row max-w-[1600px] w-full mx-auto p-4 sm:p-6 gap-6">
      {/* Left Navigation Tabs Rail */}
      <aside className="w-full xl:w-48 shrink-0 flex flex-col border-b xl:border-b-0 xl:border-r border-[#122b1d] pb-4 xl:pb-0 xl:pr-4">
        <div className="text-[11px] font-mono-tech text-[#4e7a5e] tracking-widest uppercase mb-3 font-bold">
          CONFIGURATION
        </div>
        <nav className="flex flex-row xl:flex-col gap-1 overflow-x-auto xl:overflow-x-visible pb-2 xl:pb-0">
          {navTabs.map((tab) => {
            const isActive = activeSection.includes(tab.name);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id, `${tab.num} ${tab.name}`)}
                className={`flex items-center gap-2 px-3 py-2 text-left font-mono-tech text-xs tracking-wider transition-colors border ${
                  isActive
                    ? 'bg-[#0b1a11] text-[#05ffa1] border-[#05ffa1]/60 font-bold'
                    : 'text-[#849588] border-transparent hover:text-[#d9e6da] hover:bg-[#06100a]'
                }`}
              >
                <span className={isActive ? 'text-[#05ffa1]' : 'text-[#4e7a5e]'}>{tab.num}</span>
                <span className="whitespace-nowrap">{tab.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden xl:block mt-6">
          <ShellPreview fuzeConcept={configuration.fuze.concept} />
        </div>
      </aside>

      {/* Main Configuration Editor */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-mono-tech font-bold text-white tracking-wider">
            SYSTEM CONFIGURATION
          </h1>
          <p className="text-xs sm:text-sm font-mono-tech text-[#849588] mt-1">
            Configure the conceptual shell/fuze system before running the simulation.
          </p>
        </div>

        <div className="xl:hidden mb-6">
          <ShellPreview fuzeConcept={configuration.fuze.concept} />
        </div>

        {/* Form Validation Alerts if any */}
        {!validation.isValid && (
          <div className="mb-6 p-3 bg-[#1c0808] border border-[#ff3b30]/60 text-[#ffb4ab] text-xs font-mono-tech flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#ff3b30] mt-0.5" />
            <div>
              <div className="font-bold text-[#ff3b30] uppercase">Validation Required:</div>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                {Object.entries(validation.errors).map(([key, msg]) => (
                  <li key={key}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* COLUMN 1 */}
          <div className="flex flex-col gap-6">

            {/* 01 SCENARIO */}
            <section id="section-scenario" className="border border-[#122b1d] bg-[#060e09] p-4">
              <div className="flex items-center gap-2 mb-4 border-b border-[#0f2317] pb-2">
                <span className="text-xs font-mono-tech font-bold text-[#05ffa1] bg-[#0b1a11] px-1.5 py-0.5 border border-[#133822]">
                  01
                </span>
                <h2 className="text-xs font-mono-tech font-bold text-white uppercase tracking-wider">
                  SCENARIO
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-tech">
                <div>
                  <label htmlFor="scenario-name-input" className="block text-[#4e7a5e] mb-1 uppercase tracking-wider text-[11px]">
                    SCENARIO NAME
                  </label>
                  <input
                    id="scenario-name-input"
                    type="text"
                    value={configuration.scenario.scenarioName}
                    onChange={(e) =>
                      updateConfiguration({
                        scenario: { ...configuration.scenario, scenarioName: e.target.value },
                      })
                    }
                    className="w-full bg-[#030704] border border-[#133822] focus:border-[#05ffa1] px-3 py-2 text-[#05ffa1] font-mono-tech text-xs outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="scenario-type-select" className="block text-[#4e7a5e] mb-1 uppercase tracking-wider text-[11px]">
                    SCENARIO TYPE
                  </label>
                  <select
                    id="scenario-type-select"
                    value={configuration.scenario.scenarioType}
                    onChange={(e) =>
                      updateConfiguration({
                        scenario: { ...configuration.scenario, scenarioType: e.target.value },
                      })
                    }
                    className="w-full bg-[#030704] border border-[#133822] focus:border-[#05ffa1] px-3 py-2 text-[#d9e6da] font-mono-tech text-xs outline-none cursor-pointer"
                  >
                    <option value="Standard Demonstration">Standard Demonstration</option>
                    <option value="High-Disturbance Evaluation">High-Disturbance Evaluation</option>
                    <option value="Target Offset Analysis">Target Offset Analysis</option>
                    <option value="Precision Drift Demonstration">Precision Drift Demonstration</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="target-select" className="block text-[#4e7a5e] mb-1 uppercase tracking-wider text-[11px]">
                    TARGET
                  </label>
                  <select
                    id="target-select"
                    value={configuration.scenario.target}
                    onChange={(e) =>
                      updateConfiguration({
                        scenario: { ...configuration.scenario, target: e.target.value },
                      })
                    }
                    className="w-full bg-[#030704] border border-[#133822] focus:border-[#05ffa1] px-3 py-2 text-[#d9e6da] font-mono-tech text-xs outline-none cursor-pointer"
                  >
                    <option value="Target A">Target A</option>
                    <option value="Target B">Target B</option>
                    <option value="Target C">Target C</option>
                    <option value="Offset Grid X-1">Offset Grid X-1</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="initial-state-select" className="block text-[#4e7a5e] mb-1 uppercase tracking-wider text-[11px]">
                    INITIAL STATE
                  </label>
                  <select
                    id="initial-state-select"
                    value={configuration.scenario.initialState}
                    onChange={(e) =>
                      updateConfiguration({
                        scenario: { ...configuration.scenario, initialState: e.target.value },
                      })
                    }
                    className="w-full bg-[#030704] border border-[#133822] focus:border-[#05ffa1] px-3 py-2 text-[#d9e6da] font-mono-tech text-xs outline-none cursor-pointer"
                  >
                    <option value="Nominal">Nominal</option>
                    <option value="Dispersion Alpha">Dispersion Alpha</option>
                    <option value="Perturbed Initial Velocity">Perturbed Initial Velocity</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#0e2518] text-[11px] font-mono-tech text-[#4e7a5e]">
                Defines the conceptual conditions used by the simulation.
              </div>
            </section>

            {/* 02 NAVIGATION CONCEPT */}
            <section id="section-navigation" className="border border-[#122b1d] bg-[#060e09] p-4">
              <div className="flex items-center gap-2 mb-4 border-b border-[#0f2317] pb-2">
                <span className="text-xs font-mono-tech font-bold text-[#05ffa1] bg-[#0b1a11] px-1.5 py-0.5 border border-[#133822]">
                  02
                </span>
                <h2 className="text-xs font-mono-tech font-bold text-white uppercase tracking-wider">
                  NAVIGATION CONCEPT
                </h2>
              </div>

              <div className="mb-4">
                <div className="text-[11px] font-mono-tech text-[#4e7a5e] uppercase tracking-wider mb-2">
                  NAVIGATION SCHEME
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'inertial', title: 'Inertial Concept', desc: 'Dead reckoning' },
                    { id: 'gnss', title: 'GNSS-Assisted Concept', desc: 'Periodic position fixes' },
                    { id: 'sensor_fusion', title: 'Sensor-Fusion Concept', desc: 'Integrated navigation' },
                  ].map((item) => {
                    const isSelected = configuration.navigation.scheme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          updateConfiguration({
                            navigation: {
                              ...configuration.navigation,
                              scheme: item.id as NavigationScheme,
                            },
                          })
                        }
                        className={`p-3 text-left border transition-colors flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#0b1a11] border-[#05ffa1] text-white'
                            : 'bg-[#030704] border-[#133822] text-[#849588] hover:border-[#1a442b]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <span className="font-mono-tech text-xs font-bold leading-tight">
                            {item.title}
                          </span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'border-[#05ffa1] bg-[#05ffa1]' : 'border-[#4e7a5e]'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#030704]" />}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono-tech text-[#4e7a5e]">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-tech mb-4">
                <div>
                  <label htmlFor="sensor-availability-select" className="block text-[#4e7a5e] mb-1 uppercase tracking-wider text-[11px]">
                    SENSOR AVAILABILITY
                  </label>
                  <select
                    id="sensor-availability-select"
                    value={configuration.navigation.sensorAvailability}
                    onChange={(e) =>
                      updateConfiguration({
                        navigation: {
                          ...configuration.navigation,
                          sensorAvailability: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#030704] border border-[#133822] focus:border-[#05ffa1] px-3 py-2 text-[#d9e6da] font-mono-tech text-xs outline-none cursor-pointer"
                  >
                    <option value="Nominal">Nominal</option>
                    <option value="Degraded">Degraded</option>
                    <option value="Intermittent">Intermittent</option>
                    <option value="High-Rate">High-Rate</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="nav-quality-select" className="block text-[#4e7a5e] mb-1 uppercase tracking-wider text-[11px]">
                    NAVIGATION QUALITY
                  </label>
                  <select
                    id="nav-quality-select"
                    value={configuration.navigation.navigationQuality}
                    onChange={(e) =>
                      updateConfiguration({
                        navigation: {
                          ...configuration.navigation,
                          navigationQuality: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#030704] border border-[#133822] focus:border-[#05ffa1] px-3 py-2 text-[#d9e6da] font-mono-tech text-xs outline-none cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Conceptual Flow Schematic */}
              <div className="border border-[#133822] bg-[#030704] p-3">
                <div className="text-[10px] font-mono-tech text-[#4e7a5e] tracking-widest uppercase mb-2">
                  CONCEPTUAL FLOW
                </div>
                <div className="flex items-center justify-between text-xs font-mono-tech text-[#05ffa1] font-bold tracking-wider">
                  <div className="px-2.5 py-1 border border-[#05ffa1]/40 bg-[#06100a]">SENSORS</div>
                  <span className="text-[#4e7a5e]">→</span>
                  <div className="px-2.5 py-1 border border-[#05ffa1]/40 bg-[#06100a]">NAVIGATION</div>
                  <span className="text-[#4e7a5e]">→</span>
                  <div className="px-2.5 py-1 border border-[#05ffa1] bg-[#0b1a11] text-[#05ffa1]">
                    STATE ESTIMATE
                  </div>
                </div>
              </div>
            </section>

            {/* 05 ENVIRONMENT */}
            <section id="section-environment" className="border border-[#122b1d] bg-[#060e09] p-4">
              <div className="flex items-center gap-2 mb-4 border-b border-[#0f2317] pb-2">
                <span className="text-xs font-mono-tech font-bold text-[#05ffa1] bg-[#0b1a11] px-1.5 py-0.5 border border-[#133822]">
                  05
                </span>
                <h2 className="text-xs font-mono-tech font-bold text-white uppercase tracking-wider">
                  ENVIRONMENT
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-tech">
                <div>
                  <div className="text-[11px] font-mono-tech text-[#4e7a5e] uppercase tracking-wider mb-2">
                    ENVIRONMENTAL DISTURBANCE
                  </div>
                  <div className="flex items-center border border-[#133822] bg-[#030704] p-1 gap-1">
                    {(['low', 'moderate', 'high'] as EnvironmentDisturbance[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          updateConfiguration({
                            environment: { ...configuration.environment, disturbance: level },
                          })
                        }
                        className={`flex-1 py-1.5 text-center uppercase font-mono-tech text-[11px] transition-colors ${
                          configuration.environment.disturbance === level
                            ? 'bg-[#05ffa1] text-[#030704] font-bold'
                            : 'text-[#849588] hover:text-[#d9e6da]'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono-tech text-[#4e7a5e] uppercase tracking-wider mb-2">
                    SENSOR QUALITY
                  </div>
                  <div className="flex items-center border border-[#133822] bg-[#030704] p-1 gap-1">
                    {(['low', 'normal', 'high'] as SensorQuality[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() =>
                          updateConfiguration({
                            environment: { ...configuration.environment, sensorQuality: lvl },
                          })
                        }
                        className={`flex-1 py-1.5 text-center uppercase font-mono-tech text-[11px] transition-colors ${
                          configuration.environment.sensorQuality === lvl
                            ? 'bg-[#05ffa1] text-[#030704] font-bold'
                            : 'text-[#849588] hover:text-[#d9e6da]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="nav-avail-select" className="block text-[#4e7a5e] uppercase tracking-wider text-[11px] mb-2">
                    NAVIGATION AVAILABILITY
                  </label>
                  <select
                    id="nav-avail-select"
                    value={configuration.environment.navigationAvailability}
                    onChange={(e) =>
                      updateConfiguration({
                        environment: {
                          ...configuration.environment,
                          navigationAvailability: e.target.value as NavigationAvailability,
                        },
                      })
                    }
                    className="w-full bg-[#030704] border border-[#133822] focus:border-[#05ffa1] px-3 py-2 text-[#d9e6da] font-mono-tech text-xs outline-none cursor-pointer"
                  >
                    <option value="available">Available</option>
                    <option value="limited">Limited</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </section>

          </div>

          {/* COLUMN 2 */}
          <div className="flex flex-col gap-6">

            {/* 03 CONTROL CONCEPT */}
            <section id="section-control" className="border border-[#122b1d] bg-[#060e09] p-4">
              <div className="flex items-center justify-between mb-4 border-b border-[#0f2317] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-tech font-bold text-[#05ffa1] bg-[#0b1a11] px-1.5 py-0.5 border border-[#133822]">
                    03
                  </span>
                  <h2 className="text-xs font-mono-tech font-bold text-white uppercase tracking-wider">
                    CONTROL CONCEPT
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateConfiguration({
                      control: {
                        ...configuration.control,
                        correctionEnabled: !configuration.control.correctionEnabled,
                      },
                    })
                  }
                  disabled={configuration.control.method === 'passive'}
                  className={`text-xs font-mono-tech px-2 py-1 border transition-colors ${
                    configuration.control.method === 'passive'
                      ? 'border-[#133822] text-[#4e7a5e] cursor-not-allowed'
                      : configuration.control.correctionEnabled
                      ? 'border-[#05ffa1] text-[#05ffa1] bg-[#0b1a11]'
                      : 'border-[#133822] text-[#849588] hover:border-[#4e7a5e]'
                  }`}
                >
                  Correction: {configuration.control.method === 'passive' || !configuration.control.correctionEnabled ? 'Disabled' : 'Enabled'}
                </button>
              </div>

              <div className="mb-4">
                <div className="text-[11px] font-mono-tech text-[#4e7a5e] uppercase tracking-wider mb-2">
                  ACTUATION METHOD
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'passive',
                      title: 'Passive / Ballistic',
                      desc: 'Pure unguided flight',
                    },
                    {
                      id: 'aerodynamic',
                      title: 'Aerodynamic Correction',
                      desc: 'Trim surface adjustments',
                    },
                    {
                      id: 'canard',
                      title: 'Canard-Based Correction',
                      desc: 'Active steering fin concept',
                    },
                  ].map((item) => {
                    const isSelected = configuration.control.method === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          updateConfiguration({
                            control: {
                              method: item.id as ControlConcept,
                              correctionEnabled: item.id === 'passive' ? false : true,
                            },
                          })
                        }
                        className={`p-3 text-left border transition-colors flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#0b1a11] border-[#05ffa1] text-white'
                            : 'bg-[#030704] border-[#133822] text-[#849588] hover:border-[#1a442b]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <span className="font-mono-tech text-xs font-bold leading-tight">
                            {item.title}
                          </span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'border-[#05ffa1] bg-[#05ffa1]' : 'border-[#4e7a5e]'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#030704]" />}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono-tech text-[#4e7a5e]">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conceptual Control Flow */}
              <div className="border border-[#133822] bg-[#030704] p-3">
                <div className="text-[10px] font-mono-tech text-[#4e7a5e] tracking-widest uppercase mb-2">
                  CONCEPTUAL CONTROL FLOW
                </div>
                <div className="flex items-center justify-between text-xs font-mono-tech text-[#05ffa1] font-bold tracking-wider">
                  <div className="px-2 py-1 border border-[#05ffa1]/40 bg-[#06100a]">
                    Navigation State
                  </div>
                  <span className="text-[#4e7a5e]">→</span>
                  <div className="px-2 py-1 border border-[#05ffa1]/40 bg-[#06100a]">
                    Control Decision
                  </div>
                  <span className="text-[#4e7a5e]">→</span>
                  <div className="px-2 py-1 border border-[#05ffa1] bg-[#0b1a11] text-[#05ffa1]">
                    Trajectory Adjustment
                  </div>
                </div>
              </div>
            </section>

            {/* 04 FUZE CONCEPT */}
            <section id="section-fuze" className="border border-[#122b1d] bg-[#060e09] p-4">
              <div className="flex items-center justify-between mb-4 border-b border-[#0f2317] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-tech font-bold text-[#05ffa1] bg-[#0b1a11] px-1.5 py-0.5 border border-[#133822]">
                    04
                  </span>
                  <h2 className="text-xs font-mono-tech font-bold text-white uppercase tracking-wider">
                    FUZE CONCEPT
                  </h2>
                </div>
                <span className="px-2 py-0.5 border border-[#ff3b30]/80 bg-[#1c0808] text-[#ff3b30] text-[10px] font-mono-tech font-bold uppercase tracking-widest">
                  SIMULATION ONLY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'impact',
                    code: '01 // IMPACT',
                    desc: 'Conceptual impact-event demonstration.',
                    icon: Compass,
                  },
                  {
                    id: 'time',
                    code: '02 // TIME',
                    desc: 'Conceptual time-based event.',
                    icon: Clock,
                  },
                  {
                    id: 'proximity',
                    code: '03 // PROXIMITY',
                    desc: 'Conceptual proximity-event demonstration.',
                    icon: Radio,
                  },
                  {
                    id: 'multimode',
                    code: '04 // MULTI-MODE',
                    desc: 'Combines multiple conceptual event modes.',
                    icon: CheckCircle2,
                  },
                ].map((item) => {
                  const isSelected = configuration.fuze.concept === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        updateConfiguration({
                          fuze: {
                            ...configuration.fuze,
                            concept: item.id as FuzeConcept,
                          },
                        })
                      }
                      className={`p-3 text-left border transition-colors flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#0b1a11] border-[#05ffa1] text-white'
                          : 'bg-[#030704] border-[#133822] text-[#849588] hover:border-[#1a442b]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono-tech text-xs font-bold text-white">
                          {item.code}
                        </span>
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#05ffa1]' : 'text-[#4e7a5e]'}`} />
                      </div>
                      <p className="text-[11px] font-mono-tech text-[#4e7a5e] leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 06 SIMULATION SETTINGS */}
            <section id="section-simulation" className="border border-[#122b1d] bg-[#060e09] p-4">
              <div className="flex items-center gap-2 mb-4 border-b border-[#0f2317] pb-2">
                <span className="text-xs font-mono-tech font-bold text-[#05ffa1] bg-[#0b1a11] px-1.5 py-0.5 border border-[#133822]">
                  06
                </span>
                <h2 className="text-xs font-mono-tech font-bold text-white uppercase tracking-wider">
                  SIMULATION SETTINGS
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <div className="text-[11px] font-mono-tech text-[#4e7a5e] uppercase tracking-wider">
                    OVERLAY VISIBILITY
                  </div>

                  {[
                    { key: 'showNominalTrajectory', label: 'Show Nominal Trajectory' },
                    { key: 'showSimulatedTrajectory', label: 'Show Simulated Trajectory' },
                    { key: 'showTarget', label: 'Show Target' },
                    { key: 'showCorrectionEvents', label: 'Show Correction Events' },
                  ].map((setting) => {
                    const isChecked = configuration.settings[
                      setting.key as keyof typeof configuration.settings
                    ] as boolean;
                    return (
                      <label
                        key={setting.key}
                        className="flex items-center gap-2.5 cursor-pointer text-xs font-mono-tech text-[#d9e6da]"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            updateConfiguration({
                              settings: {
                                ...configuration.settings,
                                [setting.key]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 rounded-none bg-[#030704] border border-[#133822] checked:bg-[#05ffa1] checked:border-[#05ffa1] accent-[#05ffa1] cursor-pointer"
                        />
                        <span>{setting.label}</span>
                      </label>
                    );
                  })}

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <label htmlFor="duration-select" className="block text-[10px] font-mono-tech text-[#4e7a5e] uppercase mb-1">
                        DURATION
                      </label>
                      <select
                        id="duration-select"
                        value={configuration.settings.duration}
                        onChange={(e) =>
                          updateConfiguration({
                            settings: { ...configuration.settings, duration: e.target.value },
                          })
                        }
                        className="w-full bg-[#030704] border border-[#133822] focus:border-[#05ffa1] px-2 py-1.5 text-xs text-[#d9e6da] font-mono-tech outline-none"
                      >
                        <option value="Fast (5s)">Fast (5s)</option>
                        <option value="Standard (10s)">Standard (10s)</option>
                        <option value="Extended (15s)">Extended (15s)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="speed-select" className="block text-[10px] font-mono-tech text-[#4e7a5e] uppercase mb-1">
                        ANIMATION SPEED
                      </label>
                      <select
                        id="speed-select"
                        value={configuration.settings.animationSpeed}
                        onChange={(e) =>
                          updateConfiguration({
                            settings: {
                              ...configuration.settings,
                              animationSpeed: e.target.value as any,
                            },
                          })
                        }
                        className="w-full bg-[#030704] border border-[#133822] focus:border-[#05ffa1] px-2 py-1.5 text-xs text-[#d9e6da] font-mono-tech outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="0.5x">0.5x Slow</option>
                        <option value="1.5x">1.5x Fast</option>
                        <option value="2.0x">2.0x High Speed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-full">
                  <TrajectoryMiniPreview config={configuration} />
                </div>
              </div>
            </section>

          </div>

        </div>

        {/* Bottom Command Bar */}
        <div className="mt-8 pt-4 border-t border-[#122b1d] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#060e09] p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-[#05ffa1] tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#05ffa1]" />
              <span>
                CONFIGURATION STATUS:{' '}
                <strong className={validation.isValid ? 'text-[#05ffa1]' : 'text-[#ff3b30]'}>
                  {validation.isValid ? 'READY' : 'INVALID'}
                </strong>
              </span>
            </div>
            {saveStatusMessage && (
              <span className="text-xs font-mono-tech text-[#1df4c9] bg-[#0b1a11] px-2 py-0.5 border border-[#133822]">
                {saveStatusMessage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
            <button
              type="button"
              onClick={resetConfiguration}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#030704] border border-[#133822] text-[#849588] hover:text-white hover:border-[#4e7a5e] text-xs font-mono-tech tracking-wider uppercase transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>

            <button
              type="button"
              onClick={loadConfigurationFromStorage}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#030704] border border-[#133822] text-[#849588] hover:text-white hover:border-[#4e7a5e] text-xs font-mono-tech tracking-wider uppercase transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>LOAD</span>
            </button>

            <button
              type="button"
              onClick={saveConfigurationToStorage}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0b1a11] border border-[#163523] text-[#05ffa1] hover:bg-[#0e2518] text-xs font-mono-tech tracking-wider uppercase transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>SAVE CONFIGURATION</span>
            </button>

            <button
              type="button"
              id="generate-simulation-btn"
              onClick={() => generateSimulation()}
              className="flex items-center gap-2 px-5 py-2 bg-[#05ffa1] hover:bg-[#1df4c9] text-[#030704] font-mono-tech font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>GENERATE SIMULATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
