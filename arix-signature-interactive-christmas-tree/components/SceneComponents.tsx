import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleData } from '../types';

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

// --- Constants & Config ---
const TOTAL_PARTICLES = 2500;
const SCATTER_RADIUS = 14;

// --- Colors ---
const COLORS = [
  '#004225', // Dark Green
  '#004225', // Dark Green (Double weight)
  '#FFD700', // Gold
  '#8B0000', // Deep Red
  '#D40000', // Bright Red
];

// --- Geometries ---
const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const sphereGeometry = new THREE.SphereGeometry(0.12, 16, 16);

// --- Material ---
const sharedMaterial = new THREE.MeshPhysicalMaterial({
  roughness: 0.15,
  metalness: 0.8,
  reflectivity: 1,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
});

// --- Helper Functions ---
const getRandomScatterPos = (): THREE.Vector3 => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = SCATTER_RADIUS * (0.4 + Math.random() * 0.6);
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

const getTreePos = (index: number, total: number): THREE.Vector3 => {
  const height = 7;
  const baseRadius = 3.0;
  const startY = -3.0;

  // Normalized height (0 at bottom, 1 at top)
  const hPercent = index / total; 
  // Power curve to put more density at bottom
  const biasedH = Math.pow(hPercent, 0.85);

  const y = startY + biasedH * height;
  const r = baseRadius * (1 - biasedH);

  // Golden angle spacing
  const theta = index * 2.39996; 
  
  // Radius jitter for natural volume
  const rOffset = r * (0.85 + Math.random() * 0.3);
  
  const x = rOffset * Math.cos(theta);
  const z = rOffset * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
};

interface MorphingTreeProps {
  isFormed: boolean;
}

export const MorphingTree: React.FC<MorphingTreeProps> = ({ isFormed }) => {
  const cubeRef = useRef<THREE.InstancedMesh>(null);
  const sphereRef = useRef<THREE.InstancedMesh>(null);

  // Pre-calculate data
  const { cubeData, sphereData } = useMemo(() => {
    const cData: ParticleData[] = [];
    const sData: ParticleData[] = [];

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const treePos = getTreePos(i, TOTAL_PARTICLES);
      const scatterPos = getRandomScatterPos();
      
      const color = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
      
      const data: ParticleData = {
        id: i,
        treePos,
        scatterPos,
        color,
        scale: 0.8 + Math.random() * 0.6,
        rotationSpeed: Math.random() * 2,
        phaseOffset: Math.random() * Math.PI * 2
      };

      // 60% Cubes (Abstract Gifts/Blocks), 40% Spheres (Baubles)
      if (Math.random() > 0.4) {
        cData.push(data);
      } else {
        sData.push(data);
      }
    }

    return { cubeData: cData, sphereData: sData };
  }, []);

  // Init Colors
  useLayoutEffect(() => {
    if (cubeRef.current) {
      cubeData.forEach((d, i) => cubeRef.current!.setColorAt(i, d.color));
      cubeRef.current.instanceMatrix.needsUpdate = true;
    }
    if (sphereRef.current) {
      sphereData.forEach((d, i) => sphereRef.current!.setColorAt(i, d.color));
      sphereRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [cubeData, sphereData]);

  // Animation Loop
  useFrame((state, delta) => {
    const dummy = new THREE.Object3D();
    const time = state.clock.getElapsedTime();
    const lerpSpeed = 2.0 * delta;

    // Update Cubes
    if (cubeRef.current) {
      for (let i = 0; i < cubeData.length; i++) {
        const d = cubeData[i];
        const target = isFormed ? d.treePos : d.scatterPos;

        cubeRef.current.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        dummy.position.lerp(target, lerpSpeed);

        // Rotate cubes slowly
        dummy.rotation.x += d.rotationSpeed * 0.5 * delta;
        dummy.rotation.y += d.rotationSpeed * 0.5 * delta;

        // Pulse scale
        const scale = d.scale * (1 + Math.sin(time * 2 + d.phaseOffset) * 0.05);
        dummy.scale.set(scale, scale, scale);

        dummy.updateMatrix();
        cubeRef.current.setMatrixAt(i, dummy.matrix);
      }
      cubeRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Spheres
    if (sphereRef.current) {
      for (let i = 0; i < sphereData.length; i++) {
        const d = sphereData[i];
        const target = isFormed ? d.treePos : d.scatterPos;

        sphereRef.current.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        dummy.position.lerp(target, lerpSpeed);
        
        // Spheres don't need rotation visually unless textured, but we do it for consistnecy
        const scale = d.scale * (1 + Math.cos(time * 1.5 + d.phaseOffset) * 0.05);
        dummy.scale.set(scale, scale, scale);

        dummy.updateMatrix();
        sphereRef.current.setMatrixAt(i, dummy.matrix);
      }
      sphereRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh
        ref={cubeRef}
        args={[cubeGeometry, sharedMaterial, cubeData.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={sphereRef}
        args={[sphereGeometry, sharedMaterial, sphereData.length]}
        castShadow
        receiveShadow
      />
      
      {/* Tiny glowing particles surrounding the tree (Aura) */}
      {isFormed && (
        <group position={[0, 0, 0]}>
          <Sparkles 
            count={200} 
            scale={[4, 7, 4]} 
            size={4} 
            speed={0.4} 
            opacity={0.8}
            color="#FFD700" 
          />
        </group>
      )}

      {/* Scattered "Gifts" extra particles or just let the cubes be the gifts */}
    </group>
  );
};

export const StarTopper: React.FC<{ isFormed: boolean }> = ({ isFormed }) => {
  const ref = useRef<THREE.Group>(null);
  const treePos = new THREE.Vector3(0, 4.1, 0); // Slightly lowered y pos to sit better
  const scatterPos = new THREE.Vector3(0, 8, 0);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.position.lerp(isFormed ? treePos : scatterPos, delta * 2);
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={ref}>
      {/* Central Glowing Core - Reduced Size */}
      <mesh>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial color="#FFFFA0" />
      </mesh>
      
      {/* Radiant Spikes (Star Shape) - Reduced Scale */}
      <group scale={[0.5, 0.5, 0.5]}>
         {/* Vertical */}
         <mesh scale={[0.2, 2.5, 0.2]}>
            <octahedronGeometry />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} toneMapped={false} />
         </mesh>
         {/* Horizontal */}
         <mesh scale={[2.5, 0.2, 0.2]}>
            <octahedronGeometry />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} toneMapped={false} />
         </mesh>
         {/* Cross */}
         <mesh scale={[1.8, 0.2, 0.2]} rotation={[0, 0, Math.PI/4]}>
            <octahedronGeometry />
            <meshStandardMaterial color="#FFaa00" emissive="#FFaa00" emissiveIntensity={1} toneMapped={false} />
         </mesh>
         <mesh scale={[1.8, 0.2, 0.2]} rotation={[0, 0, -Math.PI/4]}>
            <octahedronGeometry />
            <meshStandardMaterial color="#FFaa00" emissive="#FFaa00" emissiveIntensity={1} toneMapped={false} />
         </mesh>
      </group>

      {/* Halo Effect - Reduced intensity/size */}
      <pointLight color="#FFD700" intensity={2} distance={3} decay={2} />
      <Sparkles count={15} scale={1.2} size={6} speed={0.2} color="#FFF" />
    </group>
  );
};

export const EnvironmentEffects = () => {
  return (
    <>
       {/* Background Snow - White and Blue spots */}
       <Sparkles 
         count={500} 
         scale={[25, 25, 25]} 
         size={3} 
         speed={0.5} 
         opacity={0.6}
         color="#FFFFFF"
       />
       <Sparkles 
         count={300} 
         scale={[30, 30, 30]} 
         size={5} 
         speed={0.3} 
         opacity={0.4}
         color="#88CCFF" // Blue tint
       />
       <Floor />
    </>
  );
};

export const Floor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#050505" 
        roughness={0.1} 
        metalness={0.8} 
        envMapIntensity={0.5}
      />
    </mesh>
  );
};
