# Развёртывание на Amvera Cloud

## Требования

- Аккаунт на [Amvera](https://amvera.ru/)
- Установленный CLI `amvera`
- Docker (опционально, для локальной сборки)

## Быстрый старт

### 1. Установка Amvera CLI

```bash
# Windows (PowerShell)
iwr https://cli.amvera.ru/install.ps1 -useb | iex

# Linux/macOS
curl -fsSL https://cli.amvera.ru/install.sh | bash
```

### 2. Авторизация

```bash
amvera login
```

### 3. Инициализация проекта

```bash
cd book-revelation_3D
amvera init
```

При инициализации выберите:
- **Тип приложения:** Static
- **Порт:** 3000
- **Команда запуска:** `npm run start`

### 4. Создание amvera.yaml

Создайте файл `amvera.yaml` в корне проекта:

```yaml
meta:
  projectName: stoic-book-3d
  toolkit:
    name: static

build:
  type: bun
  nodeVersion: 20
  commands:
    - bun install
    - bun run build

run:
  type: static
  dist: out
  headers:
    - path: /*
      headers:
        - name: Cache-Control
          value: public, max-age=31536000, immutable
        - name: X-Content-Type-Options
          value: nosniff
        - name: X-Frame-Options
          value: DENY
```

### 5. Деплой

```bash
# Деплой в dev-контур
amvera deploy

# Деплой в prod-контур
amvera deploy --prod
```

### 6. Проверка статуса

```bash
amvera status
amvera logs
```

## Переменные окружения

Для настройки проекта добавьте в Amvera Console:

```bash
# В веб-интерфейсе Amvera:
# Project → Settings → Environment Variables

ANALYZE=false
NEXT_TELEMETRY_DISABLED=1
```

## Обновление проекта

```bash
# После внесения изменений
git add .
git commit -m "feat: описание изменений"
git push origin dev

# Деплой обновлённой версии
amvera deploy
```

## Локальная сборка для проверки

```bash
# Сборка статического сайта
bun run build

# Предпросмотр
npx serve out
```

## Настройка домена

1. Откройте Amvera Console
2. Перейдите в проект → Domains
3. Добавьте свой домен
4. Настройте DNS записи:
   - **Тип:** CNAME
   - **Имя:** `@` или `www`
   - **Значение:** `<your-app>.amvera.app`

## Мониторинг

```bash
# Просмотр логов
amvera logs --follow

# Метрики приложения
amvera metrics

# Список деплоев
amvera deployments
```

## Оптимизация для Amvera

- Проект уже экспортируется как статика (`output: "export"`)
- Все ассеты кэшируются через headers в `amvera.yaml`
- 3D-компоненты загружаются лениво (dynamic import)

## Troubleshooting

### Ошибка сборки

```bash
# Очистка кэша
amvera cache clean

# Повторная сборка
amvera deploy --no-cache
```

### Ошибка доступа к WebGL

Убедитесь, что в `next.config.ts` установлено:

```typescript
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};
```

## Полезные команды

```bash
amvera apps list          # Список приложений
amvera apps delete        # Удаление приложения
amvera config show        # Показать конфигурацию
amvera config set VAR=value  # Установить переменную
```

## Ссылки

- [Документация Amvera](https://docs.amvera.ru/)
- [Amvera CLI](https://docs.amvera.ru/cli/)
- [Примеры проектов](https://github.com/amvera/examples)
