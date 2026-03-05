"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 180;

interface ParticleRingProps {
  isRotating: boolean;
}

function generateParticleData() {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  const col = new Float32Array(PARTICLE_COUNT * 3);
  const siz = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const radius = 1.5 + Math.random() * 0.5;
    pos[i * 3] = Math.cos(angle) * radius;
    pos[i * 3 + 1] = 0.3 + Math.random() * 1.8;
    pos[i * 3 + 2] = Math.sin(angle) * radius;

    col[i * 3] = 0.83 + Math.random() * 0.12;
    col[i * 3 + 1] = 0.68 + Math.random() * 0.12;
    col[i * 3 + 2] = 0.21 + Math.random() * 0.12;

    siz[i] = 0.02 + Math.random() * 0.03;
  }
  return { positions: pos, colors: col, sizes: siz };
}

export function ParticleRing({ isRotating }: ParticleRingProps) {
  const ringRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => generateParticleData(), []);

  useFrame((state) => {
    if (ringRef.current) {
      if (isRotating) {
        ringRef.current.rotation.y += 0.002;
      }
      const positionArray = ringRef.current.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const baseY = 0.3 + (i / PARTICLE_COUNT) * 1.8;
        positionArray[i * 3 + 1] =
          baseY + Math.sin(state.clock.elapsedTime * 2 + i * 0.1) * 0.05;
      }
      ringRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ringRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
