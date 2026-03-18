# Stoic Book 3D — План развития

---

## ✅ Выполнено (Март 2026)

### Оптимизация производительности (Март 2026)
- [x] Texture Manager: LRU-кэш (maxCacheSize: 30), pruneCache, lastAccessed tracking
- [x] Texture Manager: глобальный placeholder кэш, оптимизированные размеры (64x88)
- [x] Book.tsx: константы GEOMETRIES и POSITIONS
- [x] Book.tsx: useMemo для материалов, ref вместо state для hover
- [x] Scene.tsx: useMemo для camera, fov, canvas options, performance config
- [x] Scene.tsx: near/far плоскости камеры, tabIndex для Canvas
- [x] page.tsx: useMemo для backgroundGradient, gridPattern, jsonLd
- [x] page.tsx: ref для file input, оптимизированный import/export
- [x] next.config.ts: minimumCacheTTL: 60, generateEtags: false
- [x] next.config.ts: optimizePackageImports для three.js экосистемы
- [x] next.config.ts: webpackBuildWorker: true
- [x] Service Worker: разделение на static/runtime кэши
- [x] Service Worker: лимиты кэша (maxEntries: 200), cleanupCache
- [x] Service Worker: стратегии cache-first, stale-while-revalidate
- [x] Service Worker: версионирование кэша, background update
- [x] use-gamification: вынесены данные достижений в константу
- [x] Анализ бандла: обновлён скрипт build:analyze для webpack
- [x] Web Vitals: локальное хранение метрик, фильтрация <10%
- [x] Web Vitals: отправка через sendBeacon, navigationType tracking
- [x] PWA Offline: offline.html добавлен в Service Worker кэш
- [x] Accessibility Tests: 12 тестов с @axe-core/playwright
- [x] E2E Tests: playwright.config.ts обновлён для production сборки

### Unit тесты (Март 2026)
- [x] useI18n: 11 тестов (локаль, переводы, RTL, localStorage)
- [x] useGamification: 10 тестов
- [x] useFavorites: 8 тестов
- [x] useAccessibility: 11 тестов
- [x] useCameraPersistence: 5 тестов
- [x] usePrefersColorScheme: 3 теста
- [x] useZenMode: 2 теста
- [x] Book3DContext: 15 тестов
- [x] ThreeOptimization: 14 тестов
- [x] BookCoverAPI: 13 тестов
- [x] Quotes: 4 теста
- [x] Security: 17 тестов
- [x] ErrorBoundary: 5 тестов
- [x] Итого: 117 тестов (13 файлов)

### Автоматическая тема по времени суток
- [x] useAutoTheme хук создан
- [x] 4 временные темы (morning/day/evening/night)
- [x] CSS стили для тем
- [x] Интеграция в UI (переключатель)

### Улучшения частиц
- [x] Плавный переход цветов при смене темы
- [x] Реакция частиц на вращение книги
- [x] Настройка плотности частиц (200 частиц)

### Контент
- [x] Категоризация цитат по темам (13 категорий)

### Theme of the Day Challenge
- [x] ThemeOfDay интерфейс и данные (6 тем в ротации)
- [x] getThemeOfDay функция с localStorage persistence
- [x] completeThemeChallenge хук
- [x] Интеграция в DailyChallenge компонент
- [x] Авто-завершение при смене темы в page.tsx

### Геймификация
- [x] Расширение системы достижений (22 достижения)
- [x] Визуализация прогресса (GamificationDashboard)
- [x] Daily challenges (цитата дня)
- [x] Statistics dashboard (время, вращения, книги, цитаты, темы)
- [x] Новые достижения: rotation_legend, stoic_sage, year_streak, book_library, favorites_master, daily_visitor, quote_sharer, category_explorer, night_owl, early_bird, zen_master

### PWA
- [x] Install prompt улучшение (iOS инструкции)
- [x] Offline страница

### Обложки книг (Март 2026)
- [x] Конвертация обложек в WebP формат
- [x] Создание корешков для всех 6 книг (book-spines/*.webp)
- [x] Создание задних обложек (book-covers/*-back.webp)
- [x] Скрипты автоматизации: convert-covers-to-webp.js, create-book-spines.js
- [x] books.ts: обновление путей на .webp формат

### i18n — Интернационализация
- [x] Добавлена поддержка 6 языков: EN, RU, ZH, HE, ES, FR
- [x] useI18n хук с localStorage persistence
- [x] Перевод всех UI компонентов:
  - ThemeSelector (названия тем)
  - MainMenu (навигация, настройки, о проекте, язык)
  - SettingsBar (вкладки, экспорт/импорт)
  - QuotesPanel (фильтры, поиск, aria-labels)
  - ControlButton (вращение, пауза)
  - BookSelector (смена книги)
  - PWAInstall (установка приложения)
- [x] RTL поддержка для иврита
- [x] 200+ ключей переводов

### Экспорт/Импорт
- [x] Экспорт избранных цитат в JSON
- [x] Импорт избранных цитат из JSON
- [x] Toast уведомления для операций
- [x] Валидация формата файлов

### Share цитат
- [x] Кнопка Share в QuoteCard
- [x] Web Share API для мобильных
- [x] Fallback на копирование в буфер

### Деплой конфигурации
- [x] Netlify (netlify.toml)
- [x] Vercel (vercel.json)
- [x] Cloudflare Pages (wrangler.toml + workflow)
- [x] GitHub Pages (workflow)
- [x] Railway (railway.json)
- [x] Render (render.yaml)
- [x] Docker (Dockerfile + docker-compose.yml)
- [x] DEPLOY.md документация

### Code Quality
- [x] 106 тестов проходят (unit + integration + E2E) ✅
- [x] ESLint: 0 errors, 0 warnings ✅
- [x] Build успешен (5.9s) ✅
- [x] TypeScript строгий режим (noImplicitAny: true)
- [x] 65+ цитат в stoic-quotes.ts
- [x] Цитаты от 10+ философов

### Рефакторинг
- [x] Удалён неиспользуемый BookLOD
- [x] Удалён неиспользуемый CanvasErrorBoundary
- [x] Реализован setZoom в Book3DContext
- [x] Удалены console.warn заглушки

### SEO
- [x] Расширенные мета-теги (Open Graph, Twitter Cards)
- [x] robots.txt
- [x] sitemap.xml
- [x] Иконки для PWA

### Доступность (A11y)
- [x] aria-live для цитат
- [x] Улучшенные focus-индикаторы
- [x] Skip-link навигация
- [x] Min touch-таргеты 44px

### Производительность
- [x] Lazy loading текстур
- [x] Fallback материалы при загрузке
- [x] Очистка материалов при unmount
- [x] Texture cache cleanup
- [x] InstancedMesh для частиц (200 частиц)
- [x] memo() для компонентов
- [x] Оптимизированный ParticleRingOptimized
- [x] LRU-кэш для текстур (maxCacheSize: 30)
- [x] pruneCache для автоматической очистки
- [x] Глобальный placeholder кэш
- [x] Оптимизированные размеры placeholder (64x88)
- [x] Константы GEOMETRIES и POSITIONS
- [x] useMemo для материалов
- [x] ref вместо state для hover (избегаем ре-рендеров)
- [x] useMemo для camera, fov, canvas options
- [x] near/far плоскости камеры
- [x] optimizePackageImports для three.js
- [x] webpackBuildWorker: true
- [x] minimumCacheTTL: 60 для изображений
- [x] generateEtags: false

### Обложки книг
- [x] Улучшен скрипт open-library-covers.js v2.0
- [x] Генерация SVG обложек с текстом при отсутствии cover ID
- [x] Градиентные фоны для SVG обложек
- [x] Улучшенное логирование и обработка ошибок
- [x] Загрузка реальных обложек через ISBN (Open Library) — 5/6 книг
- [x] Скрипт fetch-book-covers.js v3.1 с ISBN fallback

### Мобильная адаптация
- [x] Bottom sheet для меню
- [x] Haptic feedback
- [x] Safe area insets (notch устройства)
- [x] Touch-таргеты оптимизированы

### PWA Offline
- [x] Service Worker
- [x] Offline страница
- [x] Кэширование цитат
- [x] manifest.json обновлён
- [x] Разделение на static/runtime кэши
- [x] Лимиты кэша (maxEntries: 200)
- [x] cleanupCache для старых записей
- [x] Стратегии: cache-first, stale-while-revalidate
- [x] Версионирование кэша (v1.0.0)
- [x] Background update для закэшированных ресурсов

### Аналитика
- [x] Vercel Analytics
- [x] Web Vitals мониторинг
- [x] Custom events tracking
- [x] Трекинг смены книг/тем
- [x] Локальное хранение метрик Web Vitals
- [x] Фильтрация изменений <10%
- [x] Отправка через sendBeacon
- [x] navigationType tracking

### Контент
- [x] 48 цитат в books.ts (8 на книгу × 6 книг)
- [x] 6 книг: Марк Аврелий, Эпиктет, Сенека, Сунь-цзы, Хокинг, Кристенсен
- [x] 65+ цитат в stoic-quotes.ts для геймификации

### CI/CD
- [x] Кэширование зависимостей
- [x] Parallel тесты (2 shard)
- [x] Кэширование Playwright
- [x] Анализ бандла с webpack
- [x] Accessibility тесты с axe-core
- [x] Исправление ESLint ошибок (react-hooks rules, prefer-const, no-console)

---

## 🔄 В процессе

### Контент
- [ ] Аудио-версии цитат (TTS)

### Качество кода
- [ ] E2E тесты (Playwright)
- [ ] Lighthouse тестирование

### Производительность
- [ ] Конвертация всех текстур в WebP/AVIF
- [ ] Lazy loading для 3D моделей

---

## 📋 TODO — Приоритет 1

### Геймификация
- [x] Расширение системы достижений (11 достижений)
- [x] Визуализация прогресса (progress bars, badges)
- [x] Daily challenges (цитата дня)
- [x] Statistics dashboard (время в приложении, прочитано цитат)
- [x] Экспорт прогресса пользователя (JSON: статистика, достижения, избранное)
- [x] Расширение системы достижений (10 новых по категориям: wisdom_seeker, wisdom_master, stoic_warrior, peaceful_soul, action_hero, life_philosopher, knowledge_hunter, freedom_lover, strategy_master, inspiration_seeker)

### Контент — цитаты
- [x] Добавлено 33 новые цитаты в stoic-quotes.ts (Сократ, Сенека, Эпиктет, Марк Аврелий, Сунь-цзы, Хокинг)
- [x] 98+ цитат в stoic-quotes.ts

---

## 📋 TODO — Приоритет 2

### Контент
- [x] Интеграция с Open Library API для обложек (обложки сгенерированы в public/book-covers/)
- [x] Интеграция с Google Books API (скрипт parse-google-books.js доступен)
- [x] Категоризация цитат по темам

### Книги (QWEN Memory)
- [x] Стивен Хокинг — Теория Всего (в books.ts)
- [x] Сунь-Цзы — Искусство побеждать (в books.ts)
- [x] Марк Аврелий — Наедине с собой (в books.ts как "Размышления")
- [x] Эпиктет — В чём наше благо? (в books.ts как "Наше благо")
- [x] Клейтон Кристенсен — Закон успешных инноваций (в books.ts)

### PWA
- [x] Push уведомления (цитата дня)
- [x] Install prompt улучшение

---

## 🐛 Известные проблемы

### Баги
- [ ] Проверить работу на Safari iOS
- [ ] Проверить работу на Android Chrome

### Улучшения
- [x] Конвертация текстур в WebP (обложки книг)
- [ ] Визуальные регрессионные тесты
- [ ] Production Web Vitals дашборд

### ✅ Доступность
- [x] 12 accessibility тестов с @axe-core/playwright

---

## 📊 Метрики

| Метрика | Значение | Цель |
|---------|----------|------|
| Сборка | ~4s ✅ | <10s |
| Тесты | 117 passed ✅ (13 файлов) | 95+ |
| ESLint errors | 0 ✅ | 0 |
| Accessibility тесты | 12 passed ✅ | 10+ |
| Языки | 7 ✅ (EN, RU, ZH, HE, ES, FR, DE) | 6+ |
| Цитат | 98+ ✅ (stoic-quotes.ts) | 50+ |
| Цитат в книгах | 48 ✅ (books.ts: 6 книг × 8 цитат) | 40+ |
| Достижения | 32 ✅ (22 + 10 новых) | - |
| Категории | 13 ✅ | - |
| Книги | 6 ✅ | - |
| Theme of Day | 6 тем в ротации ✅ | - |
| Lighthouse Performance | TBD | 90+ |
| Lighthouse Accessibility | TBD | 95+ |

### Ожидаемые улучшения производительности
- [x] WebP конвертация обложек книг ✅
- [ ] WebP/AVIF конвертация остальных текстур
- [ ] Визуальные регрессионные тесты
- [ ] Production Web Vitals дашборд

---

## 🚀 Релизы

### v0.2.0 (текущая) ✅
- ✅ i18n поддержка (7 языков: EN, RU, ZH, HE, ES, FR, DE)
- ✅ Экспорт/импорт избранных цитат
- ✅ Share цитат (Web Share API + fallback)
- ✅ Деплой конфигурации (Netlify, Vercel, Cloudflare, Docker, etc.)
- ✅ SEO (meta, robots, sitemap, Open Graph, Twitter Cards)
- ✅ A11y (aria-live, focus indicators, skip-link, 44px touch targets)
- ✅ Производительность (lazy loading, texture cache, InstancedMesh)
- ✅ Мобильная адаптация (BottomSheet, haptic feedback, safe area)
- ✅ PWA Offline (Service Worker, offline page)
- ✅ Аналитика (Vercel Analytics, Web Vitals, custom events)
- ✅ 48 цитат в books.ts (6 книг × 8 цитат)
- ✅ 98+ цитат в stoic-quotes.ts для геймификации
- ✅ Геймификация (22 достижения, dashboard, daily challenges)
- ✅ Daily Challenge (цитата дня)
- ✅ PWA Install prompt (iOS инструкции)
- ✅ Категоризация цитат (13 категорий)
- ✅ Авто-тема по времени суток (morning/day/evening/night)
- ✅ Улучшенные частицы (200 частиц, реакция на вращение)
- ✅ 117 тестов (13 файлов)
- ✅ ESLint: 0 errors, 0 warnings
- ✅ TypeScript strict mode (noImplicitAny: true)
- ✅ 6 книг: Марк Аврелий, Эпиктет, Сенека, Сунь-цзы, Хокинг, Кристенсен
- ✅ Переключатель языков в MainMenu
- ✅ Theme of the Day Challenge (6 тем в ротации, авто-завершение)
- ✅ Исправлены ESLint ошибки (react-hooks rules, prefer-const, no-console)
- ✅ Загрузка реальных обложек через ISBN (Open Library)

### v0.2.1 (dev) ✅
- [x] Удаление неиспользуемого кода (BookCover.tsx, use-book-cover.ts, google-books.ts, open-library.ts)
- [x] Рефакторинг use-i18n.ts
- [x] Добавлено 33 новые цитаты (Сократ, Сенека, Эпиктет, Марк Аврелий, Сунь-цзы, Хокинг)
- [x] Unit тесты useI18n (11 тестов)
- [x] Unit тесты: 117 тестов (13 файлов)
- [x] WebP обложки книг (6 книг, корешки, задние обложки)
- [x] Улучшения доступности (aria-атрибуты, role="group")
- [x] Конфигурация turbopack (root, эксперименты)
- [x] Улучшены стили WebGLError для светлой темы
- [x] Добавлена поддержка немецкого языка (de) в i18n
- [x] Исправлены ESLint ошибки (BookCover, use-book-cover, api файлы)
- [x] Синхронизация dev → main ✅

### v0.3.0 (план) 🔄
- [x] Интеграция с Open Library API для обложек (обложки в public/book-covers/)
- [x] Интеграция с Google Books API (скрипты готовы)
- [x] Расширение системы достижений (новые категории: 10 достижений)
- [x] Темы дня (daily theme challenge)
- [x] Экспорт прогресса пользователя
- [x] Автоматическая тема по времени суток (morning/day/evening/night)
- [x] Улучшенные частицы (реакция на вращение, плавный переход цветов)
- [ ] Проверка на Safari iOS
- [ ] Проверка на Android Chrome

### v0.4.0 (план)
- [ ] PWA push уведомления
- [ ] Расширение системы достижений (новые категории)
- [ ] Проверка на Safari iOS / Android Chrome
- [ ] Lighthouse Performance 90+
- [ ] Lighthouse Accessibility 95+
- [ ] WebP/AVIF конвертация текстур
- [ ] Визуальные регрессионные тесты
- [ ] Production Web Vitals дашборд
