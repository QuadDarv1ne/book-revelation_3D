"use client";

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { createBookCoverTexture, createSpineTexture } from "@/lib/textures/index";

interface BookProps {
  isRotating: boolean;
}

const BOOK_WIDTH = 1.35;
const BOOK_HEIGHT = 1.85;
const BOOK_DEPTH = 0.22;
const COVER_THICKNESS = 0.018;

export function Book({ isRotating }: BookProps) {
  const bookRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  const touchState = useRef({ startX: 0, startY: 0, isDragging: false });
  const touchRotation = useRef({ x: 0, y: 0 });
  const targetRotation = useRef(0);

  const coverTexture = useMemo(() => createBookCoverTexture(), []);
  const spineTexture = useMemo(() => createSpineTexture(), []);

  // Reusable materials
  const coverMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: coverTexture,
    roughness: 0.45,
    metalness: 0.15,
    color: "#ffffff"
  }), [coverTexture]);

  const spineMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: spineTexture,
    roughness: 0.45,
    metalness: 0.15,
    color: "#ffffff"
  }), [spineTexture]);

  const darkCoverMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a0f0a",
    roughness: 0.6,
    metalness: 0.1
  }), []);

  const pagesMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f8f4eb",
    roughness: 0.95,
    metalness: 0
  }), []);

  const pagesEdgeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f5f0e6",
    roughness: 0.9,
    metalness: 0
  }), []);

  const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#d4af37",
    roughness: 0.25,
    metalness: 0.85,
    emissive: "#d4af37",
    emissiveIntensity: 0.1
  }), []);

  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#d4af37",
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
  }), []);

  // Geometries
  const coverGeometry = useMemo(() => new THREE.BoxGeometry(BOOK_WIDTH, BOOK_HEIGHT, COVER_THICKNESS), []);
  const pagesGeometry = useMemo(() => new THREE.BoxGeometry(BOOK_WIDTH - 0.06, BOOK_HEIGHT - 0.06, BOOK_DEPTH - 0.035), []);
  const spineGeometry = useMemo(() => new THREE.BoxGeometry(0.035, BOOK_HEIGHT + 0.015, BOOK_DEPTH + 0.015), []);
  const pagesEdgeGeometry = useMemo(() => new THREE.BoxGeometry(0.07, BOOK_HEIGHT - 0.08, BOOK_DEPTH - 0.04), []);
  const goldTopGeometry = useMemo(() => new THREE.BoxGeometry(BOOK_WIDTH - 0.08, 0.012, BOOK_DEPTH - 0.015), []);
  const glowGeometry = useMemo(() => new THREE.CircleGeometry(1.1, 32), []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchState.current = { startX: touch.clientX, startY: touch.clientY, isDragging: true };
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchState.current.isDragging) return;
    const touch = e.touches[0];
    touchRotation.current.y += (touch.clientX - touchState.current.startX) * 0.5;
    touchRotation.current.x += (touch.clientY - touchState.current.startY) * 0.5;
    touchState.current.startX = touch.clientX;
    touchState.current.startY = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchState.current.isDragging = false;
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gl.domElement, handleTouchStart, handleTouchMove, handleTouchEnd]);

  useFrame((state) => {
    const book = bookRef.current;
    if (!book) return;

    const time = state.clock.elapsedTime;

    if (isRotating && !touchState.current.isDragging) {
      targetRotation.current += 0.005;
    }

    if (touchState.current.isDragging) {
      book.rotation.y = THREE.MathUtils.lerp(book.rotation.y, touchRotation.current.y * 0.01, 0.1);
      book.rotation.x = THREE.MathUtils.lerp(book.rotation.x, touchRotation.current.x * 0.01, 0.1);
    } else {
      book.rotation.y += (targetRotation.current - book.rotation.y) * 0.05;
      touchRotation.current.x *= 0.95;
      touchRotation.current.y *= 0.95;
    }

    book.position.y = 0.6 + Math.sin(time * 0.5) * 0.04;
    book.rotation.x += Math.sin(time * 0.3) * 0.015;
    book.rotation.z = Math.cos(time * 0.4) * 0.008;

    const targetScale = hovered ? 1.12 : 1;
    book.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(time * 2.5) * 0.08;
    }
  });

  return (
    <group>
      <Float speed={0.4} rotationIntensity={0.05} floatIntensity={0.2}>
        <group
          ref={bookRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          position={[0, 0.6, 0]}
        >
          <mesh position={[0, 0, -BOOK_DEPTH/2 + COVER_THICKNESS/2]} castShadow>
            <primitive object={coverGeometry} />
            <primitive object={darkCoverMaterial} />
          </mesh>

          <mesh position={[0, 0, 0]} castShadow>
            <primitive object={pagesGeometry} />
            <primitive object={pagesMaterial} />
          </mesh>

          <mesh position={[0, 0, BOOK_DEPTH/2 - COVER_THICKNESS/2]} castShadow>
            <primitive object={coverGeometry} />
            <primitive object={coverMaterial} />
          </mesh>

          <mesh position={[-BOOK_WIDTH/2 - 0.008, 0, 0]} castShadow>
            <primitive object={spineGeometry} />
            <primitive object={spineMaterial} />
          </mesh>

          <mesh position={[BOOK_WIDTH/2 - 0.035, 0, 0]}>
            <primitive object={pagesEdgeGeometry} />
            <primitive object={pagesEdgeMaterial} />
          </mesh>

          <mesh position={[0, BOOK_HEIGHT/2 - 0.008, 0]}>
            <primitive object={goldTopGeometry} />
            <primitive object={goldMaterial} />
          </mesh>
          <mesh position={[0, -BOOK_HEIGHT/2 + 0.008, 0]}>
            <primitive object={goldTopGeometry} />
            <primitive object={goldMaterial} />
          </mesh>
        </group>
      </Float>

      <mesh ref={glowRef} position={[0, 0.04, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <primitive object={glowGeometry} />
        <primitive object={glowMaterial} />
      </mesh>
    </group>
  );
}
