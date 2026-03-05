# Stoic Book 3D — Web Component v2

## Быстрый старт

### 1. Подключение

```html
<script src="https://your-domain.com/web-component.js" defer></script>
```

### 2. Использование

```html
<stoic-book-3d 
  src="https://your-domain.com" 
  height="600"
  theme="dark"
></stoic-book-3d>
```

---

## Атрибуты

| Атрибут | Тип | Описание | По умолчанию |
|---------|-----|----------|--------------|
| `src` | string | URL где размещён модуль | `window.location.origin` |
| `height` | string | Высота в пикселях | `600` |
| `theme` | string | Тема: `dark` или `light` | `dark` |
| `quotes-count` | string | Количество цитат | `8` |
| `language` | string | Язык: `ru`, `en` | `ru` |
| `autoplay` | boolean | Авто-вращение при загрузке | `true` |
| `border-radius` | string | Радиус скругления (px) | `12` |
| `shadow` | boolean | Тень у компонента | `true` |

---

## Методы

### setTheme(theme)

Изменить тему оформления.

```javascript
const wc = document.querySelector('stoic-book-3d');
wc.setTheme('light');
wc.setTheme('dark');
```

### setHeight(height)

Изменить высоту компонента.

```javascript
wc.setHeight('500');
wc.setHeight('600px');
```

### toggleRotation()

Переключить авто-вращение книги.

```javascript
wc.toggleRotation();
```

### setActiveQuote(index)

Установить активную цитату по индексу.

```javascript
wc.setActiveQuote(0); // Первая цитата
wc.setActiveQuote(3); // Четвёртая цитата
```

### refresh()

Перезагрузить iframe.

```javascript
wc.refresh();
```

---

## События

### ready

Срабатывает когда компонент готов к работе.

```javascript
wc.addEventListener('ready', (e) => {
  console.log('Компонент готов!', e.detail.version);
});
```

### quote-change

Срабатывает при смене активной цитаты.

```javascript
wc.addEventListener('quote-change', (e) => {
  console.log('Новая цитата:', e.detail.index);
});
```

### theme-change

Срабатывает при смене темы.

```javascript
wc.addEventListener('theme-change', (e) => {
  console.log('Тема:', e.detail.theme);
});
```

### error

Срабатывает при ошибке загрузки.

```javascript
wc.addEventListener('error', (e) => {
  console.error('Ошибка:', e.detail.message);
});
```

---

## Примеры

### Базовое использование

```html
<stoic-book-3d height="600"></stoic-book-3d>
```

### Все атрибуты

```html
<stoic-book-3d 
  src="https://stoic-book.vercel.app"
  height="550"
  theme="dark"
  quotes-count="6"
  language="ru"
  autoplay="true"
  border-radius="16"
  shadow="true"
></stoic-book-3d>
```

### С внешними кнопками

```html
<div class="controls">
  <button onclick="toggleTheme()">Тема</button>
  <button onclick="toggleRotation()">Вращение</button>
  <button onclick="prevQuote()">← Назад</button>
  <button onclick="nextQuote()">Вперёд →</button>
</div>

<stoic-book-3d id="book" height="600"></stoic-book-3d>

<script>
  const book = document.getElementById('book');
  let currentQuote = 0;
  
  function toggleTheme() {
    const current = book.getAttribute('theme');
    book.setTheme(current === 'dark' ? 'light' : 'dark');
  }
  
  function toggleRotation() {
    book.toggleRotation();
  }
  
  function prevQuote() {
    currentQuote = (currentQuote - 1 + 8) % 8;
    book.setActiveQuote(currentQuote);
  }
  
  function nextQuote() {
    currentQuote = (currentQuote + 1) % 8;
    book.setActiveQuote(currentQuote);
  }
  
  // Слушаем события
  book.addEventListener('quote-change', (e) => {
    currentQuote = e.detail.index;
    console.log('Цитата изменена:', currentQuote);
  });
</script>
```

### Полная программа

```javascript
const wc = document.querySelector('stoic-book-3d');

// Инициализация
wc.addEventListener('ready', () => {
  console.log('Версия:', wc.constructor.version);
});

// Управление
wc.setTheme('light');
wc.setHeight('500');
wc.toggleRotation();
wc.setActiveQuote(2);

// Обработка ошибок
wc.addEventListener('error', (e) => {
  console.error('Ошибка загрузки:', e.detail);
});

// Перезагрузка при необходимости
wc.refresh();
```

---

## Интеграция

### Tilda

**Блок T123 (HTML-код):**

```html
<script src="https://your-domain.com/web-component.js" defer></script>
<stoic-book-3d src="https://your-domain.com" height="600"></stoic-book-3d>
```

**Zero Block:**

1. Откройте Zero Block
2. Add HTML
3. Вставьте код выше
4. Опубликуйте

### WordPress

**Через блок "HTML-код":**

```html
<script src="https://your-domain.com/web-component.js" defer></script>
<stoic-book-3d height="600"></stoic-book-3d>
```

**Через functions.php:**

```php
function enqueue_stoic_book() {
  wp_enqueue_script(
    'stoic-book-wc',
    'https://your-domain.com/web-component.js',
    [],
    null,
    true
  );
}
add_action('wp_enqueue_scripts', 'enqueue_stoic_book');
```

**В шаблоне:**

```php
<stoic-book-3d height="600"></stoic-book-3d>
```

### Webflow

1. Add Embed элемент
2. Вставьте:

```html
<script src="https://your-domain.com/web-component.js" defer></script>
<stoic-book-3d height="600"></stoic-book-3d>
```

### React

```jsx
import { useEffect } from 'react';

export function StoicBook() {
  useEffect(() => {
    // Компонент зарегистрируется автоматически
  }, []);

  return (
    <stoic-book-3d 
      height="600"
      theme="dark"
      ref={el => {
        if (el) {
          el.addEventListener('ready', () => console.log('Ready!'));
        }
      }}
    />
  );
}
```

### Vue

```vue
<template>
  <stoic-book-3d 
    height="600" 
    @ready="onReady"
    @quote-change="onQuoteChange"
  />
</template>

<script setup>
const onReady = (e) => console.log('Ready!', e.detail);
const onQuoteChange = (e) => console.log('Quote:', e.detail);
</script>
```

---

## Кастомизация

### CSS переменные

```css
stoic-book-3d {
  --sb3d-primary: #d4af37;
  --sb3d-background: #07070d;
  --sb3d-radius: 12px;
}
```

### Стили контейнера

```html
<stoic-book-3d 
  height="600"
  style="
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    border-radius: 16px;
    overflow: hidden;
  "
></stoic-book-3d>
```

### Адаптивность

```css
@media (max-width: 768px) {
  stoic-book-3d {
    height: 450px !important;
  }
}

@media (max-width: 480px) {
  stoic-book-3d {
    height: 380px !important;
  }
}
```

---

## Демо

Откройте `/wc-demo.html` для просмотра всех возможностей:

```bash
bun run dev
# Перейдите на http://localhost:3000/wc-demo.html
```

---

## Поддержка браузеров

| Браузер | Версия |
|---------|--------|
| Chrome | 67+ |
| Firefox | 63+ |
| Safari | 10.1+ |
| Edge | 79+ |
| iOS Safari | 10.3+ |
| Android Chrome | 67+ |

---

## Troubleshooting

### Компонент не отображается

**Проверка регистрации:**
```javascript
console.log(customElements.get('stoic-book-3d'));
// Должен вернуть класс компонента
```

**Проверка загрузки скрипта:**
```html
<script src="https://your-domain.com/web-component.js" defer></script>
```

### Iframe не загружается

**Проверьте CORS:**
```javascript
fetch('https://your-domain.com')
  .then(r => console.log('OK:', r.status))
  .catch(e => console.error('Error:', e));
```

**Проверьте src атрибут:**
```html
<stoic-book-3d src="https://your-domain.com"></stoic-book-3d>
```

### События не срабатывают

**Проверка origin:**
```javascript
wc.addEventListener('ready', (e) => {
  console.log('Origin:', e.detail.origin);
});
```

### Тема не применяется

**Проверка значения:**
```javascript
wc.setTheme('dark'); // или 'light'
console.log(wc.getAttribute('theme'));
```

---

## API Reference

### Класс StoicBook3D

```javascript
class StoicBook3D extends HTMLElement {
  // Статические свойства
  static version: string;
  static observedAttributes: string[];
  
  // Геттеры
  src: string;
  height: string;
  theme: string;
  quotesCount: string;
  language: string;
  autoplay: boolean;
  borderRadius: string;
  shadow: boolean;
  
  // Методы
  setTheme(theme: string): void;
  setHeight(height: string): void;
  toggleRotation(): void;
  setActiveQuote(index: number): void;
  refresh(): void;
}
```

---

## Changelog

### v2.0.0

- ✨ События: ready, quote-change, theme-change, error
- ✨ Авто-повтор при ошибке загрузки (до 3 раз)
- ✨ Улучшенная обработка loading состояния
- ✨ CSS переменные для кастомизации
- ✨ Поддержка language атрибута
- ✨ Поддержка autoplay атрибута
- ✨ Улучшенная доступность (ARIA)
- ✨ Debounce для частых изменений атрибутов
- ✨ Метод refresh() для перезагрузки
- ✨ Улучшенная обработка ошибок

### v1.0.0

- Первая версия компонента

---

## Лицензия

MIT License — свободное использование
