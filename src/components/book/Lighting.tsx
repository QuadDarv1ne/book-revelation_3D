"use client";

import { memo } from "react";

interface LightingProps {
  theme?: string;
}

export const Lighting = memo(function Lighting({ theme = "dark" }: LightingProps) {
  const isDark = theme === "dark";
  const isBlue = theme === "blue";
  const isPurple = theme === "purple";
  const isAmbient = theme === "ambient";
  const isRelax = theme === "relax";

  const ambientIntensity = isDark || isBlue || isPurple ? 0.35 : isAmbient ? 0.4 : isRelax ? 0.5 : 0.15;
  const mainLightIntensity = isDark ? 3.2 : isBlue ? 3.0 : isPurple ? 3.0 : isAmbient ? 2.5 : isRelax ? 2.8 : 2.8;
  const fillLightIntensity = isDark ? 1.4 : isBlue ? 1.3 : isPurple ? 1.3 : isAmbient ? 1.0 : 1.0;
  const rimLightIntensity = isDark ? 2.2 : isBlue ? 2.0 : isPurple ? 2.0 : isAmbient ? 1.5 : 1.8;

  const mainLightColor = isBlue ? "#e8f0ff" : isPurple ? "#f0e8ff" : isAmbient ? "#f0fff8" : isRelax ? "#fff8f0" : "#fff8f0";
  const fillLightColor = isBlue ? "#d0e0ff" : isPurple ? "#e0d0ff" : isAmbient ? "#d0ffe8" : isRelax ? "#f5e8d0" : "#e8d8c8";
  const rimLightColor = isBlue ? "#64b5ff" : isPurple ? "#c084fc" : isAmbient ? "#6ee7b7" : isRelax ? "#d4af37" : "#d4af37";
  const ambientColor = isBlue ? "#c8d4e8" : isPurple ? "#d4c8e8" : isAmbient ? "#c8e8d8" : isRelax ? "#e8dcc8" : "#c8d4e8";

  return (
    <>
      {/* Main key light */}
      <spotLight
        position={[5, 8, 5]}
        angle={0.3}
        penumbra={1}
        intensity={mainLightIntensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
        color={mainLightColor}
      />

      {/* Fill light */}
      <spotLight
        position={[-5, 5, -4]}
        angle={0.5}
        penumbra={1}
        intensity={fillLightIntensity}
        color={fillLightColor}
      />

      {/* Rim light */}
      <spotLight
        position={[0, 5, -8]}
        angle={0.35}
        penumbra={1}
        intensity={rimLightIntensity}
        color={rimLightColor}
      />

      {/* Ambient */}
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
    </>
  );
});
