import { SimulationConfiguration } from '../types/simulation';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateConfiguration(config: SimulationConfiguration): ValidationResult {
  const errors: Record<string, string> = {};

  // Scenario Name
  if (!config.scenario.scenarioName || config.scenario.scenarioName.trim().length < 3) {
    errors.scenarioName = 'Scenario name must be at least 3 characters.';
  } else if (!/^[a-zA-Z0-9_-]+$/.test(config.scenario.scenarioName.trim())) {
    errors.scenarioName = 'Scenario name can only contain letters, numbers, underscores, or hyphens.';
  }

  // Scenario Type
  if (!config.scenario.scenarioType) {
    errors.scenarioType = 'Scenario type is required.';
  }

  // Target
  if (!config.scenario.target) {
    errors.target = 'Target selection is required.';
  }

  // Initial State
  if (!config.scenario.initialState) {
    errors.initialState = 'Initial state is required.';
  }

  // Navigation
  if (!['inertial', 'gnss', 'sensor_fusion'].includes(config.navigation.scheme)) {
    errors.navigationScheme = 'Valid navigation scheme required.';
  }

  // Control
  if (!['passive', 'aerodynamic', 'canard'].includes(config.control.method)) {
    errors.controlMethod = 'Valid control actuation method required.';
  }

  // Fuze
  if (!['impact', 'time', 'proximity', 'multimode'].includes(config.fuze.concept)) {
    errors.fuzeConcept = 'Valid fuze concept required.';
  }

  // Environment
  if (!['low', 'moderate', 'high'].includes(config.environment.disturbance)) {
    errors.disturbance = 'Valid environmental disturbance level required.';
  }

  if (!['low', 'normal', 'high'].includes(config.environment.sensorQuality)) {
    errors.sensorQuality = 'Valid sensor quality level required.';
  }

  if (!['available', 'limited', 'unavailable'].includes(config.environment.navigationAvailability)) {
    errors.navigationAvailability = 'Valid navigation availability state required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
