/**
 * Typed configuration and simulation data models.
 * Conceptual academic simulation models only — not real weapon guidance data.
 */

export type NavigationScheme = 'inertial' | 'gnss' | 'sensor_fusion';
export type ControlConcept = 'passive' | 'aerodynamic' | 'canard';
export type FuzeConcept = 'impact' | 'time' | 'proximity' | 'multimode';
export type TopCapType = 'original_cap' | 'ps_canard_cap';
export type PropellingChargeType = 'charge_d' | 'charge_aab';
export type BaseGeometryType = 'erfb_bb' | 'erfb_bt';
export type EnvironmentDisturbance = 'low' | 'moderate' | 'high';
export type SensorQuality = 'low' | 'normal' | 'high';
export type NavigationAvailability = 'available' | 'limited' | 'unavailable';

export interface Ballistics155Data {
  muzzleVelocity: number; // m/s (e.g. 908 for Charge D, 620 for Charge A+A+B)
  maxRange: number; // m
  vertexAltitude: number; // m
  timeOfFlight: number; // s
  grazeVelocity: number; // m/s
  driftMil: number; // mil
  quadrantElevationMil: number; // mil (100 - 1100 mil)
  quadrantElevationDeg: number; // deg
  chargeType: PropellingChargeType;
  baseType: BaseGeometryType;
  machLaunch: number;
}

export interface ScenarioConfig {
  scenarioName: string;
  scenarioType: string;
  target: string;
  initialState: string;
  topCap: TopCapType; // 'original_cap' (Standard M557/M739 fuze) vs 'ps_canard_cap' (PGK steering fins)
  charge: PropellingChargeType; // 'charge_d' (908 m/s) vs 'charge_aab' (620 m/s)
  baseGeometry: BaseGeometryType; // 'erfb_bb' (Base Bleed) vs 'erfb_bt' (Boat Tail)
  quadrantElevationMil: number; // e.g. 700 mil (39.4°) or 894 mil (50.3° max range)
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

  // NATO Stanag 4355 & Balon-Komenda Ballistic Analysis & CEP Error Radius
  topCap: TopCapType;
  originalCapCep: number; // Circular Error Probable (50% radius) in meters for Original standard fuze cap
  originalCapR95: number; // 95% containment radius in meters for Original cap
  psCapCep: number; // CEP (50% radius) in meters for our PS Cap with Canard Fins
  psCapR95: number; // 95% containment radius in meters for our PS Cap with Canard Fins
  activeCapCep: number; // Currently active selected cap CEP
  activeCapR95: number; // Currently active selected cap R95
  errorRadiusReductionPct: number; // e.g. 93.4% reduction
  rangeProbableError: number; // PE_R (m)
  deflectionProbableError: number; // PE_L (m)
  canardDeflectionDeg: number; // Live canard trim angle (deg)
  ballistics155: Ballistics155Data;
}

export type PageId = 'configure' | 'simulation' | 'results';
