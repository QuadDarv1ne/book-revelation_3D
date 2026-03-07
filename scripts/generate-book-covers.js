/**
 * Скрипт для генерации плейсхолдеров обложек книг
 * Запуск: bun run scripts/generate-book-covers.js
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const coversDir = path.join(publicDir, 'book-covers');
const spinesDir = path.join(publicDir, 'book-spines');

// Создаем директории если не существуют
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}
if (!fs.existsSync(spinesDir)) {
  fs.mkdirSync(spinesDir, { recursive: true });
}

// Данные книг
const books = [
  {
    id: 'hawking-theory-of-everything',
    title: 'Theory of Everything',
    author: 'Stephen Hawking',
    color: '#1e3a8a', // синий
  },
  {
    id: 'sun-tzu-art-of-war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    color: '#991b1b', // красный
  },
  {
    id: 'marcus-aurelius-meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    color: '#78350f', // коричневый/золотой
  },
  {
    id: 'epictetus-our-good',
    title: 'On Our Good',
    author: 'Epictetus',
    color: '#065f46', // изумрудный
  },
  {
    id: 'christensen-innovators-solution',
    title: 'The Innovator\'s Solution',
    author: 'Clayton Christensen',
    color: '#5b21b6', // фиолетовый
  },
];

// Генерация SVG обложки
function generateCoverSVG(book) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${book.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${book.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${book.color}dd;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Фон -->
  <rect width="400" height="600" fill="url(#grad-${book.id})"/>
  
  <!-- Декоративная рамка -->
  <rect x="20" y="20" width="360" height="560" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  
  <!-- Название книги -->
  <text x="200" y="200" text-anchor="middle" fill="white" font-family="Georgia, serif" font-size="32" font-weight="bold" filter="url(#shadow)">
    ${book.title.split(' ').slice(0, 3).join(' ')}
  </text>
  ${book.title.split(' ').length > 3 ? `
  <text x="200" y="240" text-anchor="middle" fill="white" font-family="Georgia, serif" font-size="28" filter="url(#shadow)">
    ${book.title.split(' ').slice(3).join(' ')}
  </text>
  ` : ''}
  
  <!-- Автор -->
  <text x="200" y="320" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Georgia, serif" font-size="20" font-style="italic">
    ${book.author}
  </text>
  
  <!-- Декоративная линия -->
  <line x1="100" y1="380" x2="300" y2="380" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
  
  <!-- Нижняя надпись -->
  <text x="200" y="550" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Georgia, serif" font-size="14">
    Book Revelation 3D
  </text>
</svg>`;
}

// Генерация SVG корешка
function generateSpineSVG(book) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="60" height="600" viewBox="0 0 60 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spine-grad-${book.id}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${book.color};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${book.color}ee;stop-opacity:1" />
      <stop offset="100%" style="stop-color:${book.color};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Фон -->
  <rect width="60" height="600" fill="url(#spine-grad-${book.id})"/>
  
  <!-- Вертикальный текст названия -->
  <text x="30" y="350" text-anchor="middle" fill="white" font-family="Georgia, serif" font-size="16" font-weight="bold" transform="rotate(-90 30 350)">
    ${book.title.split(' ')[0]}
  </text>
  
  <!-- Автор внизу -->
  <text x="30" y="550" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Georgia, serif" font-size="12" transform="rotate(-90 30 550)">
    ${book.author.split(' ').pop()}
  </text>
</svg>`;
}

// Генерация файлов
console.log('Генерация обложек книг...\n');

books.forEach(book => {
  const coverPath = path.join(coversDir, `${book.id}.jpg`);
  const spinePath = path.join(spinesDir, `${book.id}.jpg`);
  
  const coverSVG = generateCoverSVG(book);
  const spineSVG = generateSpineSVG(book);
  
  // Сохраняем SVG (можно конвертировать в JPG позже)
  fs.writeFileSync(coverPath.replace('.jpg', '.svg'), coverSVG);
  fs.writeFileSync(spinePath.replace('.jpg', '.svg'), spineSVG);
  
  console.log(`✓ ${book.title} — ${book.author}`);
});

console.log('\nГотово! SVG файлы созданы в public/book-covers/ и public/book-spines/');
console.log('Для использования в проекте можно оставить SVG или конвертировать в JPG/PNG.');
