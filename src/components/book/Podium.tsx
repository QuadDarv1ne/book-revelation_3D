"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Podium() {
  const glowRingRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  // Geometries
  const baseGeometry = useMemo(() => new THREE.CylinderGeometry(1.35, 1.55, 0.22, 32), []);
  const topCircleGeometry = useMemo(() => new THREE.CircleGeometry(1.35, 32), []);
  const innerCircle_geometry = useMemo(() => new THREE.CircleGeometry(1.15, 32), []);
  const ringGeometry = useMemo(() => new THREE.RingGeometry(1.1, 1.3, 32), []);
  const torusGeometry = useMemo(() => new THREE.TorusGeometry(1.5, 0.022, 16, 32), []);
  const bottomCircleGeometry = useMemo(() => new THREE.CircleGeometry(1.7, 32), []);

  // Materials
  const baseMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0d0d1a",
    roughness: 0.2,
    metalness: 0.85
  }), []);

  const topMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#12122a",
    roughness: 0.25,
    metalness: 0.75
  }), []);

  const innerGlowMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0a0a15",
    roughness: 0.45,
    metalness: 0.55,
    emissive: "#d4af37",
    emissiveIntensity: 0.12
  }), []);

  const glowRingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#d4af37",
    roughness: 0.12,
    metalness: 0.95,
    emissive: "#d4af37",
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.92
  }), []);

  const outerRingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#d4af37",
    roughness: 0.15,
    metalness: 0.92,
    emissive: "#d4af37",
    emissiveIntensity: 0.25
  }), []);

  const bottomGlowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#d4af37",
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending
  }), []);

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
        <primitive object={baseGeometry} />
        <primitive object={baseMaterial} />
      </mesh>

      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <primitive object={topCircleGeometry} />
        <primitive object={topMaterial} />
      </mesh>

      <mesh ref={innerGlowRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={innerCircle_geometry} />
        <primitive object={innerGlowMaterial} />
      </mesh>

      <mesh ref={glowRingRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={ringGeometry} />
        <primitive object={glowRingMaterial} />
      </mesh>

      <mesh ref={outerRingRef} position={[0, -0.19, 0]}>
        <primitive object={torusGeometry} />
        <primitive object={outerRingMaterial} />
      </mesh>

      <mesh position={[0, -0.22, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <primitive object={bottomCircleGeometry} />
        <primitive object={bottomGlowMaterial} />
      </mesh>
    </group>
  );
}
