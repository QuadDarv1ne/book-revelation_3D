/**
 * Скрипт для копирования обложек книг из assets/ в public/
 * Поддерживает русские названия файлов
 * 
 * Использование: node scripts/setup-book-covers.js
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets', 'book-covers');
const publicCoversDir = path.join(__dirname, '..', 'public', 'book-covers');
const publicSpinesDir = path.join(__dirname, '..', 'public', 'book-spines');

// Создаем директории если не существуют
if (!fs.existsSync(publicCoversDir)) {
  fs.mkdirSync(publicCoversDir, { recursive: true });
}
if (!fs.existsSync(publicSpinesDir)) {
  fs.mkdirSync(publicSpinesDir, { recursive: true });
}

// Маппинг книг: [исходный файл] -> [целевые файлы]
const booksMapping = {
  // Стивен Хокинг - Теория Всего
  'hawking': {
    cover: 'стивен хоккинг - теория всего.webp',
    back: null, // задняя обложка (если есть)
    spine: null // корешок (если есть)
  },
  // Сунь-Цзы - Искусство войны
  'sun-tzu': {
    cover: 'сунь-цзы искусство войны.webp',
    back: null,
    spine: null
  },
  // Марк Аврелий - Наедине с собой
  'marcus-aurelius': {
    cover: null, // нужно добавить файл
    back: null,
    spine: null
  },
  // Эпиктет - В чём наше благо?
  'epictetus': {
    cover: null, // нужно добавить файл
    back: null,
    spine: null
  },
  // Клейтон Кристенсен - Закон успешных инноваций
  'christensen': {
    cover: 'закон успешных инноваций.webp',
    back: null,
    spine: null
  }
};

// Функция копирования с нормализацией имени
function copyFile(srcName, destName, type) {
  if (!srcName) {
    console.log(`  ⚠️  ${type} для ${destName} не найден`);
    return false;
  }
  
  const srcPath = path.join(assetsDir, srcName);
  const destPath = path.join(publicCoversDir, destName);
  
  if (!fs.existsSync(srcPath)) {
    console.log(`  ❌ Файл не найден: ${srcName}`);
    return false;
  }
  
  fs.copyFileSync(srcPath, destPath);
  console.log(`  ✅ ${srcName} → ${destName}`);
  return true;
}

console.log('📚 Копирование обложек книг...\n');

let copied = 0;

// Хокинг
console.log('📘 Стивен Хокинг — Теория Всего:');
if (copyFile(booksMapping.hawking.cover, 'hawking-theory-of-everything.jpg', 'Обложка')) copied++;
if (booksMapping.hawking.back && copyFile(booksMapping.hawking.back, 'hawking-theory-of-everything-back.jpg', 'Задняя')) copied++;
if (booksMapping.hawking.spine && copyFile(booksMapping.hawking.spine, 'hawking-theory-of-everything-spine.jpg', 'Корешок')) copied++;
console.log();

// Сунь-Цзы
console.log('📕 Сунь-Цзы — Искусство войны:');
if (copyFile(booksMapping['sun-tzu'].cover, 'sun-tzu-art-of-war.jpg', 'Обложка')) copied++;
if (booksMapping['sun-tzu'].back && copyFile(booksMapping['sun-tzu'].back, 'sun-tzu-art-of-war-back.jpg', 'Задняя')) copied++;
if (booksMapping['sun-tzu'].spine && copyFile(booksMapping['sun-tzu'].spine, 'sun-tzu-art-of-war-spine.jpg', 'Корешок')) copied++;
console.log();

// Марк Аврелий
console.log('📔 Марк Аврелий — Наедине с собой:');
console.log('  ⚠️  Нужно добавить файл обложки в assets/book-covers/');
console.log();

// Эпиктет
console.log('📗 Эпиктет — В чём наше благо?:');
console.log('  ⚠️  Нужно добавить файл обложки в assets/book-covers/');
console.log();

// Кристенсен
console.log('📙 Клейтон Кристенсен — Закон успешных инноваций:');
if (copyFile(booksMapping.christensen.cover, 'christensen-innovators-solution.jpg', 'Обложка')) copied++;
if (booksMapping.christensen.back && copyFile(booksMapping.christensen.back, 'christensen-innovators-solution-back.jpg', 'Задняя')) copied++;
if (booksMapping.christensen.spine && copyFile(booksMapping.christensen.spine, 'christensen-innovators-solution-spine.jpg', 'Корешок')) copied++;
console.log();

console.log(`\n✅ Готово! Скопировано файлов: ${copied}`);
console.log('\n📁 Файлы находятся в: public/book-covers/');
console.log('\n🔄 Для разворотов: извлеките заднюю обложку из разворота вручную');
