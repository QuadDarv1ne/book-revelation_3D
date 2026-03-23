# 📚 Источники обложек книг

## 🔥 Лучшие бесплатные API

### 1. Open Library (рекомендуется)
**URL:** https://openlibrary.org/dev/docs/api/covers

**Преимущества:**
- Бесплатно, без API ключа
- Высокое качество
- Разные размеры (S, M, L)

**Использование:**
```bash
# По ISBN
https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg

# По OLID (Open Library ID)
https://covers.openlibrary.org/b/olid/OL7353617M-L.jpg
```

**Скрипт в проекте:**
```bash
node scripts/open-library-covers.js
```

---

### 2. Google Books API
**URL:** https://developers.google.com/books/docs/v1/using

**Преимущества:**
- Бесплатно (1000 запросов/день)
- Хорошее качество
- Метаданные книг

**Использование:**
```bash
# API запрос
https://www.googleapis.com/books/v1/volumes?q=isbn:9780140449334

# Увеличить качество изображения
imageLinks.thumbnail.replace('zoom=1', 'zoom=3')
```

**Скрипт в проекте:**
```bash
node scripts/parse-google-books.js
```

---

### 3. Internet Archive
**URL:** https://archive.org/

**Преимущества:**
- Бесплатно
- Много старых книг
- Иногда есть сканы всех страниц

**Использование:**
```bash
https://archive.org/services/img/isbn_9780140449334
```

---

## 🎨 Корешки и задние обложки

### Проблема
Большинство API предоставляют только **переднюю обложку**. Корешки и задники найти сложнее.

### Решения:

#### 1. Amazon (лучшее качество)
- Зайти на amazon.com
- Найти книгу по ISBN
- Часто есть функция "Look Inside" с корешком
- Скриншот или сохранить изображение

#### 2. Google Books Preview
- books.google.com
- Поиск по ISBN
- Иногда показывает корешок в превью

#### 3. Goodreads
- goodreads.com
- Пользователи загружают разные ракурсы
- Нужна регистрация

#### 4. Генерация корешков программно
**Скрипт в проекте:**
```bash
node scripts/create-spine.js
```

Создаёт корешок с:
- Названием книги
- Автором
- Цветом из темы книги

---

## 🛠️ Практическое руководство

### Шаг 1: Автоматическая загрузка передних обложек

```bash
# Open Library (лучший вариант)
node scripts/open-library-covers.js

# Или Google Books
node scripts/parse-google-books.js
```

### Шаг 2: Ручной поиск задних обложек

**Для каждой книги:**

1. **Марк Аврелий - Размышления** (ISBN: 9780140449334)
   - Amazon: https://www.amazon.com/dp/0140449337
   - Google Books: https://books.google.com/books?isbn=9780140449334

2. **Эпиктет - Наше благо** (ISBN: 9780195041583)
   - Amazon: https://www.amazon.com/dp/0195041585
   - Google Books: https://books.google.com/books?isbn=9780195041583

3. **Сенека - Письма** (ISBN: 9780140442106)
   - Amazon: https://www.amazon.com/dp/0140442103
   - Google Books: https://books.google.com/books?isbn=9780140442106

4. **Сунь-Цзы - Искусство войны** (ISBN: 9781599869773)
   - Amazon: https://www.amazon.com/dp/1599869772
   - Google Books: https://books.google.com/books?isbn=9781599869773

5. **Стивен Хокинг - Теория всего** (ISBN: 9780762476282)
   - Amazon: https://www.amazon.com/dp/0762476281
   - Google Books: https://books.google.com/books?isbn=9780762476282

6. **Клейтон Кристенсен** (ISBN: 9781422185889)
   - Amazon: https://www.amazon.com/dp/1422185885
   - Google Books: https://books.google.com/books?isbn=9781422185889

### Шаг 3: Генерация корешков

```bash
# Автоматически создаёт корешки для всех книг
node scripts/create-spine.js
```

### Шаг 4: Конвертация в WebP

```bash
# После загрузки всех изображений
npm run covers:optimize
```

---

## 📸 Альтернативные источники

### Платные (высокое качество)
1. **Shutterstock** - профессиональные фото
2. **Getty Images** - премиум качество
3. **Adobe Stock** - хорошая библиотека

### Бесплатные (ручной поиск)
1. **Сайты издательств** - Penguin, Oxford, Harvard Business Review
2. **Книжные магазины** - Barnes & Noble, Waterstones
3. **Библиотеки** - Library of Congress
4. **Википедия** - иногда есть обложки книг

---

## 🎯 Рекомендации

### Для передних обложек:
1. ✅ **Open Library API** - автоматически, бесплатно
2. ✅ **Google Books API** - если Open Library не нашёл
3. ✅ **Ручной поиск на Amazon** - для лучшего качества

### Для корешков:
1. ✅ **Генерация скриптом** - быстро, единый стиль
2. ✅ **Amazon "Look Inside"** - если нужны реальные
3. ✅ **Скриншоты с Google Books** - альтернатива

### Для задних обложек:
1. ✅ **Amazon** - лучший источник
2. ✅ **Google Books Preview** - если доступно
3. ✅ **Генерация с цитатами** - можно создать свои

---

## 💡 Советы

1. **Качество:** Минимум 600x800px для передней обложки
2. **Формат:** WebP для оптимизации (используйте `npm run covers:optimize`)
3. **Права:** Обложки книг обычно защищены авторским правом, но использование в образовательных/некоммерческих целях часто допустимо
4. **Консистентность:** Используйте одинаковый стиль для всех книг
5. **Fallback:** Всегда имейте SVG fallback для книг без обложек

---

## 🚀 Быстрый старт

```bash
# 1. Загрузить передние обложки
node scripts/open-library-covers.js

# 2. Создать корешки
node scripts/create-spine.js

# 3. Вручную найти задние обложки на Amazon

# 4. Конвертировать всё в WebP
npm run covers:optimize

# 5. Обновить пути в src/data/books.ts
```

---

## 📝 Текущий статус проекта

Все книги уже имеют:
- ✅ Передние обложки (WebP)
- ✅ Корешки (WebP, сгенерированы)
- ✅ Задние обложки (WebP)

Если нужно обновить на более качественные - следуйте инструкциям выше.
