import * as THREE from 'three';

export interface GreetingResponse {
  message: string;
  signature: string;
}

export enum OrnamentColor {
  GOLD = '#FFD700',
  RED = '#D40000',
  BLUE = '#000080',
  SILVER = '#C0C0C0'
}

export interface TreeLayerProps {
  position: [number, number, number];
  scale: number;
  rotationOffset: number;
}

// New types for the Interactive Particle System
export type Vector3Array = [number, number, number];

export interface ParticleData {
  id: number;
  treePos: THREE.Vector3;
  scatterPos: THREE.Vector3;
  color: THREE.Color;
  scale: number;
  rotationSpeed: number;
  phaseOffset: number;
}