# Bundle Analysis

## Запуск анализа

```bash
# Анализ production сборки
npm run build:analyze

# Или
set ANALYZE=true&& npm run build
```

## Текущие размеры бандлов

### Основные чанки

| Файл | Размер (gzip) | Примечание |
|------|---------------|------------|
| main.js | ~150 KB | React + Next.js runtime |
| framework.js | ~45 KB | Next.js framework |
| webpack.js | ~10 KB | Webpack runtime |
| app/page.js | ~80 KB | Основной код приложения |

### 3D зависимости

| Библиотека | Размер | Оптимизация |
|------------|--------|-------------|
| three.js | ~600 KB | Tree-shaking |
| @react-three/fiber | ~100 KB | Tree-shaking |
| @react-three/drei | ~200 KB | Импортировать только нужное |

## Рекомендации по оптимизации

### 1. Lazy Loading для 3D компонентов
- ✅ Scene уже использует dynamic import
- ✅ QuotesPanel использует Suspense

### 2. Tree Shaking
- Использовать именованные импорты
- Избегать `import * as THREE`

### 3. Code Splitting
- Разделить Book и Scene компоненты
- Lazy load для текстур

### 4. Изображения
- Использовать WebP формат
- Lazy loading для обложек книг

### 5. Кэширование
- Service Worker для статики
- Texture Manager для 3D текстур

## Мониторинг

Проверять размеры бандлов после каждого значительного изменения:

```bash
npm run build
```

Следить за:
- Общим размером main.js
- Временем загрузки первого экрана
- Lighthouse Performance score
