"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Points, PointMaterial } from "@react-three/drei";

interface ThemeParticleEffectProps {
  activeTheme: string;
  graphicsQuality?: 'low' | 'medium' | 'high';
}

const QUALITY_PARTICLE_COUNT = {
  low: 15,
  medium: 30,
  high: 50,
};

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

function createParticleData(activeTheme: keyof typeof THEME_COLORS, graphicsQuality: 'low' | 'medium' | 'high' = 'high'): ParticleData {
  const particleCount = QUALITY_PARTICLE_COUNT[graphicsQuality];
  const pos = new Float32Array(particleCount * 3);
  const cols = new Float32Array(particleCount * 3);
  const velocities: { x: number; y: number; z: number }[] = [];
  const baseColor = new THREE.Color(THEME_COLORS[activeTheme]);

  for (let i = 0; i < particleCount; i++) {
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

export function ThemeParticleEffect({ activeTheme, graphicsQuality = 'high' }: ThemeParticleEffectProps) {
  const [showParticles, setShowParticles] = useState(false);
  const particlesRef = useRef<THREE.Points>(null);
  const particleDataRef = useRef<ParticleData | null>(null);
  const previousThemeRef = useRef(activeTheme);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetColorRef = useRef<THREE.Color | null>(null);
  const colorVelocityRef = useRef<{ r: number; g: number; b: number }>({ r: 0, g: 0, b: 0 });

  // Инициализация частиц при монтировании
  useEffect(() => {
    particleDataRef.current = createParticleData(activeTheme as keyof typeof THEME_COLORS, graphicsQuality);
  }, [activeTheme, graphicsQuality]);

  // Эффект при смене темы с плавным переходом цвета
  useEffect(() => {
    if (activeTheme !== previousThemeRef.current && particleDataRef.current) {
      setShowParticles(true);
      const oldTheme = previousThemeRef.current;
      previousThemeRef.current = activeTheme;

      const oldColor = new THREE.Color(THEME_COLORS[oldTheme as keyof typeof THEME_COLORS]);
      const newColor = new THREE.Color(THEME_COLORS[activeTheme as keyof typeof THEME_COLORS]);
      targetColorRef.current = newColor;

      // Вычисляем скорость изменения цвета для плавного перехода
      const colorDiff = {
        r: (newColor.r - oldColor.r) / 60,
        g: (newColor.g - oldColor.g) / 60,
        b: (newColor.b - oldColor.b) / 60
      };
      colorVelocityRef.current = colorDiff;

      timerRef.current = setTimeout(() => {
        setShowParticles(false);
        targetColorRef.current = null;
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

  // Анимация частиц с плавным переходом цвета
  useFrame(() => {
    if (!particlesRef.current || !showParticles || !particleDataRef.current) return;

    const geometry = particlesRef.current.geometry as THREE.BufferGeometry;
    const positionsArray = geometry.attributes.position.array as Float32Array;
    const colorsArray = geometry.attributes.color.array as Float32Array;
    const velocities = particleDataRef.current.velocities;
    const particleCount = QUALITY_PARTICLE_COUNT[graphicsQuality];

    // Плавное изменение цвета к целевому
    if (targetColorRef.current) {
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        // Интерполяция к целевому цвету
        colorsArray[idx] += colorVelocityRef.current.r;
        colorsArray[idx + 1] += colorVelocityRef.current.g;
        colorsArray[idx + 2] += colorVelocityRef.current.b;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      positionsArray[i * 3] += velocities[i].x;
      positionsArray[i * 3 + 1] += velocities[i].y;
      positionsArray[i * 3 + 2] += velocities[i].z;

      velocities[i].y -= 0.001;

      const alpha = Math.max(0, Math.min(1, positionsArray[i * 3 + 1] / 3));

      // Применяем альфа-затухание к текущему цвету
      colorsArray[i * 3] *= (0.95 + alpha * 0.05);
      colorsArray[i * 3 + 1] *= (0.95 + alpha * 0.05);
      colorsArray[i * 3 + 2] *= (0.95 + alpha * 0.05);

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

        // При респауне частица получает текущий целевой цвет
        if (targetColorRef.current) {
          const idx = i * 3;
          colorsArray[idx] = targetColorRef.current.r;
          colorsArray[idx + 1] = targetColorRef.current.g;
          colorsArray[idx + 2] = targetColorRef.current.b;
        }
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });

  if (!showParticles || !particleDataRef.current) return null;

  return (
    <Points ref={particlesRef} limit={QUALITY_PARTICLE_COUNT[graphicsQuality]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleDataRef.current.positions, 3]}
          count={QUALITY_PARTICLE_COUNT[graphicsQuality]}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particleDataRef.current.colors, 3]}
          count={QUALITY_PARTICLE_COUNT[graphicsQuality]}
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