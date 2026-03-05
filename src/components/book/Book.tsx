"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { createBookCoverTexture, createSpineTexture } from "@/lib/textures";

interface BookProps {
  isRotating: boolean;
}

export function Book({ isRotating }: BookProps) {
  const bookRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  // Create textures once using useMemo
  const coverTexture = useMemo(() => createBookCoverTexture(), []);
  const spineTexture = useMemo(() => createSpineTexture(), []);

  // Target rotation for smooth transitions
  const targetRotation = useRef(0);

  useFrame((state) => {
    if (bookRef.current) {
      // Smooth rotation
      if (isRotating) {
        targetRotation.current += 0.005;
      }
      bookRef.current.rotation.y +=
        (targetRotation.current - bookRef.current.rotation.y) * 0.05;

      // Subtle floating
      bookRef.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * 0.5) * 0.04;

      // Tilt effect
      bookRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.015;
      bookRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.4) * 0.008;

      // Hover scale effect
      const targetScale = hovered ? 1.12 : 1;
      bookRef.current.scale.x += (targetScale - bookRef.current.scale.x) * 0.1;
      bookRef.current.scale.y += (targetScale - bookRef.current.scale.y) * 0.1;
      bookRef.current.scale.z += (targetScale - bookRef.current.scale.z) * 0.1;
    }

    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.22 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
    }
  });

  const bookWidth = 1.35;
  const bookHeight = 1.85;
  const bookDepth = 0.22;
  const coverThickness = 0.018;

  return (
    <group>
      <Float speed={0.4} rotationIntensity={0.05} floatIntensity={0.2}>
        <group
          ref={bookRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          position={[0, 0.6, 0]}
        >
          {/* Back Cover */}
          <mesh position={[0, 0, -bookDepth/2 + coverThickness/2]} castShadow>
            <boxGeometry args={[bookWidth, bookHeight, coverThickness]} />
            <meshStandardMaterial
              color="#1a0f0a"
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>

          {/* Pages */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[bookWidth - 0.06, bookHeight - 0.06, bookDepth - 0.035]} />
            <meshStandardMaterial
              color="#f8f4eb"
              roughness={0.95}
              metalness={0}
            />
          </mesh>

          {/* Front Cover with Texture */}
          <mesh position={[0, 0, bookDepth/2 - coverThickness/2]} castShadow>
            <boxGeometry args={[bookWidth, bookHeight, coverThickness]} />
            <meshStandardMaterial
              map={coverTexture}
              roughness={0.45}
              metalness={0.15}
            />
          </mesh>

          {/* Spine */}
          <mesh position={[-bookWidth/2 - 0.008, 0, 0]} castShadow>
            <boxGeometry args={[0.035, bookHeight + 0.015, bookDepth + 0.015]} />
            <meshStandardMaterial
              map={spineTexture}
              roughness={0.45}
              metalness={0.15}
            />
          </mesh>

          {/* Page edges */}
          <mesh position={[bookWidth/2 - 0.035, 0, 0]}>
            <boxGeometry args={[0.07, bookHeight - 0.08, bookDepth - 0.04]} />
            <meshStandardMaterial
              color="#f5f0e6"
              roughness={0.9}
              metalness={0}
            />
          </mesh>

          {/* Gold page edges (top and bottom) */}
          <mesh position={[0, bookHeight/2 - 0.008, 0]}>
            <boxGeometry args={[bookWidth - 0.08, 0.012, bookDepth - 0.015]} />
            <meshStandardMaterial
              color="#d4af37"
              roughness={0.25}
              metalness={0.85}
              emissive="#d4af37"
              emissiveIntensity={0.1}
            />
          </mesh>
          <mesh position={[0, -bookHeight/2 + 0.008, 0]}>
            <boxGeometry args={[bookWidth - 0.08, 0.012, bookDepth - 0.015]} />
            <meshStandardMaterial
              color="#d4af37"
              roughness={0.25}
              metalness={0.85}
              emissive="#d4af37"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
      </Float>

      {/* Glow effect under book */}
      <mesh
        ref={glowRef}
        position={[0, 0.04, 0]}
        rotation={[-Math.PI/2, 0, 0]}
      >
        <circleGeometry args={[1.1, 64]} />
        <meshBasicMaterial
          color="#d4af37"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
