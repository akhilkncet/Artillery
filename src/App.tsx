/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { SimulationProvider, useSimulation } from './state/SimulationContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ConfigurationView } from './pages/Configure/ConfigurationView';

const SimulationView = lazy(() => import('./pages/Simulation/SimulationView').then((m) => ({ default: m.SimulationView })));
const ResultsView = lazy(() => import('./pages/Results/ResultsView').then((m) => ({ default: m.ResultsView })));

const MainContent: React.FC = () => {
  const { currentPage } = useSimulation();

  return (
    <div className="flex-1 flex flex-col w-full">
      <Suspense fallback={null}>
        {currentPage === 'configure' && <ConfigurationView />}
        {currentPage === 'simulation' && <SimulationView />}
        {currentPage === 'results' && <ResultsView />}
      </Suspense>
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <div className="min-h-screen bg-[#030704] text-[#d9e6da] flex flex-col font-mono-tech selection:bg-[#05ffa1] selection:text-[#030704]">
        <Header />
        <main className="flex-1 flex flex-col">
          <MainContent />
        </main>
        <Footer />
      </div>
    </SimulationProvider>
  );
}
