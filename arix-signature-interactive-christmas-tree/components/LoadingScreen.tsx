import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
      <div className="text-4xl font-display text-arix-gold animate-pulse mb-4">ARIX</div>
      <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-arix-gold to-transparent mb-4"></div>
      <p className="font-serif italic text-gray-400">Curating holiday elegance...</p>
    </div>
  );
};

export default LoadingScreen;
