/**
 * Скрипт для обработки изображений книг
 * - Извлечение корешка и задней обложки из разворота
 * - Конвертация в PNG (без потерь качества)
 * - Оптимизация размеров
 * 
 * Формат: PNG для лучшего качества
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '..', 'assets', 'book-covers');
const publicCoversDir = path.join(__dirname, '..', 'public', 'book-covers');
const publicSpinesDir = path.join(__dirname, '..', 'public', 'book-spines');

// Создаем директории
[publicCoversDir, publicSpinesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Конфигурация книг
const booksConfig = [
  {
    id: 'hawking-theory-of-everything',
    prefix: 'стивен хоккинг - теория всего',
    spreadPrefix: 'стивен хоккинг - теория всего - разворот', // Специальное имя для разворота
    crop: {
      front: { left: 0, top: 0, width: 400, height: 600 },
      spine: { left: 400, top: 0, width: 60, height: 600 },
      back: { left: 460, top: 0, width: 400, height: 600 }
    }
  },
  {
    id: 'sun-tzu-art-of-war',
    prefix: 'сунь-цзы искусство войны',
    spreadPrefix: 'сунь-цзы искусство войны разворот',
    crop: {
      front: { left: 0, top: 0, width: 400, height: 600 },
      spine: { left: 400, top: 0, width: 60, height: 600 },
      back: { left: 460, top: 0, width: 400, height: 600 }
    }
  },
  {
    id: 'marcus-aurelius-meditations',
    prefix: 'марк аврелий - наедине с собой',
    spreadPrefix: 'марк аврелий - наедине с собой разворот',
    crop: {
      front: { left: 0, top: 0, width: 400, height: 600 },
      spine: { left: 400, top: 0, width: 60, height: 600 },
      back: { left: 460, top: 0, width: 400, height: 600 }
    }
  },
  {
    id: 'epictetus-our-good',
    prefix: 'эпиктет - в чём наше благо',
    spreadPrefix: 'эпиктет - в чём наше благо разворот',
    crop: {
      front: { left: 0, top: 0, width: 400, height: 600 },
      spine: { left: 400, top: 0, width: 60, height: 600 },
      back: { left: 460, top: 0, width: 400, height: 600 }
    }
  },
  {
    id: 'christensen-innovators-solution',
    prefix: 'закон успешных инноваций',
    spreadPrefix: 'закон успешных инноваций разворот',
    crop: {
      front: { left: 0, top: 0, width: 400, height: 600 },
      spine: { left: 400, top: 0, width: 60, height: 600 },
      back: { left: 460, top: 0, width: 400, height: 600 }
    }
  }
];

/**
 * Обработка разворота книги
 */
async function processBookSpread(bookConfig) {
  const spreadFile = path.join(assetsDir, `${bookConfig.spreadPrefix}.webp`);
  const coverFile = path.join(assetsDir, `${bookConfig.prefix}.webp`);
  
  console.log(`\n📚 Обработка: ${bookConfig.id}`);
  
  if (!fs.existsSync(spreadFile)) {
    console.log(`  ⚠️  Разворот не найден: ${spreadFile}`);
    return;
  }
  
  try {
    const metadata = await sharp(spreadFile).metadata();
    console.log(`  📐 Размер разворота: ${metadata.width}x${metadata.height}px`);
    
    // Адаптируем параметры crop под реальный размер изображения
    const scaleX = metadata.width / 860; // 860 = 400 + 60 + 400 (базовая ширина)
    const scaleY = metadata.height / 600;
    
    const crop = {
      front: {
        left: Math.round(bookConfig.crop.front.left * scaleX),
        top: Math.round(bookConfig.crop.front.top * scaleY),
        width: Math.round(bookConfig.crop.front.width * scaleX),
        height: Math.round(bookConfig.crop.front.height * scaleY)
      },
      spine: {
        left: Math.round(bookConfig.crop.spine.left * scaleX),
        top: Math.round(bookConfig.crop.spine.top * scaleY),
        width: Math.round(bookConfig.crop.spine.width * scaleX),
        height: Math.round(bookConfig.crop.spine.height * scaleY)
      },
      back: {
        left: Math.round(bookConfig.crop.back.left * scaleX),
        top: Math.round(bookConfig.crop.back.top * scaleY),
        width: Math.round(bookConfig.crop.back.width * scaleX),
        height: Math.round(bookConfig.crop.back.height * scaleY)
      }
    };
    
    console.log(`  📐 Параметры нарезки: front=${crop.front.width}x${crop.front.height}, spine=${crop.spine.width}x${crop.spine.height}, back=${crop.back.width}x${crop.back.height}`);
    
    // Извлекаем переднюю обложку (PNG, высокое качество)
    await sharp(spreadFile)
      .extract(crop.front)
      .resize(400, 600)
      .png({ quality: 100, compressionLevel: 6 })
      .toFile(path.join(publicCoversDir, `${bookConfig.id}.png`));
    console.log(`  ✅ Передняя обложка: ${bookConfig.id}.png`);
    
    // Извлекаем корешок (PNG)
    await sharp(spreadFile)
      .extract(crop.spine)
      .resize(60, 600)
      .png({ quality: 100, compressionLevel: 6 })
      .toFile(path.join(publicSpinesDir, `${bookConfig.id}.png`));
    console.log(`  ✅ Корешок: ${bookConfig.id}.png`);
    
    // Извлекаем заднюю обложку (PNG)
    await sharp(spreadFile)
      .extract(crop.back)
      .resize(400, 600)
      .png({ quality: 100, compressionLevel: 6 })
      .toFile(path.join(publicCoversDir, `${bookConfig.id}-back.png`));
    console.log(`  ✅ Задняя обложка: ${bookConfig.id}-back.png`);
    
  } catch (error) {
    console.error(`  ❌ Ошибка обработки: ${error.message}`);
  }
}

/**
 * Удаление фона с изображения (создание прозрачного фона)
 */
async function removeBackground(inputFile, outputFile) {
  try {
    await sharp(inputFile)
      .ensureAlpha()
      .modulate({
        brightness: 1.1,
        saturation: 1.2
      })
      .webp({ quality: 95 })
      .toFile(outputFile);
    console.log(`  ✅ Обработан фон: ${outputFile}`);
  } catch (error) {
    console.error(`  ❌ Ошибка фона: ${error.message}`);
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log('🖼️  Обработка изображений книг...\n');
  
  // Проверяем наличие sharp
  try {
    require.resolve('sharp');
  } catch {
    console.error('❌ Sharp не установлен! Выполните: bun add sharp');
    process.exit(1);
  }
  
  // Обрабатываем каждую книгу
  for (const book of booksConfig) {
    await processBookSpread(book);
  }
  
  console.log('\n✅ Готово!');
  console.log('\n📁 Файлы сохранены в:');
  console.log(`   - ${publicCoversDir}`);
  console.log(`   - ${publicSpinesDir}`);
  
  console.log('\n📝 Обновите books.ts с новыми путями:');
  console.log('   coverImage: "/book-covers/{id}.webp"');
  console.log('   spineImage: "/book-spines/{id}.webp"');
  console.log('   backCoverImage: "/book-covers/{id}-back.webp"');
}

main().catch(console.error);
