"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Points, PointMaterial } from "@react-three/drei";

interface ThemeParticleEffectProps {
  activeTheme: string;
  onThemeChange: (theme: string) => void;
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

export function ThemeParticleEffect({ activeTheme, onThemeChange }: ThemeParticleEffectProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [previousTheme, setPreviousTheme] = useState(activeTheme);
  const particlesRef = useRef<THREE.Points>(null);
  const velocities = useRef<{ x: number; y: number; z: number }[]>([]);

  // Создаем позиции и цвета частиц с помощью useMemo
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const cols = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);
    const themeKey = activeTheme as keyof typeof THEME_COLORS;
    const baseColor = new THREE.Color(THEME_COLORS[themeKey] || THEME_COLORS.dark);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Случайные позиции вокруг книги
      const radius = 0.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.cos(phi) + 0.6; // смещение по Y
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Случайные скорости
      velocities.current[i] = {
        x: (Math.random() - 0.5) * 0.02,
        y: Math.random() * 0.03 + 0.01,
        z: (Math.random() - 0.5) * 0.02
      };

      // Размеры частиц
      sz[i] = Math.random() * 0.03 + 0.01;

      // Цвета частиц
      cols[i * 3] = baseColor.r;
      cols[i * 3 + 1] = baseColor.g;
      cols[i * 3 + 2] = baseColor.b;
    }

    return { positions: pos, colors: cols, sizes: sz };
  }, []);

  // Анимация частиц
  useFrame(() => {
    if (particlesRef.current && showParticles) {
      const geometry = particlesRef.current.geometry as THREE.BufferGeometry;
      const positionsArray = geometry.attributes.position.array as Float32Array;
      const colorsArray = geometry.attributes.color.array as Float32Array;

      // Обновление позиций частиц
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positionsArray[i * 3] += velocities.current[i].x;
        positionsArray[i * 3 + 1] += velocities.current[i].y;
        positionsArray[i * 3 + 2] += velocities.current[i].z;

        // Уменьшение скорости по Y (эффект гравитации)
        velocities.current[i].y -= 0.001;

        // Изменение прозрачности и размера при движении вверх
        const alpha = Math.max(0, Math.min(1, positionsArray[i * 3 + 1] / 3));

        // Обновление цвета с учетом прозрачности
        colorsArray[i * 3] = colorsArray[i * 3] * alpha;
        colorsArray[i * 3 + 1] = colorsArray[i * 3 + 1] * alpha;
        colorsArray[i * 3 + 2] = colorsArray[i * 3 + 2] * alpha;

        // Удаление частиц, которые улетели слишком высоко
        if (positionsArray[i * 3 + 1] > 3) {
          // Перемещаем частицу обратно вниз с новыми параметрами
          const radius = 0.5 + Math.random() * 1.5;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;

          positionsArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positionsArray[i * 3 + 1] = 0.6;
          positionsArray[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

          velocities.current[i] = {
            x: (Math.random() - 0.5) * 0.02,
            y: Math.random() * 0.03 + 0.01,
            z: (Math.random() - 0.5) * 0.02
          };
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }
  });

  // Эффект при смене темы
  useEffect(() => {
    if (activeTheme !== previousTheme) {
      setShowParticles(true);
      setPreviousTheme(activeTheme);

      // Обновление цветов частиц
      if (particlesRef.current) {
        const geometry = particlesRef.current.geometry as THREE.BufferGeometry;
        const colorsArray = geometry.attributes.color.array as Float32Array;
        const newColor = new THREE.Color(THEME_COLORS[activeTheme as keyof typeof THEME_COLORS]);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          colorsArray[i * 3] = newColor.r;
          colorsArray[i * 3 + 1] = newColor.g;
          colorsArray[i * 3 + 2] = newColor.b;
        }

        geometry.attributes.color.needsUpdate = true;
      }

      // Скрытие частиц через 2 секунды
      const timer = setTimeout(() => {
        setShowParticles(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [activeTheme, previousTheme]);

  if (!showParticles) return null;

  return (
    <Points ref={particlesRef} limit={PARTICLE_COUNT}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
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