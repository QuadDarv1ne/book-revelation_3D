"use client";

import { useMemo, useEffect } from "react";
import * as THREE from "three";

interface BookMaterials {
  fallbackCoverMaterial: THREE.MeshStandardMaterial;
  fallbackSpineMaterial: THREE.MeshStandardMaterial;
  coverMaterial: THREE.MeshStandardMaterial;
  backCoverMaterial: THREE.MeshStandardMaterial;
  spineMaterial: THREE.MeshStandardMaterial;
  pagesMaterial: THREE.MeshStandardMaterial;
  pagesEdgeMaterial: THREE.MeshStandardMaterial;
  goldMaterial: THREE.MeshStandardMaterial;
  glowMaterial: THREE.MeshBasicMaterial;
}

interface BookMaterialsOptions {
  coverTexture: THREE.Texture | null;
  backCoverTexture: THREE.Texture | null;
  spineTexture: THREE.Texture | null;
}

export function useBookMaterials({ coverTexture, backCoverTexture, spineTexture }: BookMaterialsOptions): BookMaterials {
  const materials = useMemo(() => {
    const fallbackCoverMaterial = new THREE.MeshStandardMaterial({
      color: "#1a0f0a",
      roughness: 0.45,
      metalness: 0.15
    });

    const fallbackSpineMaterial = new THREE.MeshStandardMaterial({
      color: "#150c08",
      roughness: 0.45,
      metalness: 0.15
    });

    const coverMaterial = new THREE.MeshStandardMaterial({
      map: coverTexture,
      roughness: 0.45,
      metalness: 0.15,
      color: "#ffffff"
    });

    const backCoverMaterial = new THREE.MeshStandardMaterial({
      map: backCoverTexture,
      roughness: 0.45,
      metalness: 0.15,
      color: "#ffffff"
    });

    const spineMaterial = new THREE.MeshStandardMaterial({
      map: spineTexture,
      roughness: 0.45,
      metalness: 0.15,
      color: "#ffffff"
    });

    const pagesMaterial = new THREE.MeshStandardMaterial({
      color: "#f8f4eb",
      roughness: 0.95,
      metalness: 0
    });

    const pagesEdgeMaterial = new THREE.MeshStandardMaterial({
      color: "#f5f0e6",
      roughness: 0.9,
      metalness: 0
    });

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: "#d4af37",
      roughness: 0.25,
      metalness: 0.85,
      emissive: "#d4af37",
      emissiveIntensity: 0.1
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: "#d4af37",
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });

    return {
      fallbackCoverMaterial,
      fallbackSpineMaterial,
      coverMaterial,
      backCoverMaterial,
      spineMaterial,
      pagesMaterial,
      pagesEdgeMaterial,
      goldMaterial,
      glowMaterial
    };
  }, [coverTexture, backCoverTexture, spineTexture]);

  useEffect(() => {
    return () => {
      materials.fallbackCoverMaterial.dispose();
      materials.fallbackSpineMaterial.dispose();
      materials.coverMaterial.dispose();
      materials.backCoverMaterial.dispose();
      materials.spineMaterial.dispose();
      materials.pagesMaterial.dispose();
      materials.pagesEdgeMaterial.dispose();
      materials.goldMaterial.dispose();
      materials.glowMaterial.dispose();
    };
  }, [materials]);

  return materials;
}
