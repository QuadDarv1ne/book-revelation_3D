const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const src = path.join(__dirname, '..', 'assets', 'book-covers', 'mark-avreliy-naedine-s-soboy-v-chem-nashe-blago.jpg');
const dest = path.join(__dirname, '..', 'public', 'book-spine.jpg');

function createSpineFromCover(coverPath, spinePath) {
  const img = new Image();
  img.src = coverPath;
  
  const spineWidth = 128;
  const spineHeight = img.height * (spineWidth / img.width);
  
  const canvas = createCanvas(spineWidth, spineHeight);
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(img, 0, 0, spineWidth, spineHeight);
  
  const buffer = canvas.toBuffer('image/jpeg', 0.85);
  fs.writeFileSync(spinePath, buffer);
  
  return { width: spineWidth, height: spineHeight };
}

try {
  const stats = fs.statSync(src);
  console.log(`Source cover: ${(stats.size / 1024).toFixed(1)} KB`);
  
  const dimensions = createSpineFromCover(src, dest);
  const spineStats = fs.statSync(dest);
  
  console.log(`✓ Created spine: ${dimensions.width}x${dimensions.height}`);
  console.log(`✓ Spine size: ${(spineStats.size / 1024).toFixed(1)} KB`);
  console.log(`✓ Saved to: ${dest}`);
} catch (error) {
  console.error('✗ Error:', error.message);
  console.log('\nInstall canvas: npm install canvas');
}
