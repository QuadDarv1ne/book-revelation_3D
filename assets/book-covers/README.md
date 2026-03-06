# Book Covers Assets

Папка для хранения обложек книг.

## Использование

### 1. Ручная загрузка (рекомендуется)

1. Найдите обложку книги на сайте (например, azbooka.ru)
2. Сохраните изображение в `assets/book-covers/`
3. Скопируйте в public:

```bash
npm run covers:set
```

### 2. Автоматическая загрузка

```bash
npm run covers:parse    # Open Library
npm run covers:google   # Google Books API
npm run covers:download # Простая загрузка
```

### 3. Создание корешка

```bash
npm run covers:create-spine
```

### 4. Выбор обложки

```bash
# Windows PowerShell
Copy-Item assets/book-covers/<filename>.jpg public/book-cover.jpg -Force

# Или через скрипт
node scripts/set-cover.js
```
