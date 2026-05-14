"use client";

import { EffectComposer, Bloom, SMAA, SSAO } from "@react-three/postprocessing";
import { useMemo } from "react";

interface PostProcessingProps {
  bloomIntensity?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  bloomLevels?: number;
  _enableSSAO?: boolean;
  enableSMAA?: boolean;
}

const DEFAULT_BLOOM = {
  intensity: 0.35,
  radius: 0.5,
  threshold: 0.8,
  levels: 3,
};

const SSAO_SETTINGS = {
  radius: 0.5,
  intensity: 0.4,
  bias: 0.02,
  blur: 0.4,
};

export function PostProcessing({
  bloomIntensity = DEFAULT_BLOOM.intensity,
  bloomRadius = DEFAULT_BLOOM.radius,
  bloomThreshold = DEFAULT_BLOOM.threshold,
  bloomLevels = DEFAULT_BLOOM.levels,
  _enableSSAO = true,
  enableSMAA = true,
}: PostProcessingProps) {
  const bloomSettings = useMemo(
    () => ({
      intensity: bloomIntensity,
      radius: bloomRadius,
      threshold: bloomThreshold,
      levels: bloomLevels,
    }),
    [bloomIntensity, bloomRadius, bloomThreshold, bloomLevels]
  );

  return (
    <EffectComposer enableNormalPass={true}>
      {enableSMAA && <SMAA preset="high" />}
      <Bloom
        intensity={bloomSettings.intensity}
        radius={bloomSettings.radius}
        threshold={bloomSettings.threshold}
        levels={bloomSettings.levels}
      />
      {_enableSSAO && (
        <SSAO radius={SSAO_SETTINGS.radius} intensity={SSAO_SETTINGS.intensity} bias={SSAO_SETTINGS.bias} />
      )}
    </EffectComposer>
  );
}
