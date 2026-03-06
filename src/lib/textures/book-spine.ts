import * as THREE from "three";

const CANVAS_WIDTH = 64;
const CANVAS_HEIGHT = 352;

const textureCache = new Map<string, THREE.CanvasTexture>();

function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, lineWidth: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

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
  drawLine(ctx, 8, 22, canvas.width - 8, 22, "#d4af37", 1);
  drawLine(ctx, 8, canvas.height - 22, canvas.width - 8, canvas.height - 22, "#d4af37", 1);

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
