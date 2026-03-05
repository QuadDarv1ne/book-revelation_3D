"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Podium() {
  const glowRingRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (glowRingRef.current) {
      (glowRingRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.25;
    }
    if (innerGlowRef.current) {
      (innerGlowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.12 + Math.sin(time * 1.5) * 0.05;
    }
    if (outerRingRef.current) {
      (outerRingRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.25 + Math.sin(time * 2.5) * 0.15;
    }
  });

  return (
    <group position={[0, -0.52, 0]}>
      <mesh position={[0, -0.08, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.35, 1.55, 0.22, 64]} />
        <meshStandardMaterial color="#0d0d1a" roughness={0.2} metalness={0.85} />
      </mesh>

      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.35, 64]} />
        <meshStandardMaterial color="#12122a" roughness={0.25} metalness={0.75} />
      </mesh>

      <mesh ref={innerGlowRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.15, 64]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.45} metalness={0.55} emissive="#d4af37" emissiveIntensity={0.12} />
      </mesh>

      <mesh ref={glowRingRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.3, 64]} />
        <meshStandardMaterial color="#d4af37" roughness={0.12} metalness={0.95} emissive="#d4af37" emissiveIntensity={0.5} transparent opacity={0.92} />
      </mesh>

      <mesh ref={outerRingRef} position={[0, -0.19, 0]}>
        <torusGeometry args={[1.5, 0.022, 16, 64]} />
        <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.92} emissive="#d4af37" emissiveIntensity={0.25} />
      </mesh>

      <mesh position={[0, -0.22, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[1.7, 64]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.06} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
