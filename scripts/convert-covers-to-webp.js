const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SHARP_AVAILABLE = true;

async function convertToWebp() {
  console.log('🔄 Конвертация обложек в WebP...\n');

  const bookSpinesDir = path.join(__dirname, '..', 'public', 'book-spines');
  const bookCoversDir = path.join(__dirname, '..', 'public', 'book-covers');

  // Создаём book-spines если нет
  if (!fs.existsSync(bookSpinesDir)) {
    fs.mkdirSync(bookSpinesDir, { recursive: true });
  }

  const coversToConvert = [
    { from: path.join(bookCoversDir, 'marcus-aurelius-meditations.webp'), to: path.join(bookSpinesDir, 'marcus-aurelius-meditations.webp') },
    { from: path.join(bookCoversDir, 'epictetus-our-good.webp'), to: path.join(bookSpinesDir, 'epictetus-our-good.webp') },
    { from: path.join(bookCoversDir, 'sun-tzu-art-of-war.webp'), to: path.join(bookSpinesDir, 'sun-tzu-art-of-war.webp') },
    { from: path.join(bookCoversDir, 'hawking-theory-of-everything.webp'), to: path.join(bookSpinesDir, 'hawking-theory-of-everything.webp') },
  ];

  // Копируем существующие webp
  for (const { from, to } of coversToConvert) {
    if (fs.existsSync(from) && !fs.existsSync(to)) {
      fs.copyFileSync(from, to);
      console.log(`✓ Скопировано: ${path.basename(to)}`);
    }
  }

  // Конвертируем jpg в webp через sharp если есть
  const jpgToConvert = [
    { from: path.join(bookCoversDir, 'seneca-letters.jpg'), to: path.join(bookSpinesDir, 'seneca-letters.webp') },
    { from: path.join(bookCoversDir, 'seneca-letters-back.jpg'), to: path.join(bookCoversDir, 'seneca-letters-back.webp') },
    { from: path.join(bookCoversDir, 'marcus-aurelius-meditations-back.jpg'), to: path.join(bookCoversDir, 'marcus-aurelius-meditations-back.webp') },
    { from: path.join(bookCoversDir, 'epictetus-our-good-back.jpg'), to: path.join(bookCoversDir, 'epictetus-our-good-back.webp') },
  ];

  try {
    const sharp = require('sharp');
    
    for (const { from, to } of jpgToConvert) {
      if (fs.existsSync(from) && !fs.existsSync(to)) {
        await sharp(from).webp({ quality: 85 }).toFile(to);
        console.log(`✓ Конвертировано: ${path.basename(to)}`);
      }
    }
  } catch (err) {
    console.log('⚠ Sharp не доступен, копируем jpg как есть');
    // Копируем jpg как fallback
    for (const { from, to } of jpgToConvert) {
      if (fs.existsSync(from) && !fs.existsSync(to)) {
        fs.copyFileSync(from, to.replace('.webp', '.jpg'));
        console.log(`✓ Скопировано (jpg): ${path.basename(from)}`);
      }
    }
  }

  console.log('\n✅ Готово!');
  console.log(`📁 Обложки: ${bookCoversDir}`);
  console.log(`📁 Корешки: ${bookSpinesDir}`);
}

convertToWebp().catch(console.error);
