"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { textureManager } from "@/lib/textures/texture-manager";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useBookMaterials } from "@/hooks/use-book-materials";

interface BookProps {
  isRotating: boolean;
  coverImage?: string;
  spineImage?: string;
  backCoverImage?: string;
  rotationSpeed?: number;
  color?: string;
}

const BOOK_WIDTH = 1.35;
const BOOK_HEIGHT = 1.85;
const BOOK_DEPTH = 0.22;
const COVER_THICKNESS = 0.018;
const DEFAULT_ROTATION_SPEED = 0.5;

const GEOMETRIES = {
  cover: new THREE.BoxGeometry(BOOK_WIDTH, BOOK_HEIGHT, COVER_THICKNESS),
  pages: new THREE.BoxGeometry(BOOK_WIDTH - 0.06, BOOK_HEIGHT - 0.06, BOOK_DEPTH - 0.035),
  spine: new THREE.BoxGeometry(0.035, BOOK_HEIGHT + 0.015, BOOK_DEPTH + 0.015),
  pagesEdge: new THREE.BoxGeometry(0.07, BOOK_HEIGHT - 0.08, BOOK_DEPTH - 0.04),
  goldTop: new THREE.BoxGeometry(BOOK_WIDTH - 0.08, 0.012, BOOK_DEPTH - 0.015),
  glow: new THREE.CircleGeometry(1.1, 32),
} as const;

const POSITIONS = {
  backCover: [0, 0, -BOOK_DEPTH / 2 + COVER_THICKNESS / 2],
  pages: [0, 0, 0],
  frontCover: [0, 0, BOOK_DEPTH / 2 - COVER_THICKNESS / 2],
  spine: [-BOOK_WIDTH / 2 - 0.008, 0, 0],
  pagesEdge: [BOOK_WIDTH / 2 - 0.035, 0, 0],
  goldTop: [0, BOOK_HEIGHT / 2 - 0.008, 0],
  goldBottom: [0, -BOOK_HEIGHT / 2 + 0.008, 0],
  glow: [0, 0.04, 0],
} as const;

// Создаём запасную текстуру с градиентом и золотой рамкой
function createFallbackTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 176;
  const ctx = canvas.getContext("2d")!;
  
  // Градиент
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, colorHex);
  gradient.addColorStop(0.5, adjustBrightness(colorHex, 20));
  gradient.addColorStop(1, colorHex);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Золотая рамка
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  
  // Внутренняя рамка
  ctx.strokeStyle = "#c9a961";
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  
  return texture;
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

export function Book({
  isRotating,
  coverImage = "/book-cover.jpg",
  spineImage = "/book-spine.jpg",
  backCoverImage = "/book-cover.jpg",
  rotationSpeed = DEFAULT_ROTATION_SPEED,
  color = "#1a0f0a"
}: BookProps) {
  const bookRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const prefersReducedMotion = usePrefersReducedMotion();

  const touchState = useRef({ startX: 0, startY: 0, isDragging: false });
  const touchRotation = useRef({ x: 0, y: 0 });
  const targetRotation = useRef(0);
  const lastHoveredRef = useRef(hovered);
  lastHoveredRef.current = hovered;

  const [coverTexture, setCoverTexture] = useState<THREE.Texture | null>(null);
  const [spineTexture, setSpineTexture] = useState<THREE.Texture | null>(null);
  const [backCoverTexture, setBackCoverTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loadTextures = async () => {
      try {
        const [cover, spine, back] = await Promise.all([
          textureManager.loadTexture(coverImage).catch(() => createFallbackTexture(color)),
          textureManager.loadTexture(spineImage).catch(() => createFallbackTexture(color)),
          textureManager.loadTexture(backCoverImage).catch(() => createFallbackTexture(color))
        ]);
        setCoverTexture(cover);
        setSpineTexture(spine);
        setBackCoverTexture(back);
      } catch (error) {
        console.error('Failed to load book textures:', error);
      }
    };
    loadTextures();
  }, [coverImage, spineImage, backCoverImage, color]);

  const {
    fallbackCoverMaterial,
    fallbackSpineMaterial,
    coverMaterial,
    backCoverMaterial,
    spineMaterial,
    pagesMaterial,
    pagesEdgeMaterial,
    goldMaterial,
    glowMaterial
  } = useBookMaterials({ coverTexture, backCoverTexture, spineTexture });

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

  const hoverStateRef = useRef(hovered);
  hoverStateRef.current = hovered;

  useFrame((state, delta) => {
    const book = bookRef.current;
    if (!book) return;

    const clampedDelta = Math.min(delta, 0.1);
    const time = state.clock.elapsedTime;

    if (isRotating && !touchState.current.isDragging && !prefersReducedMotion) {
      targetRotation.current += clampedDelta * rotationSpeed;
    }

    if (touchState.current.isDragging) {
      book.rotation.y = THREE.MathUtils.lerp(book.rotation.y, touchRotation.current.y * 0.01, clampedDelta * 10);
      book.rotation.x = THREE.MathUtils.lerp(book.rotation.x, touchRotation.current.x * 0.01, clampedDelta * 10);
    } else {
      book.rotation.y += (targetRotation.current - book.rotation.y) * clampedDelta * 5;
      const damping = Math.pow(0.01, clampedDelta);
      touchRotation.current.x *= damping;
      touchRotation.current.y *= damping;
    }

    if (prefersReducedMotion) {
      book.position.y = 0.6;
    } else {
      book.position.y = 0.6 + Math.sin(time * 0.5) * 0.04;
    }

    if (!prefersReducedMotion) {
      book.rotation.x += Math.sin(time * 0.3) * 0.015 * clampedDelta;
      book.rotation.z = Math.cos(time * 0.4) * 0.008;
    }

    const targetScale = hoverStateRef.current ? 1.12 : 1;
    book.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), clampedDelta * 10);

    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = prefersReducedMotion 
        ? 0.2 
        : 0.22 + Math.sin(time * 2.5) * 0.08;
    }
  });

  const bookMaterials = useMemo(() => ({
    front: coverTexture ? coverMaterial : fallbackCoverMaterial,
    back: backCoverTexture ? backCoverMaterial : fallbackCoverMaterial,
    spine: spineTexture ? spineMaterial : fallbackSpineMaterial,
    pages: pagesMaterial,
    pagesEdge: pagesEdgeMaterial,
    gold: goldMaterial,
    glow: glowMaterial,
  }), [coverTexture, backCoverTexture, spineTexture, coverMaterial, backCoverMaterial, spineMaterial, pagesMaterial, pagesEdgeMaterial, goldMaterial, glowMaterial, fallbackCoverMaterial, fallbackSpineMaterial]);

  return (
    <group>
      <Float speed={0.4} rotationIntensity={0.05} floatIntensity={0.2}>
        <group
          ref={bookRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          position={POSITIONS.frontCover}
        >
          <mesh position={POSITIONS.backCover} castShadow>
            <primitive object={GEOMETRIES.cover} attach="geometry" />
            <primitive object={bookMaterials.back} attach="material" />
          </mesh>

          <mesh position={POSITIONS.pages} castShadow>
            <primitive object={GEOMETRIES.pages} attach="geometry" />
            <primitive object={bookMaterials.pages} attach="material" />
          </mesh>

          <mesh position={POSITIONS.frontCover} castShadow>
            <primitive object={GEOMETRIES.cover} attach="geometry" />
            <primitive object={bookMaterials.front} attach="material" />
          </mesh>

          <mesh position={POSITIONS.spine} castShadow>
            <primitive object={GEOMETRIES.spine} attach="geometry" />
            <primitive object={bookMaterials.spine} attach="material" />
          </mesh>

          <mesh position={POSITIONS.pagesEdge}>
            <primitive object={GEOMETRIES.pagesEdge} attach="geometry" />
            <primitive object={bookMaterials.pagesEdge} attach="material" />
          </mesh>

          <mesh position={POSITIONS.goldTop}>
            <primitive object={GEOMETRIES.goldTop} attach="geometry" />
            <primitive object={bookMaterials.gold} attach="material" />
          </mesh>
          <mesh position={POSITIONS.goldBottom}>
            <primitive object={GEOMETRIES.goldTop} attach="geometry" />
            <primitive object={bookMaterials.gold} attach="material" />
          </mesh>
        </group>
      </Float>

      <mesh ref={glowRef} position={POSITIONS.glow} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={GEOMETRIES.glow} attach="geometry" />
        <primitive object={bookMaterials.glow} attach="material" />
      </mesh>
    </group>
  );
}
