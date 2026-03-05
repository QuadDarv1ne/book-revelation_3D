"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 60;

interface ParticleRingProps {
  isRotating: boolean;
}

export function ParticleRing({ isRotating }: ParticleRingProps) {
  const ringRef = useRef<THREE.Points>(null);

  const { positions, colors, baseY } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const baseY = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.4;
      positions[i * 3] = Math.cos(angle) * radius;
      baseY[i] = 0.3 + Math.random() * 1.5;
      positions[i * 3 + 1] = baseY[i];
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      colors[i * 3] = 0.83;
      colors[i * 3 + 1] = 0.68;
      colors[i * 3 + 2] = 0.21;
    }
    return { positions, colors, baseY };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  }), []);

  useFrame((state) => {
    if (ringRef.current && isRotating) {
      ringRef.current.rotation.y += 0.002;
      const pos = ringRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i * 3 + 1] = baseY[i] + Math.sin(state.clock.elapsedTime * 1.5 + i * 0.15) * 0.03;
      }
      ringRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ringRef} geometry={geometry} material={material} />
  );
}
