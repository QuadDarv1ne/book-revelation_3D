import * as THREE from "three";

const textureCache = new Map<string, THREE.Texture>();
const loadingCache = new Map<string, boolean>();

export function loadRealBookCoverTexture(imagePath: string): THREE.Texture {
  const cacheKey = `real-cover-${imagePath}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const loading = loadingCache.get(cacheKey);
  if (loading) {
    const placeholder = createPlaceholderTexture();
    textureCache.set(cacheKey, placeholder);
    return placeholder;
  }

  loadingCache.set(cacheKey, true);

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    imagePath,
    (loadedTexture) => {
      loadedTexture.anisotropy = 8;
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      textureCache.set(cacheKey, loadedTexture);
    },
    undefined,
    () => {
      const placeholder = createPlaceholderTexture();
      textureCache.set(cacheKey, placeholder);
    }
  );

  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

export function loadRealSpineTexture(imagePath: string): THREE.Texture {
  const cacheKey = `real-spine-${imagePath}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const loading = loadingCache.get(cacheKey);
  if (loading) {
    const placeholder = createPlaceholderSpineTexture();
    textureCache.set(cacheKey, placeholder);
    return placeholder;
  }

  loadingCache.set(cacheKey, true);

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    imagePath,
    (loadedTexture) => {
      loadedTexture.anisotropy = 8;
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      textureCache.set(cacheKey, loadedTexture);
    },
    undefined,
    () => {
      const placeholder = createPlaceholderSpineTexture();
      textureCache.set(cacheKey, placeholder);
    }
  );

  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

function createPlaceholderTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 352;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#1a0f0a");
  gradient.addColorStop(0.5, "#2a1810");
  gradient.addColorStop(1, "#1a0f0a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 32px serif";
  ctx.textAlign = "center";
  ctx.fillText("STOIC", canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillText("BOOK", canvas.width / 2, canvas.height / 2 + 20);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createPlaceholderSpineTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 352;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#150c08");
  gradient.addColorStop(0.5, "#1a0f0a");
  gradient.addColorStop(1, "#150c08");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(8, 22);
  ctx.lineTo(canvas.width - 8, 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, canvas.height - 22);
  ctx.lineTo(canvas.width - 8, canvas.height - 22);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
