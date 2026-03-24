#!/usr/bin/env node

/**
 * Lighthouse CI для автоматического тестирования производительности
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LIGHTHOUSE_CONFIG = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.4 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.7 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 5000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 2000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};

function main() {
  console.log('🔍 Запуск Lighthouse CI...\n');

  // Сохраняем конфигурацию
  const configPath = path.join(__dirname, '..', 'lighthouserc.json');
  fs.writeFileSync(configPath, JSON.stringify(LIGHTHOUSE_CONFIG, null, 2));

  try {
    // Проверяем, установлен ли @lhci/cli
    try {
      execSync('npx lhci --version', { stdio: 'ignore' });
    } catch {
      console.log('📦 Установка @lhci/cli...');
      execSync('npm install -D @lhci/cli', { stdio: 'inherit' });
    }

    // Запускаем Lighthouse CI
    execSync('npx lhci autorun', { stdio: 'inherit' });

    console.log('\n✅ Lighthouse CI завершён!');
  } catch (error) {
    console.error('\n❌ Ошибка при запуске Lighthouse CI');
    process.exit(1);
  }
}

main();
