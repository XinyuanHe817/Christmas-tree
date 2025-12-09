import React, { useState, Suspense, useEffect } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, BakeShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { MorphingTree, StarTopper, EnvironmentEffects } from './components/SceneComponents';
import Overlay from './components/Overlay';
import LoadingScreen from './components/LoadingScreen';
import { generateLuxuryGreeting } from './services/geminiService';
import { GreetingResponse } from './types';

// Augment JSX namespace to include R3F elements for both React 18 and older versions
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// Ensure module augmentation for React 18+ where JSX is namespaced
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const App: React.FC = () => {
  const [greeting, setGreeting] = useState<GreetingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [isTreeFormed, setIsTreeFormed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateGreeting = async () => {
    setIsLoading(true);
    if (!isTreeFormed) setIsTreeFormed(true);
    
    const result = await generateLuxuryGreeting();
    setGreeting(result);
    setIsLoading(false);
  };

  const toggleTreeState = () => {
    setIsTreeFormed(prev => !prev);
  };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {!isAppLoaded && <LoadingScreen />}
      
      <div className={`w-full h-full transition-opacity duration-1000 ${isAppLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Overlay 
          greeting={greeting} 
          isLoading={isLoading} 
          onGenerate={handleGenerateGreeting}
          isTreeFormed={isTreeFormed}
          onToggleTree={toggleTreeState}
        />
        
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, toneMappingExposure: 1.2 }}>
          <PerspectiveCamera makeDefault position={[0, 2, 14]} fov={35} />
          
          <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 2.5} 
            maxPolarAngle={Math.PI / 1.7}
            minDistance={8}
            maxDistance={25}
            autoRotate={isTreeFormed} 
            autoRotateSpeed={-1.0} // Negative for Clockwise rotation
            dampingFactor={0.05}
          />

          {/* --- Cinematic Lighting --- */}
          {/* Base Ambience */}
          <ambientLight intensity={0.2} color="#001020" />
          
          {/* Main Warm Key Light - Bright and Golden */}
          <spotLight 
            position={[10, 15, 8]} 
            angle={0.4} 
            penumbra={0.3} 
            intensity={6} 
            castShadow 
            shadow-bias={-0.0001}
            color="#FFD700" 
          />
          
          {/* Cool Fill Light from opposite side */}
          <spotLight 
            position={[-10, 5, -5]} 
            angle={0.6} 
            penumbra={1} 
            intensity={4} 
            color="#4488FF" 
          />
          
          {/* Warm rim light for the tree bottom */}
          <pointLight position={[0, -2, 4]} intensity={2} color="#FF4400" distance={12} />

          {/* Environment Reflections */}
          <Environment preset="night" />

          <Suspense fallback={null}>
            <MorphingTree isFormed={isTreeFormed} />
            <StarTopper isFormed={isTreeFormed} />
            <EnvironmentEffects />
            <BakeShadows />
          </Suspense>

          <EffectComposer disableNormalPass>
            {/* Enhanced Bloom for "Glowing" effect */}
            <Bloom 
              luminanceThreshold={0.6} 
              mipmapBlur 
              intensity={1.8} 
              radius={0.5} 
            />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
            <Noise opacity={0.05} />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
};

export default App;
