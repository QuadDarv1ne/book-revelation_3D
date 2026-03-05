import * as THREE from "three";

const CANVAS_WIDTH = 128;
const CANVAS_HEIGHT = 704;

export function createSpineTexture(): THREE.CanvasTexture {
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
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(15, 45);
  ctx.lineTo(canvas.width - 15, 45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(15, canvas.height - 45);
  ctx.lineTo(canvas.width - 15, canvas.height - 45);
  ctx.stroke();

  // Title on spine (rotated)
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#d4af37";
  ctx.font = 'bold 18px "Times New Roman", serif';
  ctx.textAlign = "center";
  ctx.fillText("В ЧЁМ НАШЕ БЛАГО?", 0, 0);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
