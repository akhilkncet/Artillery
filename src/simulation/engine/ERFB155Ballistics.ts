/**
 * Accurate 155 mm ERFB/BB & ERFB/BT Ballistics Engine
 * Grounded in:
 * "ANALYSIS OF THE 155 MM ERFB/BB PROJECTILE TRAJECTORY"
 * by Rastislav Balon & Jan Komenda (University of Defence / Konštrukta-Defence).
 * Standardized in NATO STANAG 4355 (Modified Point Mass Model + Base Burn MPMM+BB1).
 */

import {
  PropellingChargeType,
  BaseGeometryType,
  TopCapType,
  EnvironmentDisturbance,
  Ballistics155Data,
} from '../../types/simulation';

export interface TrajectoryTableEntry {
  qeMil: number;
  qeDeg: number;
  rangeM: number;
  driftMil: number;
  vertexM: number;
  velocityGrazeMs: number;
  angleFallDeg: number;
  timeOfFlightS: number;
}

// Table 5 from Balon & Komenda (2006) - Charge D (Muzzle velocity 908 m/s, triple-base stick propellant)
export const STANAG_CHARGE_D_TABLE: TrajectoryTableEntry[] = [
  { qeMil: 100, qeDeg: 5.6, rangeM: 12195, driftMil: 3, vertexM: 349, velocityGrazeMs: 559, angleFallDeg: 7.9, timeOfFlightS: 17.0 },
  { qeMil: 200, qeDeg: 11.25, rangeM: 18971, driftMil: 6, vertexM: 1221, velocityGrazeMs: 381, angleFallDeg: 20.1, timeOfFlightS: 32.1 },
  { qeMil: 300, qeDeg: 16.9, rangeM: 23496, driftMil: 9, vertexM: 2462, velocityGrazeMs: 332, angleFallDeg: 33.3, timeOfFlightS: 45.6 },
  { qeMil: 400, qeDeg: 22.5, rangeM: 27153, driftMil: 12, vertexM: 4002, velocityGrazeMs: 331, angleFallDeg: 43.7, timeOfFlightS: 58.0 },
  { qeMil: 500, qeDeg: 28.1, rangeM: 30384, driftMil: 15, vertexM: 5804, velocityGrazeMs: 336, angleFallDeg: 51.6, timeOfFlightS: 70.0 },
  { qeMil: 600, qeDeg: 33.75, rangeM: 33311, driftMil: 19, vertexM: 7840, velocityGrazeMs: 345, angleFallDeg: 57.3, timeOfFlightS: 81.7 },
  { qeMil: 700, qeDeg: 39.4, rangeM: 35843, driftMil: 23, vertexM: 10068, velocityGrazeMs: 360, angleFallDeg: 61.1, timeOfFlightS: 92.9 },
  { qeMil: 800, qeDeg: 45.0, rangeM: 37736, driftMil: 28, vertexM: 12420, velocityGrazeMs: 380, angleFallDeg: 63.9, timeOfFlightS: 103.4 },
  { qeMil: 894, qeDeg: 50.3, rangeM: 38477, driftMil: 34, vertexM: 14654, velocityGrazeMs: 398, angleFallDeg: 66.0, timeOfFlightS: 112.4 },
  { qeMil: 900, qeDeg: 50.6, rangeM: 38473, driftMil: 35, vertexM: 14794, velocityGrazeMs: 399, angleFallDeg: 66.1, timeOfFlightS: 113.0 },
  { qeMil: 1000, qeDeg: 56.25, rangeM: 37303, driftMil: 43, vertexM: 17031, velocityGrazeMs: 416, angleFallDeg: 68.7, timeOfFlightS: 121.2 },
  { qeMil: 1100, qeDeg: 61.9, rangeM: 34061, driftMil: 55, vertexM: 18947, velocityGrazeMs: 429, angleFallDeg: 71.5, timeOfFlightS: 127.7 },
  { qeMil: 1150, qeDeg: 64.7, rangeM: 31494, driftMil: 70, vertexM: 19727, velocityGrazeMs: 434, angleFallDeg: 73.3, timeOfFlightS: 130.2 },
];

// Table 5 from Balon & Komenda (2006) - Charge A+A+B (Muzzle velocity 620 m/s, single-base 7-hole propellant)
export const STANAG_CHARGE_AAB_TABLE: TrajectoryTableEntry[] = [
  { qeMil: 100, qeDeg: 5.6, rangeM: 6320, driftMil: 2, vertexM: 171, velocityGrazeMs: 463, angleFallDeg: 6.9, timeOfFlightS: 11.9 },
  { qeMil: 200, qeDeg: 11.25, rangeM: 10656, driftMil: 4, vertexM: 625, velocityGrazeMs: 367, angleFallDeg: 15.9, timeOfFlightS: 22.7 },
  { qeMil: 300, qeDeg: 16.9, rangeM: 13762, driftMil: 7, vertexM: 1296, velocityGrazeMs: 324, angleFallDeg: 26.1, timeOfFlightS: 32.7 },
  { qeMil: 400, qeDeg: 22.5, rangeM: 16126, driftMil: 9, vertexM: 2137, velocityGrazeMs: 321, angleFallDeg: 35.0, timeOfFlightS: 41.8 },
  { qeMil: 500, qeDeg: 28.1, rangeM: 17996, driftMil: 11, vertexM: 3112, velocityGrazeMs: 325, angleFallDeg: 42.3, timeOfFlightS: 50.3 },
  { qeMil: 600, qeDeg: 33.75, rangeM: 19444, driftMil: 14, vertexM: 4188, velocityGrazeMs: 330, angleFallDeg: 48.3, timeOfFlightS: 58.3 },
  { qeMil: 700, qeDeg: 39.4, rangeM: 20463, driftMil: 17, vertexM: 5334, velocityGrazeMs: 334, angleFallDeg: 53.6, timeOfFlightS: 66.0 },
  { qeMil: 800, qeDeg: 45.0, rangeM: 20994, driftMil: 20, vertexM: 6520, velocityGrazeMs: 338, angleFallDeg: 58.1, timeOfFlightS: 73.4 },
  { qeMil: 833, qeDeg: 46.9, rangeM: 21032, driftMil: 21, vertexM: 6915, velocityGrazeMs: 339, angleFallDeg: 59.6, timeOfFlightS: 75.7 },
  { qeMil: 900, qeDeg: 50.6, rangeM: 20872, driftMil: 24, vertexM: 7714, velocityGrazeMs: 342, angleFallDeg: 62.3, timeOfFlightS: 80.2 },
  { qeMil: 1000, qeDeg: 56.25, rangeM: 19973, driftMil: 31, vertexM: 8870, velocityGrazeMs: 347, angleFallDeg: 66.2, timeOfFlightS: 86.4 },
  { qeMil: 1100, qeDeg: 61.9, rangeM: 18187, driftMil: 41, vertexM: 9938, velocityGrazeMs: 351, angleFallDeg: 70.1, timeOfFlightS: 91.7 },
  { qeMil: 1150, qeDeg: 64.7, rangeM: 16947, driftMil: 49, vertexM: 10421, velocityGrazeMs: 353, angleFallDeg: 72.1, timeOfFlightS: 94.0 },
];

/**
 * Aerodynamic Drag Coefficient CD0 lookup per PRODAS semi-empirical model (Table 2)
 */
export const PRODAS_DRAG_TABLE: { mach: number; cd0: number; cdAlpha2: number; clAlpha: number }[] = [
  { mach: 0.40, cd0: 0.138, cdAlpha2: 4.171, clAlpha: 1.302 },
  { mach: 0.60, cd0: 0.138, cdAlpha2: 4.171, clAlpha: 1.302 },
  { mach: 0.70, cd0: 0.139, cdAlpha2: 4.430, clAlpha: 1.311 },
  { mach: 0.80, cd0: 0.141, cdAlpha2: 4.689, clAlpha: 1.439 },
  { mach: 0.90, cd0: 0.156, cdAlpha2: 5.232, clAlpha: 1.474 },
  { mach: 0.95, cd0: 0.199, cdAlpha2: 5.750, clAlpha: 1.371 },
  { mach: 1.00, cd0: 0.290, cdAlpha2: 6.295, clAlpha: 1.490 },
  { mach: 1.05, cd0: 0.329, cdAlpha2: 6.855, clAlpha: 1.621 },
  { mach: 1.10, cd0: 0.326, cdAlpha2: 7.447, clAlpha: 1.694 },
  { mach: 1.20, cd0: 0.318, cdAlpha2: 8.051, clAlpha: 1.802 },
  { mach: 1.50, cd0: 0.291, cdAlpha2: 7.154, clAlpha: 2.089 },
  { mach: 2.00, cd0: 0.249, cdAlpha2: 6.265, clAlpha: 2.411 },
  { mach: 2.50, cd0: 0.216, cdAlpha2: 5.762, clAlpha: 2.614 },
  { mach: 3.00, cd0: 0.194, cdAlpha2: 5.233, clAlpha: 2.576 },
];

/**
 * Linearly interpolate tabulated ballistic elements for any QE
 */
export function interpolateBallisticElements(
  table: TrajectoryTableEntry[],
  targetQeMil: number
): TrajectoryTableEntry {
  const sorted = [...table].sort((a, b) => a.qeMil - b.qeMil);
  if (targetQeMil <= sorted[0].qeMil) return sorted[0];
  if (targetQeMil >= sorted[sorted.length - 1].qeMil) return sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (targetQeMil >= a.qeMil && targetQeMil <= b.qeMil) {
      const frac = (targetQeMil - a.qeMil) / (b.qeMil - a.qeMil);
      return {
        qeMil: targetQeMil,
        qeDeg: +(a.qeDeg + frac * (b.qeDeg - a.qeDeg)).toFixed(2),
        rangeM: Math.round(a.rangeM + frac * (b.rangeM - a.rangeM)),
        driftMil: +(a.driftMil + frac * (b.driftMil - a.driftMil)).toFixed(1),
        vertexM: Math.round(a.vertexM + frac * (b.vertexM - a.vertexM)),
        velocityGrazeMs: Math.round(a.velocityGrazeMs + frac * (b.velocityGrazeMs - a.velocityGrazeMs)),
        angleFallDeg: +(a.angleFallDeg + frac * (b.angleFallDeg - a.angleFallDeg)).toFixed(1),
        timeOfFlightS: +(a.timeOfFlightS + frac * (b.timeOfFlightS - a.timeOfFlightS)).toFixed(1),
      };
    }
  }

  return sorted[0];
}

/**
 * Compute the complete 155 mm ballistic profile based on Balon & Komenda parameters
 */
export function calculate155Ballistics(
  chargeType: PropellingChargeType = 'charge_d',
  baseType: BaseGeometryType = 'erfb_bb',
  qeMil: number = 700
): Ballistics155Data {
  const table = chargeType === 'charge_d' ? STANAG_CHARGE_D_TABLE : STANAG_CHARGE_AAB_TABLE;
  const standardMuzzleVelocity = chargeType === 'charge_d' ? 908 : 620; // m/s per section 2.2

  const baseEntry = interpolateBallisticElements(table, qeMil);

  // When base is ERFB/BT (Boat Tail, hollow base without base bleed),
  // paper states (Section 5, Fig. 13 & Fig. 14):
  // "increase of the maximal range of the 155 mm ERFB/BB projectile in comparison with ERFB/BT is 24.5%"
  // => ERFB/BT range = ERFB/BB range / 1.245 = 0.8032 * ERFB/BB range
  const btFactor = baseType === 'erfb_bt' ? (1 / 1.245) : 1.0;

  const maxRange = Math.round(baseEntry.rangeM * btFactor);
  const vertexAltitude = Math.round(baseEntry.vertexM * (baseType === 'erfb_bt' ? 0.90 : 1.0));
  const timeOfFlight = +(baseEntry.timeOfFlightS * (baseType === 'erfb_bt' ? 0.92 : 1.0)).toFixed(1);
  const speedOfSoundSeaLevel = 340.29; // m/s
  const machLaunch = +(standardMuzzleVelocity / speedOfSoundSeaLevel).toFixed(2);

  return {
    muzzleVelocity: standardMuzzleVelocity,
    maxRange,
    vertexAltitude,
    timeOfFlight,
    grazeVelocity: baseEntry.velocityGrazeMs,
    driftMil: baseEntry.driftMil,
    quadrantElevationMil: qeMil,
    quadrantElevationDeg: baseEntry.qeDeg,
    chargeType,
    baseType,
    machLaunch,
  };
}

/**
 * Calculates accurate Error Radius (Circular Error Probable / CEP and R95)
 * for:
 * 1) Original Top Cap (Standard Ballistic Unguided Fuze M557/M739)
 * 2) Our PS Cap with Steerable Canard Fins (Precision Guidance Kit / PGK Cap)
 */
export function calculateTargetErrorRadius(
  ballistics: Ballistics155Data,
  topCap: TopCapType,
  disturbance: EnvironmentDisturbance,
  sensorQuality: 'low' | 'normal' | 'high' = 'normal',
  navAvailability: 'available' | 'limited' | 'unavailable' = 'available'
) {
  const range = ballistics.maxRange;

  // Disturbance multiplier (atmospheric wind crossflow & turbulence)
  const distMultiplier = disturbance === 'high' ? 1.75 : disturbance === 'moderate' ? 1.28 : 1.0;

  // 1. ORIGINAL TOP CAP (Unguided Ballistic M557 / M739 mechanical fuze):
  // Ballistic field dispersion in NATO standard artillery (PE_R = ~0.45% of range, PE_L = ~0.25% of range)
  // CEP_original = 0.5887 * (PE_R + PE_L) * distMultiplier
  const peRangeOriginal = range * 0.0048 * distMultiplier;
  const peDeflectionOriginal = range * 0.0024 * distMultiplier;
  const originalCapCep = Math.round(0.5887 * (peRangeOriginal + peDeflectionOriginal) * 10) / 10;
  const originalCapR95 = Math.round(2.08 * originalCapCep * 10) / 10;

  // 2. OUR PS CAP WITH CANARD FINS (Course Correction Fuze / PGK Kit):
  // Steerable canards deploy at apogee, measure GPS/INS trajectory state,
  // and actively despin & apply aerodynamic force vectors to correct downrange and crossrange errors.
  let sensorFactor = sensorQuality === 'high' ? 0.8 : sensorQuality === 'low' ? 1.4 : 1.0;
  if (navAvailability === 'limited') sensorFactor *= 1.6;
  if (navAvailability === 'unavailable') sensorFactor *= 2.8;

  // Baseline CEP with active canard fins under GPS/INS: ~7.5 meters
  // Under high wind with active fins: ~11.5 meters
  // Degraded GPS: ~22 meters (still drastically superior to original 200m+)
  const psCapCep = Math.round((7.2 + 2.8 * (distMultiplier - 1.0)) * sensorFactor * 10) / 10;
  const psCapR95 = Math.round(2.08 * psCapCep * 10) / 10;

  // Active chosen configuration metrics
  const activeCapCep = topCap === 'ps_canard_cap' ? psCapCep : originalCapCep;
  const activeCapR95 = topCap === 'ps_canard_cap' ? psCapR95 : originalCapR95;

  const errorRadiusReductionPct = Math.round(
    ((originalCapCep - psCapCep) / originalCapCep) * 1000
  ) / 10;

  return {
    originalCapCep,
    originalCapR95,
    psCapCep,
    psCapR95,
    activeCapCep,
    activeCapR95,
    errorRadiusReductionPct,
    rangeProbableError: Math.round(peRangeOriginal * 10) / 10,
    deflectionProbableError: Math.round(peDeflectionOriginal * 10) / 10,
  };
}
