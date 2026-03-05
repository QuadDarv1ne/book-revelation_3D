import * as THREE from "three";

const CANVAS_WIDTH = 64;
const CANVAS_HEIGHT = 352;

const textureCache = new Map<string, THREE.CanvasTexture>();

export function createSpineTexture(): THREE.CanvasTexture {
  const cacheKey = `spine-${CANVAS_WIDTH}x${CANVAS_HEIGHT}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Background with gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#150c08");
  gradient.addColorStop(0.5, "#1a0f0a");
  gradient.addColorStop(1, "#150c08");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gold lines
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

  // Title on spine (rotated, simplified)
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#d4af37";
  ctx.font = 'bold 14px "Times New Roman", serif';
  ctx.textAlign = "center";
  ctx.fillText("БЛАГО?", 0, 0);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  textureCache.set(cacheKey, texture);
  return texture;
}
