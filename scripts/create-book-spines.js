const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BOOK_SPINES_DIR = path.join(__dirname, '..', 'public', 'book-spines');
const BOOK_COVERS_DIR = path.join(__dirname, '..', 'public', 'book-covers');

// Книги и их цвета для градиента корешка
const BOOKS = [
  { id: 'marcus-aurelius-meditations', color1: '#d4af37', color2: '#8b7355' },
  { id: 'epictetus-our-good', color1: '#c9a961', color2: '#7d6b4f' },
  { id: 'seneca-letters', color1: '#b89f5e', color2: '#6b5f4a' },
  { id: 'sun-tzu-art-of-war', color1: '#a67c52', color2: '#5c4a3a' },
  { id: 'hawking-theory-of-everything', color1: '#8b7355', color2: '#4a3f35' },
  { id: 'christensen-innovators-solution', color1: '#9a7b4f', color2: '#5a4a3a' }
];

const AUTHORS = {
  'marcus-aurelius-meditations': 'Марк Аврелий',
  'epictetus-our-good': 'Эпиктет',
  'seneca-letters': 'Сенека',
  'sun-tzu-art-of-war': 'Сунь-цзы',
  'hawking-theory-of-everything': 'Хокинг',
  'christensen-innovators-solution': 'Кристенсен'
};

async function createSpine(book) {
  const spinePath = path.join(BOOK_SPINES_DIR, `${book.id}.webp`);
  
  // Если уже есть webp - пропускаем
  if (fs.existsSync(spinePath)) {
    console.log(`✓ Уже есть: ${book.id}.webp`);
    return;
  }

  // Пробуем создать из обложки
  const coverPath = path.join(BOOK_COVERS_DIR, `${book.id}.webp`);
  if (fs.existsSync(coverPath)) {
    try {
      await sharp(coverPath)
        .resize(80, 600, { fit: 'fill' })
        .webp({ quality: 85 })
        .toFile(spinePath);
      console.log(`✓ Создан из обложки: ${book.id}.webp`);
      return;
    } catch (err) {
      console.log(`⚠ Ошибка при создании из обложки: ${book.id}`);
    }
  }

  // Fallback: генерируем SVG градиент
  const author = AUTHORS[book.id] || 'Автор';
  const shortAuthor = author.length > 12 ? author.substring(0, 10) + '.' : author;
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="80" height="600" viewBox="0 0 80 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spine-${book.id}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${book.color2};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${book.color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${book.color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="80" height="600" fill="url(#spine-${book.id})"/>
  <text x="40" y="300" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle" transform="rotate(-90 40 300)">${shortAuthor}</text>
</svg>`;

  const svgPath = path.join(BOOK_SPINES_DIR, `${book.id}.svg`);
  fs.writeFileSync(svgPath, svg, 'utf8');
  
  // Конвертируем SVG в WebP
  await sharp(Buffer.from(svg))
    .resize(80, 600)
    .webp({ quality: 85 })
    .toFile(spinePath);
  
  console.log(`✓ Сгенерирован SVG→WebP: ${book.id}.webp`);
}

async function createBackCovers() {
  const books = ['seneca-letters', 'marcus-aurelius-meditations', 'epictetus-our-good'];
  
  for (const bookId of books) {
    const backPath = path.join(BOOK_COVERS_DIR, `${bookId}-back.webp`);
    const coverPath = path.join(BOOK_COVERS_DIR, `${bookId}.webp`);
    
    if (fs.existsSync(backPath)) {
      console.log(`✓ Уже есть: ${bookId}-back.webp`);
      continue;
    }
    
    if (fs.existsSync(coverPath)) {
      fs.copyFileSync(coverPath, backPath);
      console.log(`✓ Скопировано: ${bookId}-back.webp`);
    }
  }
}

async function main() {
  console.log('📚 Создание корешков и задних обложек...\n');
  
  if (!fs.existsSync(BOOK_SPINES_DIR)) {
    fs.mkdirSync(BOOK_SPINES_DIR, { recursive: true });
  }
  
  for (const book of BOOKS) {
    await createSpine(book);
  }
  
  await createBackCovers();
  
  console.log('\n✅ Готово!');
}

main().catch(console.error);
