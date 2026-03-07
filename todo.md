# Stoic Book 3D — План развития

---

## ✅ Выполнено (Март 2026)

### i18n — Интернационализация
- [x] Добавлена поддержка 4 языков: EN, RU, ZH, HE
- [x] useI18n хук с localStorage persistence
- [x] Перевод всех UI компонентов:
  - ThemeSelector (названия тем)
  - MainMenu (навигация, настройки, о проекте)
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
- [x] 92 теста проходят (unit + integration)
- [x] ESLint: 0 errors, 1 warning
- [x] Build успешен
- [x] TypeScript строгий режим

### Рефакторинг
- [x] Удалён неиспользуемый BookLOD
- [x] Удалён неиспользуемый CanvasErrorBoundary
- [x] Реализован setZoom в Book3DContext
- [x] Удалены console.warn заглушки

---

## 🔄 В процессе

### Производительность
- [ ] Lazy loading для цитат (виртуализация списка)
- [ ] Оптимизация загрузки текстур (превью → полное)
- [ ] Code splitting для маршрутов

---

## 📋 TODO — Приоритет 1

### Автоматическая тема по времени суток
- [ ] Утренняя тема (5:00-11:00) — светлая с тёплыми тонами
- [ ] Дневная тема (11:00-17:00) — светлая стандартная
- [ ] Вечерняя тема (17:00-22:00) — тёмная с тёплыми тонами
- [ ] Ночная тема (22:00-5:00) — тёмная с приглушёнными цветами
- [ ] Автоопределение по системному времени
- [ ] Ручная override настройка

### Улучшения частиц
- [ ] Анимация частиц при смене темы (плавный переход цветов)
- [ ] Реакция частиц на вращение книги
- [ ] Настройка плотности частиц

---

## 📋 TODO — Приоритет 2

### Мобильная адаптация
- [ ] Bottom sheet для меню на мобильных
- [ ] Улучшенные swipe жесты для навигации
- [ ] Haptic feedback для мобильных устройств
- [ ] Оптимизация тач-таргетов (min 44px)
- [ ] Safe area insets для notch устройств

### Геймификация
- [ ] Расширение системы достижений (новые категории)
- [ ] Визуализация прогресса (progress bars, badges)
- [ ] Daily challenges (цитата дня, тема дня)
- [ ] Statistics dashboard (время в приложении, прочитано цитат)

---

## 📋 TODO — Приоритет 3

### Контент
- [ ] Интеграция с Open Library API для обложек
- [ ] Интеграция с Google Books API
- [ ] Больше цитат для каждой книги
- [ ] Категоризация цитат по темам

### PWA
- [ ] Offline режим (кэширование цитат)
- [ ] Push уведомления (цитата дня)
- [ ] Install prompt улучшение

### Аналитика
- [ ] Vercel Analytics интеграция
- [ ] Custom events tracking
- [ ] Performance monitoring (Web Vitals)

---

## 🐛 Известные проблемы

### ESLint warnings
- [ ] ThemeParticleEffect: useEffect dependency 'activeTheme'

### Баги
- [ ] Проверить работу на Safari iOS
- [ ] Проверить работу на Android Chrome

---

## 📊 Метрики

| Метрика | Значение | Цель |
|---------|----------|------|
| Тесты | 92 passed | 95+ |
| ESLint errors | 0 | 0 |
| ESLint warnings | 1 | 0 |
| Языки | 4 | 6+ |
| Lighthouse Performance | TBD | 90+ |
| Lighthouse Accessibility | TBD | 95+ |

---

## 🚀 Релизы

### v0.2.0 (текущая)
- ✅ i18n поддержка
- ✅ Экспорт/импорт
- ✅ Share цитат
- ✅ Деплой конфигурации

### v0.3.0 (план)
- [ ] Авто-тема по времени
- [ ] Улучшения частиц
- [ ] Мобильная адаптация

### v0.4.0 (план)
- [ ] Геймификация расширенная
- [ ] PWA offline режим
- [ ] Интеграция API обложек
