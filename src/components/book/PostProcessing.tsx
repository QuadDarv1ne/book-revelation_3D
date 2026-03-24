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

function SMAAEffect({ preset }: { preset: string }) {
  return <SMAA preset={preset as "high"} />;
}

function SSAOEffect({ radius, intensity, bias }: { radius: number; intensity: number; bias: number }) {
  return <SSAO radius={radius} intensity={intensity} bias={bias} />;
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
      <SMAAEffect preset={enableSMAA ? "high" : "off"} />
      <Bloom
        intensity={bloomSettings.intensity}
        radius={bloomSettings.radius}
        threshold={bloomSettings.threshold}
        levels={bloomSettings.levels}
      />
      <SSAOEffect radius={SSAO_SETTINGS.radius} intensity={SSAO_SETTINGS.intensity} bias={SSAO_SETTINGS.bias} />
    </EffectComposer>
  );
}
