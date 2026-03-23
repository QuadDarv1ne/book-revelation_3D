#!/usr/bin/env node

/**
 * Скрипт для быстрой проверки здоровья проекта
 * Запускает основные проверки качества кода
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const checks = [
  {
    name: 'ESLint',
    command: 'npm run lint',
    required: true,
  },
  {
    name: 'TypeScript',
    command: 'npx tsc --noEmit',
    required: true,
  },
  {
    name: 'Unit Tests',
    command: 'npm test -- --run',
    required: true,
  },
  {
    name: 'Build',
    command: 'npm run build',
    required: true,
  },
  {
    name: 'Bundle Size',
    command: 'node scripts/check-bundle-size.js',
    required: false,
  },
];

function runCheck(check) {
  console.log(`\n🔍 Проверка: ${check.name}`);
  console.log('─'.repeat(50));

  try {
    execSync(check.command, { stdio: 'inherit' });
    console.log(`✅ ${check.name} — OK`);
    return true;
  } catch (error) {
    console.error(`❌ ${check.name} — FAILED`);
    if (check.required) {
      return false;
    }
    console.log('⚠️  Не критично, продолжаем...');
    return true;
  }
}

function main() {
  console.log('🏥 Проверка здоровья проекта');
  console.log('═'.repeat(50));

  const results = checks.map(runCheck);
  const allPassed = results.every((r) => r);

  console.log('\n' + '═'.repeat(50));
  if (allPassed) {
    console.log('✅ Все проверки пройдены!');
    console.log('\n🚀 Проект готов к коммиту');
    process.exit(0);
  } else {
    console.log('❌ Некоторые проверки не прошли');
    console.log('\n🔧 Исправьте ошибки перед коммитом');
    process.exit(1);
  }
}

main();
