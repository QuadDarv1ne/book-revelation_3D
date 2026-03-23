#!/usr/bin/env node

/**
 * Конвертация оставшихся PNG/JPG в WebP
 * Экономия: ~300-400KB
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const COVERS_DIR = path.join(__dirname, '..', 'public', 'book-covers');

const filesToConvert = [
  'sun-tzu-art-of-war.png',
  'sun-tzu-art-of-war-back.png',
  'hawking-theory-of-everything.png',
  'hawking-theory-of-everything-back.png',
  'epictetus-our-good-back.jpg',
  'marcus-aurelius-meditations-back.jpg',
  'seneca-letters-back.jpg',
  'sun-tzu-art-of-war-back.jpg',
];

async function convertToWebP(filename) {
  const inputPath = path.join(COVERS_DIR, filename);
  const outputPath = inputPath.replace(/\.(png|jpg)$/, '.webp');

  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Пропущен: ${filename} (не найден)`);
    return;
  }

  if (fs.existsSync(outputPath)) {
    console.log(`✓ Уже существует: ${path.basename(outputPath)}`);
    return;
  }

  try {
    const info = await sharp(inputPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(outputPath);

    const originalSize = fs.statSync(inputPath).size;
    const newSize = info.size;
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(`✓ ${filename} → ${path.basename(outputPath)}`);
    console.log(`  ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (экономия ${savings}%)`);
  } catch (error) {
    console.error(`✗ Ошибка при конвертации ${filename}:`, error.message);
  }
}

async function main() {
  console.log('🖼️  Конвертация изображений в WebP...\n');

  for (const file of filesToConvert) {
    await convertToWebP(file);
  }

  console.log('\n✅ Готово!');
  console.log('\n📝 Следующий шаг: обновите пути в src/data/books.ts');
}

main().catch(console.error);
