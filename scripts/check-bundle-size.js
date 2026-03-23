#!/usr/bin/env node

/**
 * Проверка размера бандла
 * Используется в CI для контроля роста размера
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'out');
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_JS_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_CSS_SIZE = 100 * 1024; // 100KB

function getDirectorySize(dir) {
  let size = 0;

  function walk(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walk(filePath);
      } else {
        size += stat.size;
      }
    }
  }

  walk(dir);
  return size;
}

function getFilesByExtension(dir, ext) {
  const files = [];

  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        walk(itemPath);
      } else if (itemPath.endsWith(ext)) {
        files.push({
          path: itemPath,
          size: stat.size,
        });
      }
    }
  }

  walk(dir);
  return files;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function main() {
  console.log('📊 Анализ размера бандла\n');

  if (!fs.existsSync(OUT_DIR)) {
    console.error('❌ Директория out/ не найдена. Запустите npm run build');
    process.exit(1);
  }

  // Общий размер
  const totalSize = getDirectorySize(OUT_DIR);
  console.log(`📦 Общий размер: ${formatSize(totalSize)}`);

  // JS файлы
  const jsFiles = getFilesByExtension(OUT_DIR, '.js');
  const totalJsSize = jsFiles.reduce((sum, f) => sum + f.size, 0);
  console.log(`📜 JS файлы: ${formatSize(totalJsSize)}`);

  // CSS файлы
  const cssFiles = getFilesByExtension(OUT_DIR, '.css');
  const totalCssSize = cssFiles.reduce((sum, f) => sum + f.size, 0);
  console.log(`🎨 CSS файлы: ${formatSize(totalCssSize)}`);

  // Топ-10 самых больших файлов
  const allFiles = [...jsFiles, ...cssFiles].sort((a, b) => b.size - a.size);
  console.log('\n📋 Топ-10 самых больших файлов:');
  allFiles.slice(0, 10).forEach((file, i) => {
    const relativePath = path.relative(OUT_DIR, file.path);
    console.log(`  ${i + 1}. ${formatSize(file.size)} - ${relativePath}`);
  });

  // Проверка лимитов
  console.log('\n🎯 Проверка лимитов:');

  let hasErrors = false;

  if (totalSize > MAX_TOTAL_SIZE) {
    console.log(`  ❌ Общий размер превышен: ${formatSize(totalSize)} > ${formatSize(MAX_TOTAL_SIZE)}`);
    hasErrors = true;
  } else {
    console.log(`  ✅ Общий размер: ${formatSize(totalSize)} < ${formatSize(MAX_TOTAL_SIZE)}`);
  }

  if (totalJsSize > MAX_JS_SIZE) {
    console.log(`  ❌ JS размер превышен: ${formatSize(totalJsSize)} > ${formatSize(MAX_JS_SIZE)}`);
    hasErrors = true;
  } else {
    console.log(`  ✅ JS размер: ${formatSize(totalJsSize)} < ${formatSize(MAX_JS_SIZE)}`);
  }

  if (totalCssSize > MAX_CSS_SIZE) {
    console.log(`  ❌ CSS размер превышен: ${formatSize(totalCssSize)} > ${formatSize(MAX_CSS_SIZE)}`);
    hasErrors = true;
  } else {
    console.log(`  ✅ CSS размер: ${formatSize(totalCssSize)} < ${formatSize(MAX_CSS_SIZE)}`);
  }

  if (hasErrors) {
    console.log('\n❌ Проверка не пройдена!');
    process.exit(1);
  } else {
    console.log('\n✅ Все проверки пройдены!');
  }
}

main();
