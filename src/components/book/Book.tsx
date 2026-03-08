"use client";

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { textureManager } from "@/lib/textures/texture-manager";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface BookProps {
  isRotating: boolean;
  coverImage?: string;
  spineImage?: string;
  backCoverImage?: string;
}

const BOOK_WIDTH = 1.35;
const BOOK_HEIGHT = 1.85;
const BOOK_DEPTH = 0.22;
const COVER_THICKNESS = 0.018;
const DEFAULT_COVER = "/book-cover.jpg";
const DEFAULT_SPINE = "/book-spine.jpg";
const DEFAULT_BACK_COVER = "/book-cover.jpg";

// Выносим геометрии за пределы компонента для оптимизации
const COVER_GEOMETRY = new THREE.BoxGeometry(BOOK_WIDTH, BOOK_HEIGHT, COVER_THICKNESS);
const PAGES_GEOMETRY = new THREE.BoxGeometry(BOOK_WIDTH - 0.06, BOOK_HEIGHT - 0.06, BOOK_DEPTH - 0.035);
const SPINE_GEOMETRY = new THREE.BoxGeometry(0.035, BOOK_HEIGHT + 0.015, BOOK_DEPTH + 0.015);
const PAGES_EDGE_GEOMETRY = new THREE.BoxGeometry(0.07, BOOK_HEIGHT - 0.08, BOOK_DEPTH - 0.04);
const GOLD_TOP_GEOMETRY = new THREE.BoxGeometry(BOOK_WIDTH - 0.08, 0.012, BOOK_DEPTH - 0.015);
const GLOW_GEOMETRY = new THREE.CircleGeometry(1.1, 32);

export function Book({ isRotating, coverImage = DEFAULT_COVER, spineImage = DEFAULT_SPINE, backCoverImage = DEFAULT_BACK_COVER }: BookProps) {
  const bookRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const prefersReducedMotion = usePrefersReducedMotion();

  const touchState = useRef({ startX: 0, startY: 0, isDragging: false });
  const touchRotation = useRef({ x: 0, y: 0 });
  const targetRotation = useRef(0);

  // Текстуры хранятся в state для ленивой загрузки
  const [coverTexture, setCoverTexture] = useState<THREE.Texture | null>(null);
  const [spineTexture, setSpineTexture] = useState<THREE.Texture | null>(null);
  const [backCoverTexture, setBackCoverTexture] = useState<THREE.Texture | null>(null);

  // Ленивая загрузка текстур при смене книги
  useEffect(() => {
    // Предзагрузка всех текстур книги
    textureManager.preloadBookTextures(coverImage, spineImage, backCoverImage);
    
    // Загружаем текстуры через менеджер
    setCoverTexture(textureManager.getTexture(coverImage, 'cover'));
    setSpineTexture(textureManager.getTexture(spineImage, 'spine'));
    setBackCoverTexture(textureManager.getTexture(backCoverImage, 'back'));
  }, [coverImage, spineImage, backCoverImage]);

  // Фолбэк материалы если текстуры ещё не загружены
  const fallbackCoverMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a0f0a",
    roughness: 0.45,
    metalness: 0.15
  }), []);

  const fallbackSpineMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#150c08",
    roughness: 0.45,
    metalness: 0.15
  }), []);

  // Материалы с текстурами (обновляются при загрузке)
  const coverMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: coverTexture,
    roughness: 0.45,
    metalness: 0.15,
    color: "#ffffff"
  }), [coverTexture]);

  const backCoverMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: backCoverTexture,
    roughness: 0.45,
    metalness: 0.15,
    color: "#ffffff"
  }), [backCoverTexture]);

  const spineMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: spineTexture,
    roughness: 0.45,
    metalness: 0.15,
    color: "#ffffff"
  }), [spineTexture]);

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

  // Geometries - используем константы

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

  useFrame((state, delta) => {
    const book = bookRef.current;
    if (!book) return;

    // Ограничиваем delta time для стабильности (максимум 100ms)
    const clampedDelta = Math.min(delta, 0.1);
    const time = state.clock.elapsedTime;

    // Вращение книги (отключаем при reduced-motion)
    if (isRotating && !touchState.current.isDragging && !prefersReducedMotion) {
      targetRotation.current += clampedDelta * 0.5;
    }

    // Обработка touch вращения
    if (touchState.current.isDragging) {
      book.rotation.y = THREE.MathUtils.lerp(book.rotation.y, touchRotation.current.y * 0.01, clampedDelta * 10);
      book.rotation.x = THREE.MathUtils.lerp(book.rotation.x, touchRotation.current.x * 0.01, clampedDelta * 10);
    } else {
      // Плавное затухание вращения
      book.rotation.y += (targetRotation.current - book.rotation.y) * clampedDelta * 5;
      touchRotation.current.x *= Math.pow(0.01, clampedDelta);
      touchRotation.current.y *= Math.pow(0.01, clampedDelta);
    }

    // Парение книги (float animation) - уменьшено при reduced-motion
    if (prefersReducedMotion) {
      book.position.y = 0.6; // Статичная позиция
    } else {
      book.position.y = 0.6 + Math.sin(time * 0.5) * 0.04;
    }

    // Микро-колебания (отключаем при reduced-motion)
    if (!prefersReducedMotion) {
      book.rotation.x += Math.sin(time * 0.3) * 0.015 * clampedDelta;
      book.rotation.z = Math.cos(time * 0.4) * 0.008;
    }

    // Плавное изменение масштаба при наведении
    const targetScale = hovered ? 1.12 : 1;
    book.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), clampedDelta * 10);

    // Анимация свечения (уменьшена при reduced-motion)
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      if (prefersReducedMotion) {
        material.opacity = 0.2; // Статичная прозрачность
      } else {
        material.opacity = 0.22 + Math.sin(time * 2.5) * 0.08;
      }
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
          {/* Задняя обложка */}
          <mesh position={[0, 0, -BOOK_DEPTH/2 + COVER_THICKNESS/2]} castShadow>
            <primitive object={COVER_GEOMETRY} />
            <primitive object={backCoverTexture ? backCoverMaterial : fallbackCoverMaterial} />
          </mesh>

          {/* Страницы */}
          <mesh position={[0, 0, 0]} castShadow>
            <primitive object={PAGES_GEOMETRY} />
            <primitive object={pagesMaterial} />
          </mesh>

          {/* Передняя обложка */}
          <mesh position={[0, 0, BOOK_DEPTH/2 - COVER_THICKNESS/2]} castShadow>
            <primitive object={COVER_GEOMETRY} />
            <primitive object={coverTexture ? coverMaterial : fallbackCoverMaterial} />
          </mesh>

          <mesh position={[-BOOK_WIDTH/2 - 0.008, 0, 0]} castShadow>
            <primitive object={SPINE_GEOMETRY} />
            <primitive object={spineTexture ? spineMaterial : fallbackSpineMaterial} />
          </mesh>

          <mesh position={[BOOK_WIDTH/2 - 0.035, 0, 0]}>
            <primitive object={PAGES_EDGE_GEOMETRY} />
            <primitive object={pagesEdgeMaterial} />
          </mesh>

          <mesh position={[0, BOOK_HEIGHT/2 - 0.008, 0]}>
            <primitive object={GOLD_TOP_GEOMETRY} />
            <primitive object={goldMaterial} />
          </mesh>
          <mesh position={[0, -BOOK_HEIGHT/2 + 0.008, 0]}>
            <primitive object={GOLD_TOP_GEOMETRY} />
            <primitive object={goldMaterial} />
          </mesh>
        </group>
      </Float>

      <mesh ref={glowRef} position={[0, 0.04, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <primitive object={GLOW_GEOMETRY} />
        <primitive object={glowMaterial} />
      </mesh>
    </group>
  );
}
