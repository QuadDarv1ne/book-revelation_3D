"use client";

import { memo, useRef, useEffect, useCallback, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Sparkles, ContactShadows } from "@react-three/drei";
import { Book } from "./Book";
import { Podium } from "./Podium";
import { ParticleRingOptimized } from "./ParticleRingOptimized";
import { Lighting } from "./Lighting";
import { ThemeParticleEffect } from "./ThemeParticleEffect";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import * as THREE from "three";

interface SceneProps {
  isRotating: boolean;
  onError?: () => void;
  coverImage?: string;
  spineImage?: string;
  backCoverImage?: string;
  theme?: string;
  onKeyboardRotate?: () => void;
}

const SceneContent = memo(function SceneContent({ isRotating, coverImage, spineImage, backCoverImage, theme }: { isRotating: boolean; coverImage?: string; spineImage?: string; backCoverImage?: string; theme?: string }) {
  return (
    <>
      <Lighting theme={theme} />
      <Book isRotating={isRotating} coverImage={coverImage} spineImage={spineImage} backCoverImage={backCoverImage} />
      <Podium />
      <ParticleRingOptimized isRotating={isRotating} />
      <Sparkles count={20} scale={4} size={1.5} speed={0.1} color="#d4af37" opacity={0.25} />
      <ContactShadows position={[0, -0.78, 0]} opacity={0.4} scale={5} blur={2.5} far={3} color="#000" />
      {theme && <ThemeParticleEffect activeTheme={theme} />}
    </>
  );
});

// Компонент для обработки клавиатурных событий в Canvas
function KeyboardHandler({ onRotate, onZoomIn, onZoomOut, onReset }: {
  onRotate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  const { camera, gl } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 1.25, 4.0));

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        onRotate();
        break;
      case '+':
      case '=':
        e.preventDefault();
        onZoomIn();
        break;
      case '-':
      case '_':
        e.preventDefault();
        onZoomOut();
        break;
      case '0':
        e.preventDefault();
        onReset();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        targetPosition.current.x -= 0.5;
        break;
      case 'ArrowRight':
        e.preventDefault();
        targetPosition.current.x += 0.5;
        break;
      case 'ArrowUp':
        e.preventDefault();
        targetPosition.current.y += 0.5;
        break;
      case 'ArrowDown':
        e.preventDefault();
        targetPosition.current.y -= 0.5;
        break;
    }
  }, [onRotate, onZoomIn, onZoomOut, onReset]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.setAttribute('role', 'application');
    canvas.setAttribute('aria-label', 'Интерактивная 3D сцена. Используйте стрелки для навигации, пробел для управления вращением.');
    canvas.setAttribute('tabindex', '0');
    canvas.addEventListener('keydown', handleKeyDown);
    return () => canvas.removeEventListener('keydown', handleKeyDown);
  }, [gl.domElement, handleKeyDown]);

  useEffect(() => {
    const animate = () => {
      camera.position.lerp(targetPosition.current, 0.1);
      camera.lookAt(0, 0.6, 0);
    };
    animate();
  }, [camera]);

  return null;
}

export const Scene = memo(function Scene({
  isRotating,
  onError,
  coverImage,
  spineImage,
  backCoverImage,
  theme,
  onKeyboardRotate
}: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraZoom, setCameraZoom] = useState(1);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Если включено prefers-reduced-motion, отключаем вращение
  const effectiveIsRotating = prefersReducedMotion ? false : isRotating;

  const handleZoomIn = useCallback(() => {
    setCameraZoom(prev => Math.min(prev + 0.2, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCameraZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setCameraZoom(1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleZoomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ direction: 'in' | 'out' }>;
      if (customEvent.detail.direction === 'in') {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    };

    const handleResetEvent = () => {
      handleReset();
    };

    canvas.addEventListener('zoom-camera', handleZoomEvent as EventListener);
    canvas.addEventListener('reset-camera', handleResetEvent);

    return () => {
      canvas.removeEventListener('zoom-camera', handleZoomEvent as EventListener);
      canvas.removeEventListener('reset-camera', handleResetEvent);
    };
  }, [handleZoomIn, handleZoomOut, handleReset]);

  const fov = 38 / cameraZoom;

  return (
    <div
      className="w-full h-full"
      role="application"
      aria-label="Интерактивная 3D сцена с книгой стоической философии. Используйте стрелки для навигации, пробел для паузы/запуска вращения, плюс/минус для масштаба."
    >
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {prefersReducedMotion ? 'Анимации уменьшены для доступности' : (effectiveIsRotating ? 'Книга вращается' : 'Вращение приостановлено')}
      </div>
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 1.25, 4.0], fov }}
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false
        }}
        performance={{ min: 0.5 }}
        onError={onError}
        style={{ outline: 'none' }}
      >
        <SceneContent
          isRotating={effectiveIsRotating}
          coverImage={coverImage}
          spineImage={spineImage}
          backCoverImage={backCoverImage}
          theme={theme}
        />
        <KeyboardHandler
          onRotate={onKeyboardRotate || (() => {})}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
      </Canvas>
    </div>
  );
});
