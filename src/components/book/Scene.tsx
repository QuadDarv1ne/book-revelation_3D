"use client";

import { Sparkles, ContactShadows } from "@react-three/drei";
import { Book } from "./Book";
import { Podium } from "./Podium";
import { ParticleRing } from "./ParticleRing";
import { Lighting } from "./Lighting";

interface SceneProps {
  isRotating: boolean;
}

export function Scene({ isRotating }: SceneProps) {
  return (
    <>
      <Lighting />
      <Book isRotating={isRotating} />
      <Podium />
      <ParticleRing isRotating={isRotating} />
      <Sparkles count={25} scale={5} size={2} speed={0.12} color="#d4af37" opacity={0.3} />
      <ContactShadows position={[0, -0.78, 0]} opacity={0.5} scale={6} blur={3} far={4} color="#000" />
    </>
  );
}
