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
      <Sparkles
        count={35}
        scale={6}
        size={2.2}
        speed={0.15}
        color="#d4af37"
        opacity={0.35}
      />
      <ContactShadows
        position={[0, -0.78, 0]}
        opacity={0.55}
        scale={6}
        blur={3.5}
        far={4}
        color="#000"
      />
    </>
  );
}
