# Configuration Reference

This document describes every option on the Configure page, which field it maps to in the
`SimulationConfiguration` object (`src/types/simulation.ts`), and how it affects the simulation
engine (`src/simulation/engine/LocalSimulationEngine.ts`).

All configuration lives in one object, held in `SimulationContext` and passed as-is to
`LocalSimulationEngine.runSimulation(configuration)`:

```ts
SimulationConfiguration {
  scenario: ScenarioConfig;
  navigation: NavigationConfig;
  control: ControlConfig;
  fuze: FuzeConfig;
  environment: EnvironmentConfig;
  settings: SimulationSettings;
}
```

---

## 01 — Scenario (`configuration.scenario`)

| Field | UI Control | Values | Effect on simulation |
|---|---|---|---|
| `scenarioName` | Text input | Any string (letters, numbers, `_`, `-`, min 3 chars) | Used as part of the seed for the deterministic random generator, and shown on the Results page and in the exported JSON filename. Does **not** change the physics itself, only the seed sequence. |
| `scenarioType` | Dropdown | `Standard Demonstration`, `High-Disturbance Evaluation`, `Target Offset Analysis`, `Precision Drift Demonstration` | Sets `disturbanceMultiplier`, `targetOffsetMultiplier`, and (for Precision Drift) `correctionGainMultiplier` in `scenarioTypeProfile()`. High-Disturbance scales up wind/perturbation, Target Offset Analysis scales up the target's lateral offset, Precision Drift slightly weakens the correction gain. |
| `target` | Dropdown | `Target A`, `Target B`, `Target C`, `Offset Grid X-1` | Sets a lateral/downrange offset fraction in `targetOffsetProfile()`, which shifts `targetPosition` used for the final-deviation calculation. |
| `initialState` | Dropdown | `Nominal`, `Dispersion Alpha`, `Perturbed Initial Velocity` | Sets the starting lateral deviation `d(0)` in `initialStateProfile()`. `Nominal` = 0, `Dispersion Alpha` = a fixed small bias, `Perturbed Initial Velocity` = a seeded random bias (±10 units). |

---

## 02 — Navigation Concept (`configuration.navigation`)

| Field | UI Control | Values | Effect on simulation |
|---|---|---|---|
| `scheme` | Card select | `inertial`, `gnss`, `sensor_fusion` | Cosmetic/informational only in the current model — displayed as the "Navigation" label on Simulation/Results, but does not itself add a numeric multiplier (see `navigationQuality` and `sensorAvailability` below for the numeric levers). |
| `sensorAvailability` | Dropdown | `Nominal`, `Degraded`, `Intermittent`, `High-Rate` | Multiplies the overall navigation **uncertainty factor** via `sensorAvailabilityFactor()` (`Nominal`=1.0, `Degraded`=1.2, `Intermittent`=1.35, `High-Rate`=0.85). |
| `navigationQuality` | Dropdown | `Normal`, `High`, `Low` | Multiplies uncertainty via `navQualityFactor()` (`Normal`=1.0, `High`=0.7, `Low`=1.4). |

The combined `uncertaintyFactor` (product of `sensorQualityFactor × navQualityFactor × sensorAvailabilityFactor × navAvailabilityUncertaintyFactor`) is used to:
- scale the displayed per-sample `uncertainty` radius,
- weaken the correction gain (higher uncertainty → less effective correction),
- classify `navigationState` on Results (`STABLE` ≤ 0.9, `NOMINAL` ≤ 1.6, else `DEGRADED`).

---

## 03 — Control Concept (`configuration.control`)

| Field | UI Control | Values | Effect on simulation |
|---|---|---|---|
| `method` | Card select | `passive`, `aerodynamic`, `canard` | Sets the correction gain (`correctionGainFor()`: passive=0, aerodynamic=1.6, canard=3.2) and the progress point at which correction starts (`correctionStartProgressFor()`: canard=0.30, aerodynamic=0.40). Selecting `passive` also forces `correctionEnabled` to `false`. |
| `correctionEnabled` | Toggle button | `true` / `false` | If `false`, the correction term is never applied — the lateral deviation accumulates purely from disturbance. If `true` (and method isn't `passive`), correction pulls the deviation back toward zero starting at the method's activation progress. |

---

## 04 — Fuze Concept (`configuration.fuze`)

| Field | UI Control | Values | Effect on simulation |
|---|---|---|---|
| `concept` | Card select | `impact`, `time`, `proximity`, `multimode` | Determines the conceptual `fuzeEvent` marker computed in `computeFuzeEvent()`: `impact` fires at the final sample; `time` fires at 85% of flight progress; `proximity` fires at the last sample within 8% of the nominal range from the target (or 95% progress as a fallback); `multimode` fires at whichever of the time/proximity triggers comes first. This only affects the event marker shown during Simulation/Results — no arming, detonation, or physical fuze logic is modeled. |
| `modeLabel` | (fixed) | `"Simulation Only"` | Cosmetic label; not used in calculations. |

---

## 05 — Environment (`configuration.environment`)

| Field | UI Control | Values | Effect on simulation |
|---|---|---|---|
| `disturbance` | Segmented buttons | `low`, `moderate`, `high` | Sets `baseDisturbanceFraction()` (low=0.018, moderate=0.04, high=0.075), which scales the magnitude of the seeded random perturbation applied to the lateral deviation at every simulation step. |
| `sensorQuality` | Segmented buttons | `low`, `normal`, `high` | Multiplies uncertainty via `sensorQualityFactor()` (low=1.3, normal=1.0, high=0.75). |
| `navigationAvailability` | Dropdown | `available`, `limited`, `unavailable` | Two effects: (1) multiplies uncertainty via `navAvailabilityUncertaintyFactor()` (available=1.0, limited=1.25, unavailable=1.6); (2) separately cripples the correction system's effectiveness via `navAvailabilityCorrectionMultiplier()` (available=1.0, limited=0.6, unavailable=0.25), since a system that can't sense its own state can't correct well even if correction is "enabled". |

---

## 06 — Simulation Settings (`configuration.settings`)

| Field | UI Control | Values | Effect on simulation |
|---|---|---|---|
| `showNominalTrajectory` | Checkbox | boolean | Display-only — toggles the dashed reference path on the trajectory canvas. Does not affect calculations. |
| `showSimulatedTrajectory` | Checkbox | boolean | Display-only — toggles the solid simulated path. |
| `showTarget` | Checkbox | boolean | Display-only — toggles the target reticle. |
| `showCorrectionEvents` | Checkbox | boolean | Display-only — toggles the correction-event marker. |
| `duration` | Dropdown | `Fast (5s)`, `Standard (10s)`, `Extended (15s)` | Sets the total simulated flight time `T` (5/10/15 seconds), which determines both the launch velocity (via the fixed-range projectile formula) and the number of trajectory samples (`steps = round(T * 10)` → 50/100/150 samples). |
| `animationSpeed` | Dropdown | `normal`, `0.5x`, `1.5x`, `2.0x` | Playback-only — scales how fast the Simulation page animates through the precomputed trajectory. It never changes the underlying trajectory, timing, or result values. |

---

## How a configuration produces a result

1. All fields above (except `animationSpeed` and the `show*` overlay flags) are combined into a
   single string and hashed (`hashStringToSeed`) to produce a deterministic seed.
2. A seeded PRNG (`createSeededRandom`) generates the same noise sequence every time for that
   exact configuration — so re-running the same configuration always reproduces the same result,
   while changing any physically-relevant field changes the seed and therefore the outcome.
3. `LocalSimulationEngine.runSimulation()` uses that seed plus the multipliers described above to
   compute the nominal trajectory, the corrected trajectory, an uncorrected reference trajectory
   (for the Correction Effect metric), the fuze event, and all summary metrics.
4. The resulting `SimulationResult` is consumed unchanged by both the Simulation page (animation)
   and the Results page (metrics/graphs) — neither page recalculates or fabricates its own numbers.

## Adding a new option

To add a new configurable field:

1. Add it to the relevant sub-interface in `src/types/simulation.ts`.
2. Add a default value in `DEFAULT_CONFIGURATION` in `src/state/SimulationContext.tsx`.
3. Add the UI control in `src/pages/Configure/ConfigurationView.tsx`, calling `updateConfiguration()`
   on change.
4. If it should affect physics, read it inside `LocalSimulationEngine.runSimulation()` and fold it
   into the seed string (if it should change the random sequence) and/or into one of the multiplier
   functions.
5. If it's purely cosmetic (like the `show*` overlay flags), only reference it in the rendering
   components (`TrajectoryCanvas.tsx`), not in the engine.
