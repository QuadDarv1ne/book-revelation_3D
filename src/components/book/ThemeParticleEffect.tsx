"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Points, PointMaterial } from "@react-three/drei";

interface ThemeParticleEffectProps {
  activeTheme: string;
  onThemeChange?: (theme: string) => void;
}

const PARTICLE_COUNT = 50;

// Цвета частиц для разных тем
const THEME_COLORS = {
  dark: 0xd4af37, // золотой
  light: 0x333333, // темно-серый
  blue: 0x3b82f6, // синий
  purple: 0x7c3aed, // фиолетовый
  ambient: 0x059669, // изумрудный
  relax: 0x1a3f2f, // темно-зеленый
  auto: 0xd4af37, // золотой (по умолчанию как dark)
};

interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
  velocities: { x: number; y: number; z: number }[];
}

function createParticleData(activeTheme: keyof typeof THEME_COLORS): ParticleData {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  const cols = new Float32Array(PARTICLE_COUNT * 3);
  const velocities: { x: number; y: number; z: number }[] = [];
  const baseColor = new THREE.Color(THEME_COLORS[activeTheme]);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = 0.5 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = radius * Math.cos(phi) + 0.6;
    pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    velocities[i] = {
      x: (Math.random() - 0.5) * 0.02,
      y: Math.random() * 0.03 + 0.01,
      z: (Math.random() - 0.5) * 0.02
    };

    cols[i * 3] = baseColor.r;
    cols[i * 3 + 1] = baseColor.g;
    cols[i * 3 + 2] = baseColor.b;
  }

  return { positions: pos, colors: cols, velocities };
}

export function ThemeParticleEffect({ activeTheme, onThemeChange }: ThemeParticleEffectProps) {
  const [showParticles, setShowParticles] = useState(false);
  const particlesRef = useRef<THREE.Points>(null);
  const particleDataRef = useRef<ParticleData | null>(null);
  const previousThemeRef = useRef(activeTheme);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  void onThemeChange;

  // Инициализация частиц при монтировании
  useEffect(() => {
    particleDataRef.current = createParticleData(activeTheme as keyof typeof THEME_COLORS);
  }, []);

  // Эффект при смене темы
  useEffect(() => {
    if (activeTheme !== previousThemeRef.current && particleDataRef.current) {
      setShowParticles(true);
      previousThemeRef.current = activeTheme;

      const geometry = particlesRef.current?.geometry as THREE.BufferGeometry | undefined;
      if (geometry) {
        const colorsArray = geometry.attributes.color.array as Float32Array;
        const newColor = new THREE.Color(THEME_COLORS[activeTheme as keyof typeof THEME_COLORS]);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          colorsArray[i * 3] = newColor.r;
          colorsArray[i * 3 + 1] = newColor.g;
          colorsArray[i * 3 + 2] = newColor.b;
        }

        geometry.attributes.color.needsUpdate = true;
      }

      timerRef.current = setTimeout(() => {
        setShowParticles(false);
      }, 2000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [activeTheme]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Анимация частиц
  useFrame(() => {
    if (!particlesRef.current || !showParticles || !particleDataRef.current) return;
    
    const geometry = particlesRef.current.geometry as THREE.BufferGeometry;
    const positionsArray = geometry.attributes.position.array as Float32Array;
    const colorsArray = geometry.attributes.color.array as Float32Array;
    const velocities = particleDataRef.current.velocities;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positionsArray[i * 3] += velocities[i].x;
      positionsArray[i * 3 + 1] += velocities[i].y;
      positionsArray[i * 3 + 2] += velocities[i].z;

      velocities[i].y -= 0.001;

      const alpha = Math.max(0, Math.min(1, positionsArray[i * 3 + 1] / 3));

      colorsArray[i * 3] = colorsArray[i * 3] * alpha;
      colorsArray[i * 3 + 1] = colorsArray[i * 3 + 1] * alpha;
      colorsArray[i * 3 + 2] = colorsArray[i * 3 + 2] * alpha;

      if (positionsArray[i * 3 + 1] > 3) {
        const radius = 0.5 + Math.random() * 1.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positionsArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positionsArray[i * 3 + 1] = 0.6;
        positionsArray[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

        velocities[i] = {
          x: (Math.random() - 0.5) * 0.02,
          y: Math.random() * 0.03 + 0.01,
          z: (Math.random() - 0.5) * 0.02
        };
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });

  if (!showParticles || !particleDataRef.current) return null;

  return (
    <Points ref={particlesRef} limit={PARTICLE_COUNT}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleDataRef.current.positions, 3]}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particleDataRef.current.colors, 3]}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        size={0.05}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
}