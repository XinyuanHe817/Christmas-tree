import React from 'react';
import { GreetingResponse } from '../types';

interface OverlayProps {
  greeting: GreetingResponse | null;
  isLoading: boolean;
  onGenerate: () => void;
  isTreeFormed: boolean;
  onToggleTree: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ 
  greeting, 
  isLoading, 
  onGenerate,
  isTreeFormed,
  onToggleTree
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 md:p-12">
      {/* Header / Logo */}
      <header className="flex justify-between items-start pointer-events-auto">
        {/* Left Side: Merry Christmas Typography */}
        <div className="flex flex-col select-none">
          <h2 className="text-6xl md:text-8xl font-display text-arix-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] leading-none">
            MERRY
          </h2>
          <h2 className="text-5xl md:text-7xl font-display text-arix-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] ml-4 leading-none">
            CHRISTMAS
          </h2>
        </div>
        
        {/* Right Side: Brand */}
        <div className="text-right">
          <h1 className="text-2xl font-display text-white/80 tracking-widest">
            ARIX
          </h1>
          <p className="text-xs text-arix-gold font-serif tracking-[0.3em] uppercase">
            Signature
          </p>
        </div>
      </header>

      {/* Main Interaction Area */}
      <main className="flex flex-col items-center justify-end md:justify-center h-full pb-10 pointer-events-auto w-full max-w-4xl mx-auto">
        
        {/* Greeting Card */}
        {greeting && (
           <div className={`relative mb-12 max-w-lg w-full transition-all duration-1000 transform ${isTreeFormed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
             <div className="absolute -inset-1 bg-gradient-to-r from-arix-gold via-white to-arix-gold rounded-lg blur opacity-20"></div>
             <div className="relative bg-black/40 backdrop-blur-md border border-arix-gold/30 p-8 rounded-lg text-center shadow-2xl">
                <p className="font-serif text-xl md:text-2xl text-gray-100 leading-relaxed italic mb-6">
                  "{greeting.message}"
                </p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-arix-gold to-transparent mb-4 opacity-50"></div>
                <p className="font-display text-arix-gold text-lg tracking-widest">
                  {greeting.signature}
                </p>
             </div>
           </div>
        )}

        {/* Control Cluster */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          
          {/* Main Action: Generate Wish */}
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className={`
              group relative px-8 py-4 bg-transparent overflow-hidden border border-arix-gold/50
              transition-all duration-300 hover:border-arix-gold hover:bg-arix-gold/10 w-64
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="absolute inset-0 w-0 bg-arix-gold transition-all duration-[400ms] ease-out group-hover:w-full opacity-10"></div>
            <span className="relative font-display text-sm tracking-[0.2em] text-white uppercase group-hover:text-arix-goldLight transition-colors">
              {isLoading ? 'Consulting...' : 'Reveal Wish'}
            </span>
          </button>

          {/* Morph Toggle */}
          <button
            onClick={onToggleTree}
            className="group relative px-8 py-4 bg-transparent overflow-hidden border border-arix-blue/50
              transition-all duration-300 hover:border-arix-blue hover:bg-arix-blue/10 w-64 cursor-pointer"
          >
             <div className="absolute inset-0 w-0 bg-arix-blue transition-all duration-[400ms] ease-out group-hover:w-full opacity-20"></div>
             <span className="relative font-display text-sm tracking-[0.2em] text-white uppercase group-hover:text-cyan-200 transition-colors">
               {isTreeFormed ? 'Disperse' : 'Assemble'}
             </span>
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="flex justify-between items-end pointer-events-auto">
        <div className="text-left hidden md:block">
           <p className="text-xs text-white/30 font-serif tracking-wider">
            STATUS: {isTreeFormed ? 'CONVERGED' : 'AWAITING COHESION'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Overlay;
