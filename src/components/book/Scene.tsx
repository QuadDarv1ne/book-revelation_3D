"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles, ContactShadows } from "@react-three/drei";
import { Book } from "./Book";
import { Podium } from "./Podium";
import { ParticleRing } from "./ParticleRing";
import { Lighting } from "./Lighting";

interface SceneProps {
  isRotating: boolean;
  onError?: () => void;
}

export function Scene({ isRotating, onError }: SceneProps) {
  const sparklesProps = useMemo(() => ({
    count: 20,
    scale: 4,
    size: 1.5,
    speed: 0.1,
    color: "#d4af37",
    opacity: 0.25,
  }), []);

  const shadowProps = useMemo(() => ({
    position: [0, -0.78, 0] as [number, number, number],
    opacity: 0.4,
    scale: 5,
    blur: 2.5,
    far: 3,
    color: "#000",
  }), []);

  const canvasConfig = useMemo(() => ({
    camera: { position: [0, 1.25, 4.0] as [number, number, number], fov: 38 },
    dpr: [1, 1.5] as [number, number],
    gl: { antialias: true, alpha: true, powerPreference: "high-performance" as const, preserveDrawingBuffer: false },
    performance: { min: 0.5 },
  }), []);

  return (
    <Canvas
      {...canvasConfig}
      shadows
      onError={onError}
    >
      <Lighting />
      <Book isRotating={isRotating} />
      <Podium />
      <ParticleRing isRotating={isRotating} />
      <Sparkles {...sparklesProps} />
      <ContactShadows {...shadowProps} />
    </Canvas>
  );
}
