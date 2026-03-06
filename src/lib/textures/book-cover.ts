import * as THREE from "three";

const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 352;

interface CornerPosition {
  x: number;
  y: number;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

function drawCornerDecorations(ctx: CanvasRenderingContext2D, corners: CornerPosition[]): void {
  corners.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#d4af37";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#1a0f0a";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#d4af37";
    ctx.fill();
  });
}

function drawLeatherTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  for (let i = 0; i < 1500; i++) {
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 200 : 50}, ${Math.random() > 0.5 ? 150 : 0}, ${alpha})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
  }
}

function drawDecorativeLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, lineWidth: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function createBookCoverTexture(): THREE.CanvasTexture {
  const cacheKey = `cover-${CANVAS_WIDTH}x${CANVAS_HEIGHT}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Background - dark leather with gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#1a0f0a");
  gradient.addColorStop(0.5, "#2a1810");
  gradient.addColorStop(1, "#1a0f0a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawLeatherTexture(ctx, canvas.width, canvas.height);

  // Gold outer border
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Inner decorative border
  drawDecorativeLine(ctx, 38, 38, canvas.width - 38, 38, "#b8962e", 2);
  drawDecorativeLine(ctx, canvas.width - 38, 38, canvas.width - 38, canvas.height - 38, "#b8962e", 2);
  drawDecorativeLine(ctx, canvas.width - 38, canvas.height - 38, 38, canvas.height - 38, "#b8962e", 2);
  drawDecorativeLine(ctx, 38, canvas.height - 38, 38, 38, "#b8962e", 2);

  // Third inner border
  drawDecorativeLine(ctx, 50, 50, canvas.width - 50, 50, "#8b7225", 1);
  drawDecorativeLine(ctx, canvas.width - 50, 50, canvas.width - 50, canvas.height - 50, "#8b7225", 1);
  drawDecorativeLine(ctx, canvas.width - 50, canvas.height - 50, 50, canvas.height - 50, "#8b7225", 1);
  drawDecorativeLine(ctx, 50, canvas.height - 50, 50, 50, "#8b7225", 1);

  // Corner decorations
  const corners: CornerPosition[] = [
    { x: 30, y: 30 },
    { x: canvas.width - 30, y: 30 },
    { x: 30, y: canvas.height - 30 },
    { x: canvas.width - 30, y: canvas.height - 30 },
  ];
  drawCornerDecorations(ctx, corners);

  // Top decorative ornament
  ctx.beginPath();
  ctx.moveTo(100, 90);
  ctx.lineTo(canvas.width - 100, 90);
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Central ornament above title
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 90, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#d4af37";
  ctx.fill();

  // Title with shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = "#d4af37";
  ctx.font = 'bold 48px "Times New Roman", Georgia, serif';
  ctx.textAlign = "center";
  ctx.fillText("В ЧЁМ", canvas.width / 2, 175);
  ctx.fillText("НАШЕ БЛАГО?", canvas.width / 2, 240);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Decorative divider
  drawDecorativeLine(ctx, 140, 280, canvas.width - 140, 280, "#d4af37", 1.5);

  // Diamond ornament in the middle
  ctx.save();
  ctx.translate(canvas.width / 2, 280);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#d4af37";
  ctx.fillRect(-5, -5, 10, 10);
  ctx.restore();

  // Authors section
  ctx.fillStyle = "#c9a835";
  ctx.font = 'italic 30px "Times New Roman", Georgia, serif';
  ctx.fillText("Марк Аврелий", canvas.width / 2, 390);

  ctx.fillStyle = "#d4af37";
  ctx.font = 'normal 24px "Times New Roman", Georgia, serif';
  ctx.fillText("&", canvas.width / 2, 430);

  ctx.fillStyle = "#c9a835";
  ctx.font = 'italic 30px "Times New Roman", Georgia, serif';
  ctx.fillText("Эпиктет", canvas.width / 2, 475);

  // Bottom decorative element
  drawDecorativeLine(ctx, 170, canvas.height - 140, canvas.width - 170, canvas.height - 140, "#d4af37", 2);

  // Bottom ornament - laurel wreath style
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height - 90, 20, 0, Math.PI * 2);
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height - 90, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#d4af37";
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  textureCache.set(cacheKey, texture);
  return texture;
}
