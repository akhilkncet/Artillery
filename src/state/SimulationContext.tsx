import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  SimulationConfiguration,
  SimulationResult,
  PageId,
} from '../types/simulation';
import { LocalSimulationEngine } from '../simulation/engine/LocalSimulationEngine';
import { validateConfiguration, ValidationResult } from '../validation/configurationValidation';

export const DEFAULT_CONFIGURATION: SimulationConfiguration = {
  scenario: {
    scenarioName: 'Demonstration-01',
    scenarioType: 'Standard Demonstration',
    target: 'Target A',
    initialState: 'Nominal',
  },
  navigation: {
    scheme: 'sensor_fusion',
    sensorAvailability: 'Nominal',
    navigationQuality: 'Normal',
  },
  control: {
    method: 'canard',
    correctionEnabled: true,
  },
  fuze: {
    concept: 'multimode',
    modeLabel: 'Simulation Only',
  },
  environment: {
    disturbance: 'moderate',
    sensorQuality: 'normal',
    navigationAvailability: 'available',
  },
  settings: {
    showNominalTrajectory: true,
    showSimulatedTrajectory: true,
    showTarget: true,
    showCorrectionEvents: true,
    duration: 'Standard (10s)',
    animationSpeed: 'normal',
  },
};

interface SimulationContextType {
  configuration: SimulationConfiguration;
  setConfiguration: React.Dispatch<React.SetStateAction<SimulationConfiguration>>;
  updateConfiguration: (patch: Partial<SimulationConfiguration>) => void;
  validation: ValidationResult;
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  simulationResult: SimulationResult | null;
  generateSimulation: () => boolean;
  resetConfiguration: () => void;
  saveConfigurationToStorage: () => void;
  loadConfigurationFromStorage: () => boolean;
  saveStatusMessage: string | null;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'shell_fuze_simulation_config';

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [configuration, setConfiguration] = useState<SimulationConfiguration>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIGURATION;
  });

  const [currentPage, setCurrentPage] = useState<PageId>('configure');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(() => {
    const engine = new LocalSimulationEngine();
    return engine.runSimulation(DEFAULT_CONFIGURATION);
  });
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  const validation = validateConfiguration(configuration);

  const updateConfiguration = (patch: Partial<SimulationConfiguration>) => {
    setConfiguration((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const generateSimulation = (): boolean => {
    const valid = validateConfiguration(configuration);
    if (!valid.isValid) {
      setCurrentPage('configure');
      return false;
    }

    const engine = new LocalSimulationEngine();
    const result = engine.runSimulation(configuration);
    setSimulationResult(result);
    setCurrentPage('simulation');
    return true;
  };

  const resetConfiguration = () => {
    setConfiguration(DEFAULT_CONFIGURATION);
    const engine = new LocalSimulationEngine();
    setSimulationResult(engine.runSimulation(DEFAULT_CONFIGURATION));
    setSaveStatusMessage('Configuration reset to defaults.');
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  const saveConfigurationToStorage = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(configuration));
      setSaveStatusMessage('Configuration saved to local memory.');
      setTimeout(() => setSaveStatusMessage(null), 3000);
    } catch {
      setSaveStatusMessage('Failed to persist configuration.');
      setTimeout(() => setSaveStatusMessage(null), 3000);
    }
  };

  const loadConfigurationFromStorage = (): boolean => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setConfiguration(JSON.parse(saved));
        setSaveStatusMessage('Configuration loaded from local memory.');
        setTimeout(() => setSaveStatusMessage(null), 3000);
        return true;
      }
    } catch {
      // ignore
    }
    setSaveStatusMessage('No saved configuration found.');
    setTimeout(() => setSaveStatusMessage(null), 3000);
    return false;
  };

  return (
    <SimulationContext.Provider
      value={{
        configuration,
        setConfiguration,
        updateConfiguration,
        validation,
        currentPage,
        setCurrentPage,
        simulationResult,
        generateSimulation,
        resetConfiguration,
        saveConfigurationToStorage,
        loadConfigurationFromStorage,
        saveStatusMessage,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
