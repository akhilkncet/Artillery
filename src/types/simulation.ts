/**
 * Typed configuration and simulation data models.
 * Conceptual academic simulation models only — not real weapon guidance data.
 */

export type NavigationScheme = 'inertial' | 'gnss' | 'sensor_fusion';
export type ControlConcept = 'passive' | 'aerodynamic' | 'canard';
export type FuzeConcept = 'impact' | 'time' | 'proximity' | 'multimode';
export type EnvironmentDisturbance = 'low' | 'moderate' | 'high';
export type SensorQuality = 'low' | 'normal' | 'high';
export type NavigationAvailability = 'available' | 'limited' | 'unavailable';

export interface ScenarioConfig {
  scenarioName: string;
  scenarioType: string;
  target: string;
  initialState: string;
}

export interface NavigationConfig {
  scheme: NavigationScheme;
  sensorAvailability: string; // 'Nominal' | 'Degraded' | 'Intermittent' | 'High-Rate'
  navigationQuality: string; // 'Normal' | 'High' | 'Low'
}

export interface ControlConfig {
  method: ControlConcept;
  correctionEnabled: boolean;
}

export interface FuzeConfig {
  concept: FuzeConcept;
  modeLabel: string; // 'Simulation Only'
}

export interface EnvironmentConfig {
  disturbance: EnvironmentDisturbance;
  sensorQuality: SensorQuality;
  navigationAvailability: NavigationAvailability;
}

export interface SimulationSettings {
  showNominalTrajectory: boolean;
  showSimulatedTrajectory: boolean;
  showTarget: boolean;
  showCorrectionEvents: boolean;
  duration: string; // 'Fast (5s)' | 'Standard (10s)' | 'Extended (15s)'
  animationSpeed: 'normal' | '0.5x' | '1.5x' | '2.0x';
}

export interface SimulationConfiguration {
  scenario: ScenarioConfig;
  navigation: NavigationConfig;
  control: ControlConfig;
  fuze: FuzeConfig;
  environment: EnvironmentConfig;
  settings: SimulationSettings;
}

export type SimulationPhase = 'initialization' | 'navigation' | 'flight' | 'correction' | 'endpoint';

export interface Vec2 {
  x: number;
  y: number;
}

export interface TrajectorySample {
  time: number; // seconds
  progress: number; // 0.0 - 1.0
  position: Vec2;
  deviation: number; // cross-track distance from the reference path at this sample
  uncertainty: number; // simulated state-estimation uncertainty radius
  phase: SimulationPhase;
  correctionActive: boolean;
}

export interface CorrectionEvent {
  progress: number;
  time: number;
  position: Vec2;
  description: string;
}

export interface FuzeEvent {
  progress: number;
  time: number;
  position: Vec2;
  description: string;
}

export interface SimulationResult {
  configurationSnapshot: SimulationConfiguration;
  trajectory: TrajectorySample[];
  nominalTrajectory: TrajectorySample[];
  startPosition: Vec2;
  targetPosition: Vec2;
  correctionEvents: CorrectionEvent[];
  fuzeEvent: FuzeEvent;
  deviationOverTime: { progress: number; deviation: number }[];
  finalDeviation: number;
  peakDeviation: number;
  peakDeviationProgress: number;
  correctionApplied: boolean;
  correctionEffect: number; // % reduction in final deviation vs an uncorrected reference run
  navigationState: 'STABLE' | 'NOMINAL' | 'DEGRADED';
  navigationUncertaintyFactor: number;
  simulationDuration: number; // seconds
  generatedAt: string;
}

export type PageId = 'configure' | 'simulation' | 'results';
