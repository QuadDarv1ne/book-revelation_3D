"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 150;
const RING_RADIUS = 1.5;
const RING_WIDTH = 0.4;

interface ParticleRingProps {
  isRotating: boolean;
}

export function ParticleRingOptimized({ isRotating }: ParticleRingProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const colorsRef = useRef(new THREE.Color());
  const [particleData, setParticleData] = useState<Array<{
    angle: number;
    radius: number;
    baseY: number;
    speed: number;
    phase: number;
  }>>([]);

  // Генерируем начальные данные частиц один раз при монтировании
  useEffect(() => {
    const data: Array<{
      angle: number;
      radius: number;
      baseY: number;
      speed: number;
      phase: number;
    }> = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const radius = RING_RADIUS + (Math.random() - 0.5) * RING_WIDTH;
      const baseY = 0.3 + Math.random() * 1.5;
      const speed = 0.5 + Math.random() * 0.5;
      const phase = Math.random() * Math.PI * 2;

      data.push({ angle, radius, baseY, speed, phase });
    }

    setParticleData(data);
  }, []);

  // Создаем геометрию для инстанса (маленькая сфера)
  const instanceGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.02, 4, 4);
    return geometry;
  }, []);

  // Создаем материал
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Инициализация позиций при монтировании
  useEffect(() => {
    if (!meshRef.current) return;

    particleData.forEach((particle, i) => {
      const dummy = dummyRef.current;
      dummy.position.set(
        Math.cos(particle.angle) * particle.radius,
        particle.baseY,
        Math.sin(particle.angle) * particle.radius
      );
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particleData]);

  // Анимация
  useFrame((state) => {
    if (!meshRef.current || !isRotating) return;

    const time = state.clock.elapsedTime;

    particleData.forEach((particle, i) => {
      const dummy = dummyRef.current;
      
      // Вращение по кольцу
      const currentAngle = particle.angle + time * particle.speed * 0.2;
      const x = Math.cos(currentAngle) * particle.radius;
      const z = Math.sin(currentAngle) * particle.radius;
      
      // Волнообразное движение по Y
      const y = particle.baseY + Math.sin(time * 1.5 + particle.phase) * 0.03;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(1 + Math.sin(time * 2 + particle.phase) * 0.1);
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Пульсация цвета
      const intensity = 0.5 + Math.sin(time * 3 + particle.phase) * 0.1;
      colorsRef.current.setRGB(0.83 * intensity, 0.68 * intensity, 0.21 * intensity);
      meshRef.current!.setColorAt(i, colorsRef.current);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, PARTICLE_COUNT]}
      geometry={instanceGeometry}
      material={material}
    />
  );
}
