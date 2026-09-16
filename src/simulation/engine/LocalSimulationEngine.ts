import {
  SimulationConfiguration,
  SimulationResult,
  TrajectorySample,
  CorrectionEvent,
  FuzeEvent,
  SimulationPhase,
  Vec2,
} from '../../types/simulation';
import { SimulationEngine } from './SimulationEngine';
import { hashStringToSeed, createSeededRandom, toSignedUnit } from '../../utils/seededRandom';

const GRAVITY = 9.8; // generic normalized gravitational constant
const LAUNCH_ANGLE_DEG = 45;

function durationSeconds(duration: string): number {
  if (duration.includes('5')) return 5;
  if (duration.includes('15')) return 15;
  return 10;
}

interface ScenarioTypeProfile {
  disturbanceMultiplier: number;
  targetOffsetMultiplier: number;
  correctionGainMultiplier?: number;
}

function scenarioTypeProfile(scenarioType: string): ScenarioTypeProfile {
  switch (scenarioType) {
    case 'High-Disturbance Evaluation':
      return { disturbanceMultiplier: 1.6, targetOffsetMultiplier: 1.0 };
    case 'Target Offset Analysis':
      return { disturbanceMultiplier: 1.0, targetOffsetMultiplier: 1.6 };
    case 'Precision Drift Demonstration':
      return { disturbanceMultiplier: 1.15, targetOffsetMultiplier: 1.0, correctionGainMultiplier: 0.85 };
    case 'Standard Demonstration':
    default:
      return { disturbanceMultiplier: 1.0, targetOffsetMultiplier: 1.0 };
  }
}

function targetOffsetProfile(target: string) {
  // Fractions of nominal range (x) and a fixed lateral (y) fraction.
  switch (target) {
    case 'Target B':
      return { x: 0.02, y: 0.03 };
    case 'Target C':
      return { x: -0.015, y: -0.025 };
    case 'Offset Grid X-1':
      return { x: 0.05, y: 0.06 };
    case 'Target A':
    default:
      return { x: 0, y: 0 };
  }
}

function initialStateProfile(initialState: string, random: () => number) {
  switch (initialState) {
    case 'Dispersion Alpha':
      return { initialLateralDeviation: 4 };
    case 'Perturbed Initial Velocity':
      return { initialLateralDeviation: toSignedUnit(random()) * 10 };
    case 'Nominal':
    default:
      return { initialLateralDeviation: 0 };
  }
}

function baseDisturbanceFraction(level: 'low' | 'moderate' | 'high'): number {
  switch (level) {
    case 'low':
      return 0.018;
    case 'high':
      return 0.075;
    case 'moderate':
    default:
      return 0.04;
  }
}

function sensorQualityFactor(quality: 'low' | 'normal' | 'high'): number {
  switch (quality) {
    case 'low':
      return 1.3;
    case 'high':
      return 0.75;
    case 'normal':
    default:
      return 1.0;
  }
}

function navQualityFactor(quality: string): number {
  switch (quality) {
    case 'High':
      return 0.7;
    case 'Low':
      return 1.4;
    case 'Normal':
    default:
      return 1.0;
  }
}

function sensorAvailabilityFactor(availability: string): number {
  switch (availability) {
    case 'Degraded':
      return 1.2;
    case 'Intermittent':
      return 1.35;
    case 'High-Rate':
      return 0.85;
    case 'Nominal':
    default:
      return 1.0;
  }
}

function navAvailabilityUncertaintyFactor(availability: 'available' | 'limited' | 'unavailable'): number {
  switch (availability) {
    case 'limited':
      return 1.25;
    case 'unavailable':
      return 1.6;
    case 'available':
    default:
      return 1.0;
  }
}

function navAvailabilityCorrectionMultiplier(availability: 'available' | 'limited' | 'unavailable'): number {
  switch (availability) {
    case 'limited':
      return 0.6;
    case 'unavailable':
      return 0.25;
    case 'available':
    default:
      return 1.0;
  }
}

function correctionGainFor(method: 'passive' | 'aerodynamic' | 'canard'): number {
  switch (method) {
    case 'canard':
      return 3.2;
    case 'aerodynamic':
      return 1.6;
    case 'passive':
    default:
      return 0;
  }
}

function correctionStartProgressFor(method: 'passive' | 'aerodynamic' | 'canard'): number {
  return method === 'canard' ? 0.3 : 0.4;
}

function phaseForProgress(
  progress: number,
  correctionActive: boolean,
  correctionEnabled: boolean
): SimulationPhase {
  if (progress < 0.08) return 'initialization';
  if (progress < 0.22) return 'navigation';
  if (progress >= 0.92) return 'endpoint';
  if (correctionEnabled && correctionActive) return 'correction';
  return 'flight';
}

interface DeviationRunResult {
  samples: number[]; // deviation magnitude at each step index
  positions: Vec2[]; // simulated (x,y) at each step index
  correctionActiveFlags: boolean[];
}

export class LocalSimulationEngine implements SimulationEngine {
  public runSimulation(config: SimulationConfiguration): SimulationResult {
    const T = durationSeconds(config.settings.duration);
    const steps = Math.max(20, Math.round(T * 10));
    const dt = T / steps;

    const thetaRad = (LAUNCH_ANGLE_DEG * Math.PI) / 180;
    const v0 = (T * GRAVITY) / (2 * Math.sin(thetaRad));
    const range = (v0 * v0 * Math.sin(2 * thetaRad)) / GRAVITY;

    const scenarioProfile = scenarioTypeProfile(config.scenario.scenarioType);
    const targetOffset = targetOffsetProfile(config.scenario.target);

    const seed = hashStringToSeed(
      [
        config.scenario.scenarioName,
        config.scenario.scenarioType,
        config.scenario.target,
        config.scenario.initialState,
        config.navigation.scheme,
        config.navigation.sensorAvailability,
        config.navigation.navigationQuality,
        config.control.method,
        config.control.correctionEnabled,
        config.fuze.concept,
        config.environment.disturbance,
        config.environment.sensorQuality,
        config.environment.navigationAvailability,
        config.settings.duration,
      ].join('|')
    );
    const random = createSeededRandom(seed);
    const { initialLateralDeviation } = initialStateProfile(config.scenario.initialState, random);

    // Uncertainty from navigation/sensor configuration — affects both displayed
    // uncertainty radius and how effectively correction can respond to disturbance.
    const uncertaintyFactor =
      sensorQualityFactor(config.environment.sensorQuality) *
      navQualityFactor(config.navigation.navigationQuality) *
      sensorAvailabilityFactor(config.navigation.sensorAvailability) *
      navAvailabilityUncertaintyFactor(config.environment.navigationAvailability);

    const disturbanceAmplitude =
      baseDisturbanceFraction(config.environment.disturbance) *
      scenarioProfile.disturbanceMultiplier *
      range;

    const correctionEnabled = config.control.correctionEnabled && config.control.method !== 'passive';
    const correctionStartProgress = correctionStartProgressFor(config.control.method);
    const correctionGain =
      correctionGainFor(config.control.method) *
      (scenarioProfile.correctionGainMultiplier ?? 1) *
      navAvailabilityCorrectionMultiplier(config.environment.navigationAvailability) /
      uncertaintyFactor;

    // Pre-generate the noise sequence once so the corrected and reference
    // (no-correction) runs share identical disturbance for a fair comparison.
    const noiseSequence: number[] = [];
    for (let i = 0; i <= steps; i++) {
      noiseSequence.push(toSignedUnit(random()));
    }

    const nominalPositions: Vec2[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * T;
      const x = v0 * Math.cos(thetaRad) * t;
      const y = Math.max(0, v0 * Math.sin(thetaRad) * t - 0.5 * GRAVITY * t * t);
      nominalPositions.push({ x, y });
    }

    const runDeviation = (applyCorrection: boolean): DeviationRunResult => {
      const samples: number[] = [];
      const positions: Vec2[] = [];
      const correctionActiveFlags: boolean[] = [];
      let d = initialLateralDeviation;

      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const isCorrectionActive = applyCorrection && correctionEnabled && progress >= correctionStartProgress;

        const disturbanceStep = disturbanceAmplitude * noiseSequence[i] * Math.sqrt(dt);
        d += disturbanceStep;
        if (isCorrectionActive) {
          d -= correctionGain * d * dt;
        }

        samples.push(d);
        correctionActiveFlags.push(isCorrectionActive);

        const nominal = nominalPositions[i];
        positions.push({
          x: nominal.x - d * 0.35,
          y: Math.max(0, nominal.y + d * 0.55),
        });
      }

      return { samples, positions, correctionActiveFlags };
    };

    const correctedRun = runDeviation(true);
    const referenceRun = correctionEnabled ? runDeviation(false) : correctedRun;

    const targetPosition: Vec2 = {
      x: range + targetOffset.x * range,
      y: Math.max(0, targetOffset.y * range),
    };

    const buildSamples = (
      positions: Vec2[],
      nominal: Vec2[],
      correctionActiveFlags: boolean[]
    ): TrajectorySample[] => {
      return positions.map((pos, i) => {
        const progress = i / steps;
        const time = progress * T;
        const dx = pos.x - nominal[i].x;
        const dy = pos.y - nominal[i].y;
        const deviation = Math.sqrt(dx * dx + dy * dy);
        const uncertainty = 1.5 * uncertaintyFactor * (0.4 + 0.6 * progress);
        return {
          time: parseFloat(time.toFixed(2)),
          progress: parseFloat(progress.toFixed(3)),
          position: { x: Math.round(pos.x * 10) / 10, y: Math.round(pos.y * 10) / 10 },
          deviation: Math.round(deviation * 10) / 10,
          uncertainty: Math.round(uncertainty * 10) / 10,
          phase: phaseForProgress(progress, correctionActiveFlags[i], correctionEnabled),
          correctionActive: correctionActiveFlags[i],
        };
      });
    };

    const trajectory = buildSamples(correctedRun.positions, nominalPositions, correctedRun.correctionActiveFlags);
    const nominalTrajectory: TrajectorySample[] = nominalPositions.map((pos, i) => ({
      time: trajectory[i].time,
      progress: trajectory[i].progress,
      position: { x: Math.round(pos.x * 10) / 10, y: Math.round(pos.y * 10) / 10 },
      deviation: 0,
      uncertainty: 0,
      phase: phaseForProgress(i / steps, false, correctionEnabled),
      correctionActive: false,
    }));

    let peakDeviation = 0;
    let peakDeviationProgress = 0;
    trajectory.forEach((sample) => {
      if (sample.deviation > peakDeviation) {
        peakDeviation = sample.deviation;
        peakDeviationProgress = sample.progress;
      }
    });

    const finalPosition = trajectory[trajectory.length - 1].position;
    const finalDeviation =
      Math.round(
        Math.sqrt(
          (finalPosition.x - targetPosition.x) ** 2 + (finalPosition.y - targetPosition.y) ** 2
        ) * 10
      ) / 10;

    let correctionEffect = 0;
    if (correctionEnabled) {
      const refFinal = referenceRun.positions[referenceRun.positions.length - 1];
      const refFinalDeviation = Math.sqrt(
        (refFinal.x - targetPosition.x) ** 2 + (refFinal.y - targetPosition.y) ** 2
      );
      if (refFinalDeviation > 0.01) {
        correctionEffect = Math.max(
          0,
          Math.min(100, Math.round(((refFinalDeviation - finalDeviation) / refFinalDeviation) * 100))
        );
      }
    }

    let navigationState: 'STABLE' | 'NOMINAL' | 'DEGRADED';
    if (uncertaintyFactor <= 0.9) navigationState = 'STABLE';
    else if (uncertaintyFactor <= 1.6) navigationState = 'NOMINAL';
    else navigationState = 'DEGRADED';

    const correctionEvents: CorrectionEvent[] = [];
    if (correctionEnabled) {
      const activationIndex = trajectory.findIndex((s) => s.correctionActive);
      if (activationIndex >= 0) {
        correctionEvents.push({
          progress: trajectory[activationIndex].progress,
          time: trajectory[activationIndex].time,
          position: trajectory[activationIndex].position,
          description:
            config.control.method === 'canard'
              ? 'Canard actuation concept engaged'
              : 'Aerodynamic trim concept engaged',
        });
      }
    }

    const fuzeEvent = this.computeFuzeEvent(config, trajectory, targetPosition, range);

    return {
      configurationSnapshot: config,
      trajectory,
      nominalTrajectory,
      startPosition: { x: 0, y: 0 },
      targetPosition: {
        x: Math.round(targetPosition.x * 10) / 10,
        y: Math.round(targetPosition.y * 10) / 10,
      },
      correctionEvents,
      fuzeEvent,
      deviationOverTime: trajectory.map((s) => ({ progress: s.progress, deviation: s.deviation })),
      finalDeviation,
      peakDeviation: Math.round(peakDeviation * 10) / 10,
      peakDeviationProgress: Math.round(peakDeviationProgress * 100) / 100,
      correctionApplied: correctionEnabled,
      correctionEffect,
      navigationState,
      navigationUncertaintyFactor: Math.round(uncertaintyFactor * 100) / 100,
      simulationDuration: T,
      generatedAt: new Date().toLocaleTimeString(),
    };
  }

  private computeFuzeEvent(
    config: SimulationConfiguration,
    trajectory: TrajectorySample[],
    targetPosition: Vec2,
    range: number
  ): FuzeEvent {
    const proximityThreshold = range * 0.08;

    const findProximityIndex = (): number => {
      for (let i = trajectory.length - 1; i >= 0; i--) {
        const p = trajectory[i].position;
        const dist = Math.sqrt((p.x - targetPosition.x) ** 2 + (p.y - targetPosition.y) ** 2);
        if (dist <= proximityThreshold) return i;
      }
      return Math.round(trajectory.length * 0.95);
    };

    const buildEvent = (index: number, description: string): FuzeEvent => {
      const clamped = Math.max(0, Math.min(trajectory.length - 1, index));
      const sample = trajectory[clamped];
      return {
        progress: sample.progress,
        time: sample.time,
        position: sample.position,
        description,
      };
    };

    switch (config.fuze.concept) {
      case 'time':
        return buildEvent(Math.round(trajectory.length * 0.85), 'Conceptual time-based event triggered');
      case 'proximity':
        return buildEvent(findProximityIndex(), 'Conceptual proximity event triggered near target');
      case 'multimode': {
        const timeIndex = Math.round(trajectory.length * 0.85);
        const proximityIndex = findProximityIndex();
        const chosen = Math.min(timeIndex, proximityIndex);
        return buildEvent(chosen, 'Conceptual multi-mode event triggered');
      }
      case 'impact':
      default:
        return buildEvent(trajectory.length - 1, 'Conceptual impact event at terminal position');
    }
  }
}
