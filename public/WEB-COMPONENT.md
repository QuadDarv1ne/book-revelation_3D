# Stoic Book 3D — Web Component

## Интеграция на Tilda

### Быстрый старт

**1. Подключите скрипт**

В блок **T123** (HTML-код) или **Zero Block** → **HTML**:

```html
<script src="https://your-domain.com/web-component.js" defer></script>
```

**2. Добавьте компонент**

```html
<stoic-book-3d 
  src="https://your-domain.com" 
  height="600"
  theme="dark"
  quotes-count="8"
></stoic-book-3d>
```

---

## Атрибуты

| Атрибут | Описание | По умолчанию |
|---------|----------|--------------|
| `src` | URL где размещён модуль | `window.location.origin` |
| `height` | Высота в пикселях | `600` |
| `theme` | Тема: `dark` или `light` | `dark` |
| `quotes-count` | Количество цитат | `8` |

---

## Методы

```javascript
const component = document.querySelector('stoic-book-3d');

// Изменить тему
component.setTheme('light');

// Изменить высоту
component.setHeight('500');

// Переключить вращение
component.toggleRotation();
```

---

## Примеры

### Базовое использование

```html
<stoic-book-3d height="600"></stoic-book-3d>
```

### С кастомной темой

```html
<stoic-book-3d 
  src="https://stoic-book.vercel.app" 
  height="550" 
  theme="light"
></stoic-book-3d>
```

### С внешними кнопками

```html
<div class="controls">
  <button onclick="toggleTheme()">Тема</button>
  <button onclick="toggleRotation()">Вращение</button>
</div>

<stoic-book-3d id="book" height="600"></stoic-book-3d>

<script>
  const book = document.getElementById('book');
  
  function toggleTheme() {
    const current = book.getAttribute('theme');
    book.setTheme(current === 'dark' ? 'light' : 'dark');
  }
  
  function toggleRotation() {
    book.toggleRotation();
  }
</script>
```

---

## Интеграция в Tilda Zero Block

1. Откройте **Zero Block**
2. Нажмите **Add HTML**
3. Вставьте:

```html
<div style="width:100%;height:600px;">
  <stoic-book-3d src="https://your-domain.com" height="600"></stoic-book-3d>
</div>
<script src="https://your-domain.com/web-component.js" defer></script>
```

4. Опубликуйте страницу

---

## Интеграция в WordPress

**Через блок "HTML-код":**

```html
<script src="https://your-domain.com/web-component.js" defer></script>
<stoic-book-3d src="https://your-domain.com" height="600"></stoic-book-3d>
```

**Через functions.php:**

```php
function add_stoic_book_component() {
  wp_enqueue_script(
    'stoic-book-wc',
    'https://your-domain.com/web-component.js',
    [],
    null,
    true
  );
}
add_action('wp_enqueue_scripts', 'add_stoic_book_component');
```

---

## Интеграция в Webflow

1. Добавьте **Embed** элемент
2. Вставьте:

```html
<script src="https://your-domain.com/web-component.js" defer></script>
<stoic-book-3d height="600"></stoic-book-3d>
```

---

## Кастомизация стилей

### CSS переменные

```css
stoic-book-3d {
  --book-primary: #d4af37;
  --book-background: #07070d;
  --book-radius: 12px;
}
```

### Тень и скругление

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

---

## Troubleshooting

### Компонент не отображается

1. Проверьте что скрипт загружен:
```javascript
console.log(customElements.get('stoic-book-3d')); // должен вернуть класс
```

2. Проверьте CORS настройки сервера

### Iframe не загружается

Проверьте что `src` указывает на корректный URL:
```html
<stoic-book-3d src="https://your-domain.com"></stoic-book-3d>
```

### Тема не применяется

Убедитесь что тема поддерживается:
```javascript
component.setTheme('dark'); // или 'light'
```

---

## Лицензия

MIT License — свободное использование
