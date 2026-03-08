"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 200;
const RING_RADIUS = 1.5;
const RING_WIDTH = 0.5;

interface ParticleRingProps {
  isRotating: boolean;
}

interface ParticleData {
  angle: number;
  radius: number;
  baseY: number;
  speed: number;
  phase: number;
  baseSpeed: number;
}

function generateParticleData(): ParticleData[] {
  const data: ParticleData[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const radius = RING_RADIUS + (Math.random() - 0.5) * RING_WIDTH;
    const baseY = 0.3 + Math.random() * 1.5;
    const baseSpeed = 0.3 + Math.random() * 0.4;
    const speed = baseSpeed;
    const phase = Math.random() * Math.PI * 2;
    data.push({ angle, radius, baseY, speed, phase, baseSpeed });
  }
  return data;
}

export function ParticleRingOptimized({ isRotating }: ParticleRingProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const colorsRef = useRef(new THREE.Color());
  const particleDataRef = useRef<ParticleData[]>(generateParticleData());
  const rotationIntensityRef = useRef(0);

  // Создаем геометрию для инстанса (маленькая сфера)
  const instanceGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.025, 5, 5);
    return geometry;
  }, []);

  // Создаем материал
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Инициализация позиций при монтировании
  useEffect(() => {
    if (!meshRef.current) return;

    const particleData = particleDataRef.current;
    for (let i = 0; i < particleData.length; i++) {
      const particle = particleData[i];
      const dummy = dummyRef.current;
      dummy.position.set(
        Math.cos(particle.angle) * particle.radius,
        particle.baseY,
        Math.sin(particle.angle) * particle.radius
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Анимация
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const particleData = particleDataRef.current;

    // Плавное изменение интенсивности вращения
    const targetIntensity = isRotating ? 1 : 0.2;
    rotationIntensityRef.current = THREE.MathUtils.lerp(
      rotationIntensityRef.current,
      targetIntensity,
      0.05
    );

    for (let i = 0; i < particleData.length; i++) {
      const particle = particleData[i];
      const dummy = dummyRef.current;

      // Вращение по кольцу с реакцией на isRotating
      const speedMultiplier = isRotating ? 1.5 : 0.3;
      const currentAngle = particle.angle + time * particle.baseSpeed * speedMultiplier * 0.2;
      const x = Math.cos(currentAngle) * particle.radius;
      const z = Math.sin(currentAngle) * particle.radius;

      // Волнообразное движение по Y с усилением при вращении
      const waveAmplitude = isRotating ? 0.08 : 0.03;
      const y = particle.baseY + Math.sin(time * 1.5 + particle.phase) * waveAmplitude;

      // Спиральный эффект при вращении
      const spiralOffset = isRotating ? Math.sin(time * 2 + particle.phase) * 0.1 : 0;

      dummy.position.set(x + spiralOffset, y, z);

      // Усиленная пульсация размера при вращении
      const scaleBase = isRotating ? 1.2 : 0.8;
      const scalePulse = isRotating ? 0.3 : 0.1;
      const scale = scaleBase + Math.sin(time * 2.5 + particle.phase) * scalePulse;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();

      // Пульсация цвета с реакцией на вращение
      const baseIntensity = isRotating ? 0.7 : 0.4;
      const pulseIntensity = isRotating ? 0.3 : 0.1;
      const intensity = baseIntensity + Math.sin(time * 3 + particle.phase) * pulseIntensity;

      // Изменение цвета при вращении (более золотой)
      const r = 0.83 + (isRotating ? 0.17 * rotationIntensityRef.current : 0);
      const g = 0.68 + (isRotating ? 0.12 * rotationIntensityRef.current : 0);
      const b = 0.21 + (isRotating ? 0.15 * rotationIntensityRef.current : 0);

      colorsRef.current.setRGB(r * intensity, g * intensity, b * intensity);
      meshRef.current.setColorAt(i, colorsRef.current);
    }

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
