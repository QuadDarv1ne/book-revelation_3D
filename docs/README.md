# Документация проекта

## Руководства по развёртыванию

- **[Amvera Cloud](./deploy-amvera.md)** — развёртывание на российской облачной платформе
- **[Reg.ru](./deploy-regru.md)** — развёртывание на хостинге Reg.ru (VPS и Shared)

## Быстрые ссылки

### Деплой

| Платформа | Тип | Сложность |
|-----------|-----|-----------|
| Amvera | Cloud/PaaS | ⭐ Легко |
| Reg.ru VPS | VPS | ⭐⭐⭐ Средне |
| Reg.ru Shared | Shared | ⭐⭐ Очень легко |
| Vercel | Cloud/PaaS | ⭐ Легко |
| Netlify | Cloud/PaaS | ⭐ Легко |

### Команды проекта

```bash
bun run dev          # Запуск в режиме разработки
bun run build        # Сборка для продакшена
bun run start        # Запуск продакшен сборки
bun run lint         # Проверка кода
bun run test         # Запуск тестов
```

### Структура

```
book-revelation_3D/
├── src/
│   ├── app/              # Next.js приложение
│   ├── components/       # React компоненты
│   ├── hooks/            # Custom хуки
│   ├── lib/              # Утилиты и текстуры
│   ├── data/             # Данные (цитаты)
│   └── types/            # TypeScript типы
├── docs/                 # Документация
├── public/               # Статичные файлы
└── out/                  # Продакшен сборка
```
