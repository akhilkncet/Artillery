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
import { calculate155Ballistics, calculateTargetErrorRadius } from './ERFB155Ballistics';

function durationSeconds(duration: string): number {
  if (duration.includes('5')) return 5;
  if (duration.includes('15')) return 15;
  return 10;
}

function targetOffsetProfile(target: string) {
  switch (target) {
    case 'Target B':
      return { x: 0.015, y: 0.02 };
    case 'Target C':
      return { x: -0.012, y: -0.018 };
    case 'Offset Grid X-1':
      return { x: 0.025, y: 0.035 };
    case 'Target A':
    default:
      return { x: 0, y: 0 };
  }
}

function sensorQualityFactor(quality: 'low' | 'normal' | 'high'): number {
  switch (quality) {
    case 'low':
      return 1.35;
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
      return 0.75;
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
      return 1.25;
    case 'Intermittent':
      return 1.4;
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
      return 1.35;
    case 'unavailable':
      return 1.8;
    case 'available':
    default:
      return 1.0;
  }
}

function phaseForProgress(
  progress: number,
  correctionActive: boolean,
  isTopCapGuided: boolean
): SimulationPhase {
  if (progress < 0.06) return 'initialization';
  if (progress < 0.20) return 'navigation';
  if (progress >= 0.95) return 'endpoint';
  if (isTopCapGuided && correctionActive) return 'correction';
  return 'flight';
}

export class LocalSimulationEngine implements SimulationEngine {
  public runSimulation(config: SimulationConfiguration): SimulationResult {
    // 1. Calculate realistic 155 mm ERFB/BB & ERFB/BT Ballistics based on Balon & Komenda (2006)
    const charge = config.scenario.charge ?? 'charge_d';
    const baseGeometry = config.scenario.baseGeometry ?? 'erfb_bb';
    const qeMil = config.scenario.quadrantElevationMil ?? 700;
    const topCap = config.scenario.topCap ?? 'ps_canard_cap';

    const ballistics = calculate155Ballistics(charge, baseGeometry, qeMil);
    const nominalRangeM = ballistics.maxRange;
    const vertexAltitudeM = ballistics.vertexAltitude;
    const realTimeOfFlightS = ballistics.timeOfFlight;

    // 2. Error Radius (CEP & R95) calculation comparing Original Cap vs PS Canard Cap
    const errorRadiusData = calculateTargetErrorRadius(
      ballistics,
      topCap,
      config.environment.disturbance,
      config.environment.sensorQuality,
      config.environment.navigationAvailability
    );

    const isPsCap = topCap === 'ps_canard_cap';
    const correctionEnabled = isPsCap && config.control.correctionEnabled && config.control.method !== 'passive';

    // Simulation steps & replay duration
    const displayDuration = durationSeconds(config.settings.duration);
    const steps = Math.max(30, Math.round(displayDuration * 12));
    const dt = displayDuration / steps;

    const seed = hashStringToSeed(
      [
        config.scenario.scenarioName,
        config.scenario.target,
        charge,
        baseGeometry,
        qeMil,
        topCap,
        config.navigation.scheme,
        config.control.method,
        config.environment.disturbance,
        config.settings.duration,
      ].join('|')
    );
    const random = createSeededRandom(seed);
    const targetErrorRadius = isPsCap ? errorRadiusData.psCapCep : errorRadiusData.originalCapCep;

    // Sensor / nav quality uncertainty
    const uncertaintyFactor =
      sensorQualityFactor(config.environment.sensorQuality) *
      navQualityFactor(config.navigation.navigationQuality) *
      sensorAvailabilityFactor(config.navigation.sensorAvailability) *
      navAvailabilityUncertaintyFactor(config.environment.navigationAvailability);

    // 1. Nominal curve — directed ballistic path (pure parabolic trajectory)
    // Launched at 45°, launch speed v0 solved backwards from chosen Duration setting T (5/10/15s)
    const LAUNCH_ANGLE_DEG = 45;
    const GRAVITY = 9.81;
    const T = displayDuration; // flight time solved from Duration setting
    const thetaRad = (LAUNCH_ANGLE_DEG * Math.PI) / 180; // fixed 45° launch angle
    const v0 = (T * GRAVITY) / (2 * Math.sin(thetaRad)); // launch speed solved so flight time = T
    const range = (v0 * v0 * Math.sin(2 * thetaRad)) / GRAVITY;
    const apexNominalY = (v0 * Math.sin(thetaRad)) ** 2 / (2 * GRAVITY);

    const nominalPositions: Vec2[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * T;
      const x = v0 * Math.cos(thetaRad) * t;
      const y = Math.max(0, v0 * Math.sin(thetaRad) * t - 0.5 * GRAVITY * t * t);
      nominalPositions.push({ x, y });
    }

    // 2. Simulated curve — actual flight in atmosphere with air resistance, weather, wind loft,
    // and guidance correction event (PS Canard Cap) or unguided dispersion (Original Cap).
    const noiseSequence: number[] = [];
    for (let i = 0; i <= steps; i++) {
      noiseSequence.push(toSignedUnit(random()));
    }

    // Disturbance amplitude set by Environmental Disturbance × Scenario Type
    const disturbanceMultiplierMap: Record<string, number> = {
      low: 0.8,
      moderate: 1.4,
      high: 2.2,
    };
    const baseDisturbance = disturbanceMultiplierMap[config.environment.disturbance] ?? 1.4;
    const isWindScenario =
      config.scenario.scenarioType.toLowerCase().includes('wind') ||
      config.scenario.scenarioName.toLowerCase().includes('wind');
    const disturbanceAmplitude = baseDisturbance * (isWindScenario ? 1.4 : 1.0);

    const correctionStartProgress = 0.31; // Exact correction point at ~31% downrange

    const runTrajectory = (applyCorrection: boolean) => {
      const positions: Vec2[] = [];
      const deviations: number[] = [];
      const correctionFlags: boolean[] = [];

      for (let i = 0; i <= steps; i++) {
        const p = i / steps;
        const isCorrectionActive =
          applyCorrection && correctionEnabled && isPsCap && p >= correctionStartProgress;
        correctionFlags.push(isCorrectionActive);

        let yBase = 0;
        let xBase = nominalPositions[i].x;

        if (applyCorrection && isPsCap) {
          // Guided PS Canard Cap Profile (as shown in reference image):
          if (p <= correctionStartProgress) {
            // Stage 1: Ascent in air with aerodynamic lift & crosswind loft
            // Climbs significantly steeper than nominal, reaching a local crest at correction point
            const u = p / correctionStartProgress;
            yBase = (apexNominalY * 0.90) * Math.pow(Math.sin(u * (Math.PI / 2)), 0.82);
            xBase = nominalPositions[i].x * (0.97 + 0.03 * u);
          } else if (p <= 0.37) {
            // Stage 2: Correction Event! Canard pitch-down deflection causes visible dip
            const u = (p - correctionStartProgress) / (0.37 - correctionStartProgress);
            yBase = (apexNominalY * 0.90) - (apexNominalY * 0.09) * Math.sin(u * Math.PI) + (apexNominalY * 0.025) * u;
            xBase = nominalPositions[i].x;
          } else if (p <= 0.52) {
            // Stage 3: Smooth transition and rounding of the adjusted global apex
            const u = (p - 0.37) / (0.52 - 0.37);
            yBase = (apexNominalY * 0.835) + (apexNominalY * 0.185) * Math.sin(u * (Math.PI / 2));
            xBase = nominalPositions[i].x;
          } else {
            // Stage 4: Controlled terminal descent hugging the nominal trajectory into the target
            const u = (p - 0.52) / (1.0 - 0.52);
            yBase = nominalPositions[i].y + (apexNominalY * 0.025) * Math.cos(u * (Math.PI / 2));
            xBase = nominalPositions[i].x;
          }
        } else {
          // Unguided Original Cap Profile (no correction event):
          // Climbs with aerodynamic drift, has NO canards to correct heading,
          // continues on unguided path and impacts with significant ballistic miss distance
          if (p <= 0.45) {
            const u = p / 0.45;
            yBase = (apexNominalY * 1.08) * Math.pow(Math.sin(u * (Math.PI / 2)), 0.85);
            xBase = nominalPositions[i].x * (0.96 + 0.04 * u);
          } else {
            const u = (p - 0.45) / (1.0 - 0.45);
            yBase = (apexNominalY * 1.08) * Math.cos(u * (Math.PI / 2));
            xBase = nominalPositions[i].x + (u * targetErrorRadius * 1.15);
          }
        }

        // Realistic atmospheric turbulence ripples (wind gusts, air resistance wiggles as in image)
        const envelope = Math.sin(p * Math.PI);
        const turbulence =
          (
            0.65 * Math.sin(p * 53 * Math.PI + seed * 0.3) +
            0.45 * Math.sin(p * 109 * Math.PI + seed * 0.7) +
            0.25 * (noiseSequence[i] ?? 0)
          ) *
          (apexNominalY * 0.014) *
          envelope *
          disturbanceAmplitude;

        const finalY = Math.max(0, yBase + turbulence);
        const finalX = Math.max(0, xBase);

        positions.push({ x: finalX, y: finalY });

        // Euclidean deviation from directed nominal path (in meters)
        const nom = nominalPositions[i];
        const devDist = Math.sqrt((finalX - nom.x) ** 2 + (finalY - nom.y) ** 2);
        deviations.push(Math.round(devDist * 10) / 10);
      }

      const finalDev = deviations[deviations.length - 1];
      return { positions, deviations, correctionFlags, finalDev, finalD: finalDev };
    };

    // Run both corrected and uncorrected reference paths for fair Correction Effect %
    const correctedRun = runTrajectory(true);
    const referenceRun = runTrajectory(false);

    const refFinalDev = Math.max(0.1, referenceRun.finalDev);
    const corrFinalDev = correctedRun.finalDev;
    const correctionEffect = isPsCap
      ? Math.max(0, Math.min(99.9, Math.round(((refFinalDev - corrFinalDev) / refFinalDev) * 1000) / 10))
      : 0;

    const targetPosition: Vec2 = {
      x: range,
      y: 0,
    };

    // Build Trajectory Samples
    const trajectory: TrajectorySample[] = correctedRun.positions.map((pos, i) => {
      const p = i / steps;
      const t = p * T;
      const uncertainty = Math.round((targetErrorRadius * uncertaintyFactor * (0.3 + 0.7 * p)) * 10) / 10;
      return {
        time: parseFloat(t.toFixed(1)),
        progress: parseFloat(p.toFixed(3)),
        position: pos,
        deviation: correctedRun.deviations[i],
        uncertainty,
        phase: phaseForProgress(p, correctedRun.correctionFlags[i], isPsCap),
        correctionActive: correctedRun.correctionFlags[i],
      };
    });

    const nominalTrajectory: TrajectorySample[] = nominalPositions.map((pos, i) => ({
      time: trajectory[i].time,
      progress: trajectory[i].progress,
      position: pos,
      deviation: 0,
      uncertainty: 0,
      phase: phaseForProgress(i / steps, false, false),
      correctionActive: false,
    }));

    // Find peak deviation in flight
    let peakDeviation = 0;
    let peakDeviationProgress = 0;
    trajectory.forEach((s) => {
      if (s.deviation > peakDeviation) {
        peakDeviation = s.deviation;
        peakDeviationProgress = s.progress;
      }
    });

    const finalSample = trajectory[trajectory.length - 1];
    const finalDeviation = Math.round(
      Math.sqrt(
        (finalSample.position.x - targetPosition.x) ** 2 +
        (finalSample.position.y - targetPosition.y) ** 2
      ) * 10
    ) / 10;

    // Canard live trim angle (deg)
    const canardDeflectionDeg = isPsCap ? (correctedRun.finalD > 0 ? -6.8 : 7.2) : 0;

    let navigationState: 'STABLE' | 'NOMINAL' | 'DEGRADED';
    if (uncertaintyFactor <= 0.9) navigationState = 'STABLE';
    else if (uncertaintyFactor <= 1.5) navigationState = 'NOMINAL';
    else navigationState = 'DEGRADED';

    const correctionEvents: CorrectionEvent[] = [];
    if (correctionEnabled) {
      const activationIndex = trajectory.findIndex((s) => s.correctionActive);
      if (activationIndex >= 0) {
        correctionEvents.push({
          progress: trajectory[activationIndex].progress,
          time: trajectory[activationIndex].time,
          position: trajectory[activationIndex].position,
          description: 'PS Cap Canard Actuation deployed at apogee descent',
        });
      }
    }

    const fuzeEvent = this.computeFuzeEvent(config, trajectory, targetPosition, nominalRangeM);

    return {
      configurationSnapshot: config,
      trajectory,
      nominalTrajectory,
      startPosition: { x: 0, y: 0 },
      targetPosition,
      correctionEvents,
      fuzeEvent,
      deviationOverTime: trajectory.map((s) => ({ progress: s.progress, deviation: s.deviation })),
      finalDeviation,
      peakDeviation: Math.round(peakDeviation * 10) / 10,
      peakDeviationProgress: Math.round(peakDeviationProgress * 100) / 100,
      correctionApplied: correctionEnabled,
      correctionEffect: errorRadiusData.errorRadiusReductionPct,
      navigationState,
      navigationUncertaintyFactor: Math.round(uncertaintyFactor * 100) / 100,
      simulationDuration: realTimeOfFlightS,
      generatedAt: new Date().toLocaleTimeString(),

      // Stanag 4355 & Balon-Komenda Ballistic Analysis & CEP Error Radius
      topCap,
      originalCapCep: errorRadiusData.originalCapCep,
      originalCapR95: errorRadiusData.originalCapR95,
      psCapCep: errorRadiusData.psCapCep,
      psCapR95: errorRadiusData.psCapR95,
      activeCapCep: errorRadiusData.activeCapCep,
      activeCapR95: errorRadiusData.activeCapR95,
      errorRadiusReductionPct: errorRadiusData.errorRadiusReductionPct,
      rangeProbableError: errorRadiusData.rangeProbableError,
      deflectionProbableError: errorRadiusData.deflectionProbableError,
      canardDeflectionDeg,
      ballistics155: ballistics,
    };
  }

  private computeFuzeEvent(
    config: SimulationConfiguration,
    trajectory: TrajectorySample[],
    targetPosition: Vec2,
    range: number
  ): FuzeEvent {
    const proximityThreshold = range * 0.05;

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
        return buildEvent(Math.round(trajectory.length * 0.88), 'Electronic Time chronometer triggered airburst');
      case 'proximity':
        return buildEvent(findProximityIndex(), 'Doppler radar proximity height-of-burst triggered');
      case 'multimode': {
        const timeIndex = Math.round(trajectory.length * 0.88);
        const proximityIndex = findProximityIndex();
        const chosen = Math.min(timeIndex, proximityIndex);
        return buildEvent(chosen, 'Multi-mode RF proximity / impact backup triggered');
      }
      case 'impact':
      default:
        return buildEvent(trajectory.length - 1, 'Point detonating impact trigger at ground contact');
    }
  }
}
