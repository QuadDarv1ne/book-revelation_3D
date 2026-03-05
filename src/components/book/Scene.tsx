"use client";

import { useMemo, memo } from "react";
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

const SceneContent = memo(function SceneContent({ isRotating }: { isRotating: boolean }) {
  return (
    <>
      <Lighting />
      <Book isRotating={isRotating} />
      <Podium />
      <ParticleRing isRotating={isRotating} />
      <Sparkles count={20} scale={4} size={1.5} speed={0.1} color="#d4af37" opacity={0.25} />
      <ContactShadows position={[0, -0.78, 0]} opacity={0.4} scale={5} blur={2.5} far={3} color="#000" />
    </>
  );
});

export const Scene = memo(function Scene({ isRotating, onError }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.25, 4.0], fov: 38 }}
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
      performance={{ min: 0.5 }}
      onError={onError}
    >
      <SceneContent isRotating={isRotating} />
    </Canvas>
  );
});
