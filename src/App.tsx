/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimulationProvider } from './state/SimulationContext';
import { Footer } from './components/layout/Footer';
import { SimulationView } from './pages/Simulation/SimulationView';

export default function App() {
  return (
    <SimulationProvider>
      <div className="min-h-screen bg-[#151619] text-[#FFFFFF] flex flex-col font-mono-tech selection:bg-[#FF9822] selection:text-[#151619]">
        <main className="flex-1 flex flex-col">
          <SimulationView />
        </main>
        <Footer />
      </div>
    </SimulationProvider>
  );
}
