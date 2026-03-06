import * as THREE from "three";

const textureCache = new Map<string, THREE.Texture>();

export function loadRealBookCoverTexture(imagePath: string): THREE.Texture {
  const cacheKey = `real-cover-${imagePath}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(imagePath);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

export function loadRealSpineTexture(imagePath: string): THREE.Texture {
  const cacheKey = `real-spine-${imagePath}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(imagePath);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}
