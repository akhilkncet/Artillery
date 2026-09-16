import React from 'react';
import { useSimulation } from '../../state/SimulationContext';
import { PageId } from '../../types/simulation';
import { Target } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentPage, setCurrentPage, simulationResult } = useSimulation();

  const tabs: { id: PageId; label: string; num: string; disabled?: boolean }[] = [
    { id: 'configure', label: 'CONFIGURE', num: '01' },
    { id: 'simulation', label: 'SIMULATION', num: '02', disabled: !simulationResult },
    { id: 'results', label: 'RESULTS', num: '03', disabled: !simulationResult },
  ];

  const getStatusBadge = () => {
    switch (currentPage) {
      case 'simulation':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-[#06100a] border border-[#133822] text-[#05ffa1] text-xs font-mono-tech tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#05ffa1]" />
            <span>SIMULATION RUNNING</span>
          </div>
        );
      case 'results':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-[#06100a] border border-[#133822] text-[#05ffa1] text-xs font-mono-tech tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#05ffa1]" />
            <span>SIMULATION COMPLETE</span>
          </div>
        );
      case 'configure':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-[#06100a] border border-[#133822] text-[#05ffa1] text-xs font-mono-tech tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#05ffa1]" />
            <span>SYSTEM READY</span>
          </div>
        );
    }
  };

  return (
    <header className="border-b border-[#122b1d] bg-[#060e09]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between border-b border-[#0f2317]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none border border-[#05ffa1]/60 flex items-center justify-center bg-[#0b1a11] text-[#05ffa1]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono-tech font-bold tracking-wider text-sm sm:text-base text-white">
                SHELL &amp; FUZE SIMULATION
              </span>
            </div>
            <div className="text-[11px] font-mono-tech text-[#4e7a5e] tracking-widest">
              Conceptual Engineering Simulator
            </div>
          </div>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-start gap-2">
        <nav className="flex items-center gap-1 sm:gap-2 flex-wrap" aria-label="Simulation Workflow Stages">
          {tabs.map((tab, idx) => {
            const isActive = currentPage === tab.id;
            return (
              <React.Fragment key={tab.id}>
                <button
                  type="button"
                  id={`nav-tab-${tab.id}`}
                  onClick={() => !tab.disabled && setCurrentPage(tab.id)}
                  disabled={tab.disabled}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1 text-xs font-mono-tech uppercase transition-colors border ${
                    isActive
                      ? 'bg-[#05ffa1] text-[#030704] border-[#05ffa1] font-bold'
                      : tab.disabled
                      ? 'bg-[#0b160f] text-[#3a4a3f] border-[#163523] cursor-not-allowed'
                      : 'bg-[#0b160f] text-[#849588] border-[#163523] hover:text-[#d9e6da] hover:border-[#05ffa1]/50'
                  }`}
                >
                  <span className={isActive ? 'text-[#030704]' : 'text-[#4e7a5e]'}>{tab.num}</span>
                  <span>{tab.label}</span>
                </button>
                {idx < tabs.length - 1 && (
                  <span className="text-[#1f4830] text-xs font-mono-tech hidden md:inline">→</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
