# Book Covers Assets

Папка для хранения обложек книг и связанных ресурсов.

## Структура

```
assets/book-covers/
├── meditations-marcus-aurelius.jpg    # Обложка "Размышлений" Марка Аврелия
├── encheiridion-epictetus.jpg         # Обложка "Энхиридиона" Эпиктета
├── stoic-philosophy-classic.jpg       # Классическая обложка стоической философии
└── README.md                          # Этот файл
```

## Использование

### 1. Автоматическая загрузка

```bash
node scripts/download-covers.js
```

Скрипт загрузит обложки из открытых источников в папку `assets/book-covers/`.

### 2. Ручная загрузка

Поместите изображения обложек в папку `assets/book-covers/`:
- Формат: JPG или PNG
- Рекомендуемый размер: 256x352px или 512x704px
- Соотношение сторон: ~3:4

### 3. Копирование в public

Для использования в проекте скопируйте нужную обложку:

```bash
# Windows (PowerShell)
Copy-Item assets/book-covers/meditations-marcus-aurelius.jpg public/book-cover.jpg

# Linux/Mac
cp assets/book-covers/meditations-marcus-aurelius.jpg public/book-cover.jpg
```

### 4. Использование в коде

```tsx
import { Scene } from "@/components/book";

<Scene 
  isRotating={true} 
  coverImage="/book-cover.jpg"
  spineImage="/book-spine.jpg"
/>
```

## Источники изображений

### Бесплатные текстуры (CC0)
- **Poly haven** — https://polyhaven.com/textures
- **AmbientCG** — https://ambientcg.com
- **CGBookcase** — https://cgbookcase.com

### Бесплатные фото
- **Unsplash** — https://unsplash.com
- **Pexels** — https://pexels.com
- **Pixabay** — https://pixabay.com

### Общественное достояние
- **Wikimedia Commons** — https://commons.wikimedia.org
- **Project Gutenberg** — https://gutenberg.org

## Требования к изображениям

| Параметр | Значение |
|----------|----------|
| Формат | JPG, PNG |
| Размер обложки | 256x352px (мин), 512x704px (рек) |
| Размер корешка | 64x352px (мин), 128x704px (рек) |
| Цветовое пространство | sRGB |
| Макс. размер файла | 500 KB |

## Лицензии

Все изображения должны быть:
- В общественном достоянии (Public Domain)
- Под лицензией CC0
- Под лицензией, разрешающей коммерческое использование

Проверяйте лицензию каждого изображения перед использованием.
