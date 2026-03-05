"use client";

import { memo } from "react";

export const Lighting = memo(function Lighting() {
  return (
    <>
      {/* Main key light */}
      <spotLight
        position={[5, 8, 5]}
        angle={0.3}
        penumbra={1}
        intensity={2.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
        color="#fff8f0"
      />

      {/* Fill light */}
      <spotLight
        position={[-5, 5, -4]}
        angle={0.5}
        penumbra={1}
        intensity={1}
        color="#e8d8c8"
      />

      {/* Rim light */}
      <spotLight
        position={[0, 5, -8]}
        angle={0.35}
        penumbra={1}
        intensity={1.8}
        color="#d4af37"
      />

      {/* Ambient */}
      <ambientLight intensity={0.15} color="#c8d4e8" />
    </>
  );
});
