"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface BookLODProps {
  isRotating: boolean;
}

const BOOK_WIDTH = 1.35;
const BOOK_HEIGHT = 1.85;
const BOOK_DEPTH = 0.22;
const COVER_THICKNESS = 0.018;

const HIGH_POLY_COVER_GEOMETRY = new THREE.BoxGeometry(BOOK_WIDTH, BOOK_HEIGHT, COVER_THICKNESS);
const HIGH_POLY_PAGES_GEOMETRY = new THREE.BoxGeometry(BOOK_WIDTH - 0.06, BOOK_HEIGHT - 0.06, BOOK_DEPTH - 0.035);
const HIGH_POLY_SPINE_GEOMETRY = new THREE.BoxGeometry(0.035, BOOK_HEIGHT + 0.015, BOOK_DEPTH + 0.015);
const HIGH_POLY_PAGES_EDGE_GEOMETRY = new THREE.BoxGeometry(0.07, BOOK_HEIGHT - 0.08, BOOK_DEPTH - 0.04);
const HIGH_POLY_GOLD_TOP_GEOMETRY = new THREE.BoxGeometry(BOOK_WIDTH - 0.08, 0.012, BOOK_DEPTH - 0.015);
const LOW_POLY_BOOK_GEOMETRY = new THREE.BoxGeometry(BOOK_WIDTH, BOOK_HEIGHT, BOOK_DEPTH);

export function BookLOD({ isRotating }: BookLODProps) {
  const bookGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [currentLOD, setCurrentLOD] = React.useState(0);

  const highDetailMaterials = useMemo(() => {
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: "#d4af37",
      roughness: 0.25,
      metalness: 0.85,
      emissive: "#d4af37",
      emissiveIntensity: 0.1,
    });

    const pagesMaterial = new THREE.MeshStandardMaterial({
      color: "#f8f4eb",
      roughness: 0.95,
      metalness: 0,
    });

    const pagesEdgeMaterial = new THREE.MeshStandardMaterial({
      color: "#f5f0e6",
      roughness: 0.9,
      metalness: 0,
    });

    return { gold: goldMaterial, pages: pagesMaterial, pagesEdge: pagesEdgeMaterial };
  }, []);

  const lowPolyMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#c9a950",
      roughness: 0.5,
      metalness: 0.3,
    });
  }, []);

  useFrame((state, delta) => {
    const book = bookGroupRef.current;
    if (!book) return;

    const clampedDelta = Math.min(delta, 0.1);
    const time = state.clock.elapsedTime;

    if (isRotating) {
      book.rotation.y += clampedDelta * 0.5;
    }

    book.position.y = 0.6 + Math.sin(time * 0.5) * 0.04;

    if (!isRotating) {
      book.rotation.x += Math.sin(time * 0.3) * 0.015 * clampedDelta;
      book.rotation.z = Math.cos(time * 0.4) * 0.008;
    }

    // Переключение LOD по расстоянию
    if (camera) {
      const distance = book.position.distanceTo(camera.position);
      const newLOD = distance < 3 ? 0 : distance < 6 ? 1 : 2;
      if (newLOD !== currentLOD) {
        setCurrentLOD(newLOD);
      }
    }
  });

  // Рендерим только текущий уровень детализации
  if (currentLOD === 0) {
    return (
      <group ref={bookGroupRef} position={[0, 0.6, 0]}>
        <mesh position={[0, 0, -BOOK_DEPTH / 2 + COVER_THICKNESS / 2]} castShadow>
          <primitive object={HIGH_POLY_COVER_GEOMETRY} />
          <meshStandardMaterial color="#d4af37" roughness={0.45} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <primitive object={HIGH_POLY_PAGES_GEOMETRY} />
          <primitive object={highDetailMaterials.pages} />
        </mesh>
        <mesh position={[0, 0, BOOK_DEPTH / 2 - COVER_THICKNESS / 2]} castShadow>
          <primitive object={HIGH_POLY_COVER_GEOMETRY} />
          <meshStandardMaterial color="#d4af37" roughness={0.45} metalness={0.15} />
        </mesh>
        <mesh position={[-BOOK_WIDTH / 2 - 0.008, 0, 0]} castShadow>
          <primitive object={HIGH_POLY_SPINE_GEOMETRY} />
          <meshStandardMaterial color="#d4af37" roughness={0.45} metalness={0.15} />
        </mesh>
        <mesh position={[BOOK_WIDTH / 2 - 0.035, 0, 0]}>
          <primitive object={HIGH_POLY_PAGES_EDGE_GEOMETRY} />
          <primitive object={highDetailMaterials.pagesEdge} />
        </mesh>
        <mesh position={[0, BOOK_HEIGHT / 2 - 0.008, 0]}>
          <primitive object={HIGH_POLY_GOLD_TOP_GEOMETRY} />
          <primitive object={highDetailMaterials.gold} />
        </mesh>
        <mesh position={[0, -BOOK_HEIGHT / 2 + 0.008, 0]}>
          <primitive object={HIGH_POLY_GOLD_TOP_GEOMETRY} />
          <primitive object={highDetailMaterials.gold} />
        </mesh>
      </group>
    );
  }

  if (currentLOD === 1) {
    return (
      <group ref={bookGroupRef} position={[0, 0.6, 0]}>
        <mesh castShadow>
          <primitive object={HIGH_POLY_COVER_GEOMETRY} />
          <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={0.2} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={bookGroupRef} position={[0, 0.6, 0]}>
      <mesh castShadow>
        <primitive object={LOW_POLY_BOOK_GEOMETRY} />
        <primitive object={lowPolyMaterial} />
      </mesh>
    </group>
  );
}
