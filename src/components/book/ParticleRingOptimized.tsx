"use client";

import { useMemo, useRef, memo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const DEFAULT_PARTICLE_COUNT = 200;
const RING_RADIUS = 1.5;

interface ParticleRingOptimizedProps {
  isRotating: boolean;
  particleCount?: number;
}

// Создаем кастомную геометрию для инстансинга частиц
function createParticleInstancedMesh(particleCount: number) {
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);
  const phases = new Float32Array(particleCount);
  const baseY = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = RING_RADIUS + (Math.random() - 0.5) * 0.4;
    
    positions[i * 3] = Math.cos(angle) * radius;
    baseY[i] = 0.3 + Math.random() * 1.5;
    positions[i * 3 + 1] = baseY[i];
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    // Золотой цвет с вариациями
    const goldVariation = 0.9 + Math.random() * 0.2;
    colors[i * 3] = 0.83 * goldVariation;
    colors[i * 3 + 1] = 0.68 * goldVariation;
    colors[i * 3 + 2] = 0.21 * goldVariation;

    scales[i] = 0.03 + Math.random() * 0.02;
    phases[i] = Math.random() * Math.PI * 2;
  }

  return { positions, colors, scales, phases, baseY };
}

export const ParticleRingOptimized = memo(function ParticleRingOptimized({
  isRotating,
  particleCount = DEFAULT_PARTICLE_COUNT
}: ParticleRingOptimizedProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleData = useMemo(() => createParticleInstancedMesh(particleCount), [particleCount]);
  const colorRef = useRef(new THREE.Color());
  const matrixRef = useRef(new THREE.Matrix4());

  // Освобождаем память при размонтировании
  useEffect(() => {
    const currentMesh = meshRef.current;
    return () => {
      if (currentMesh) {
        currentMesh.dispose();
      }
    };
  }, []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh || !isRotating) return;

    const time = state.clock.elapsedTime;
    const { positions, colors, scales, phases, baseY } = particleData;

    // Вращение всего кольца
    mesh.rotation.y += 0.002;

    // Обновляем позиции и цвета частиц
    for (let i = 0; i < particleCount; i++) {
      // Вертикальное движение
      const yOffset = Math.sin(time * 1.5 + phases[i]) * 0.03;
      const y = baseY[i] + yOffset;

      // Пульсация размера
      const scale = scales[i] * (1 + Math.sin(time * 2 + phases[i]) * 0.1);

      // Позиция
      matrixRef.current.setPosition(
        positions[i * 3],
        y,
        positions[i * 3 + 2]
      );

      // Масштаб
      matrixRef.current.scale(new THREE.Vector3(scale, scale, scale));

      mesh.setMatrixAt(i, matrixRef.current);

      // Мерцание цвета
      const flicker = 0.95 + Math.sin(time * 3 + phases[i]) * 0.05;
      colorRef.current.setRGB(
        colors[i * 3] * flicker,
        colors[i * 3 + 1] * flicker,
        colors[i * 3 + 2] * flicker
      );
      mesh.setColorAt(i, colorRef.current);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor!.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, particleCount]}
      frustumCulled={false}
    >
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
});
