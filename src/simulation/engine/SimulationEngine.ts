import { SimulationConfiguration, SimulationResult } from '../../types/simulation';

/**
 * Abstract simulation engine interface for future backend/API modularity.
 */
export interface SimulationEngine {
  runSimulation(config: SimulationConfiguration): SimulationResult;
}
