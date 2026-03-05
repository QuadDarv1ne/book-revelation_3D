"use client";

import { useMemo } from "react";
import { Sparkles, ContactShadows } from "@react-three/drei";
import { Book } from "./Book";
import { Podium } from "./Podium";
import { ParticleRing } from "./ParticleRing";
import { Lighting } from "./Lighting";

interface SceneProps {
  isRotating: boolean;
}

export function Scene({ isRotating }: SceneProps) {
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

  return (
    <>
      <Lighting />
      <Book isRotating={isRotating} />
      <Podium />
      <ParticleRing isRotating={isRotating} />
      <Sparkles {...sparklesProps} />
      <ContactShadows {...shadowProps} />
    </>
  );
}
