"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo } from "react";

interface BloomEffectProps {
  intensity?: number;
  radius?: number;
  threshold?: number;
  levels?: number;
}

const DEFAULT_INTENSITY = 0.3;
const DEFAULT_RADIUS = 0.4;
const DEFAULT_THRESHOLD = 0.85; // Только очень яркие золотые элементы
const DEFAULT_LEVELS = 3;

export function BloomEffect({
  intensity = DEFAULT_INTENSITY,
  radius = DEFAULT_RADIUS,
  threshold = DEFAULT_THRESHOLD,
  levels = DEFAULT_LEVELS,
}: BloomEffectProps) {
  const bloomSettings = useMemo(
    () => ({
      intensity,
      radius,
      threshold,
      levels,
    }),
    [intensity, radius, threshold, levels]
  );

  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        intensity={bloomSettings.intensity}
        radius={bloomSettings.radius}
        threshold={bloomSettings.threshold}
        levels={bloomSettings.levels}
      />
    </EffectComposer>
  );
}
