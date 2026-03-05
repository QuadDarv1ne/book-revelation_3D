import * as THREE from "three";

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 704;

interface CornerPosition {
  x: number;
  y: number;
}

export function createBookCoverTexture(): THREE.CanvasTexture {
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

  // Add subtle leather texture (optimized: reduced from 8000 to 3000 particles)
  for (let i = 0; i < 3000; i++) {
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 200 : 50}, ${Math.random() > 0.5 ? 150 : 0}, ${alpha})`;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
  }

  // Gold outer border
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Inner decorative border
  ctx.strokeStyle = "#b8962e";
  ctx.lineWidth = 2;
  ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);

  // Third inner border
  ctx.strokeStyle = "#8b7225";
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

  // Corner decorations
  const corners: CornerPosition[] = [
    { x: 30, y: 30 },
    { x: canvas.width - 30, y: 30 },
    { x: 30, y: canvas.height - 30 },
    { x: canvas.width - 30, y: canvas.height - 30 },
  ];
  corners.forEach(({ x, y }) => {
    // Outer circle
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#d4af37";
    ctx.fill();
    // Inner circle
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#1a0f0a";
    ctx.fill();
    // Center dot
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#d4af37";
    ctx.fill();
  });

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
  ctx.beginPath();
  ctx.moveTo(140, 280);
  ctx.lineTo(canvas.width - 140, 280);
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 1.5;
  ctx.stroke();

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
  ctx.beginPath();
  ctx.moveTo(170, canvas.height - 140);
  ctx.lineTo(canvas.width - 170, canvas.height - 140);
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2;
  ctx.stroke();

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
  texture.anisotropy = 16;
  return texture;
}
