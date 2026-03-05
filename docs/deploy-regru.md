# Развёртывание на Reg.ru

## Требования

- Аккаунт на [Reg.ru](https://www.reg.ru/)
- Хостинг с поддержкой Node.js или VPS
- Домен (опционально)

## Вариант 1: VPS хостинг

### 1. Подготовка сервера

Подключитесь к серверу по SSH:

```bash
ssh root@ваш-ip-адрес
```

Установите Node.js и Bun:

```bash
# Обновление пакетов
apt update && apt upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установка Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Установка PM2 для управления процессом
npm install -g pm2
```

### 2. Загрузка проекта

```bash
# Клонирование репозитория
git clone https://github.com/ваш-username/book-revelation_3D.git
cd book-revelation_3D

# Установка зависимостей
bun install

# Сборка проекта
bun run build
```

### 3. Настройка PM2

Создайте файл `ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [{
    name: 'stoic-book-3d',
    script: 'npx',
    args: 'serve out -p 3000',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 4. Запуск приложения

```bash
# Создание директории для логов
mkdir -p logs

# Запуск через PM2
pm2 start ecosystem.config.cjs

# Сохранение конфигурации PM2
pm2 save

# Автозапуск PM2 при загрузке системы
pm2 startup
# Выполните команду, которую выведет pm2 startup
```

### 5. Настройка Nginx

Установите Nginx:

```bash
apt install -y nginx
```

Создайте конфигурацию сайта `/etc/nginx/sites-available/stoic-book-3d`:

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";
}
```

Активируйте сайт:

```bash
ln -s /etc/nginx/sites-available/stoic-book-3d /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. Настройка SSL (Let's Encrypt)

```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx

# Получение сертификата
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Автоматическое обновление сертификатов
systemctl enable certbot.timer
systemctl start certbot.timer
```

## Вариант 2: Shared хостинг

### 1. Подготовка

На shared хостинге запустите сборку локально:

```bash
# Локальная сборка
bun run build

# Проверка локально
npx serve out
```

### 2. Загрузка файлов

Подключитесь по FTP/SFTP и загрузите содержимое папки `out/` в корень сайта (`public_html/` или `www/`).

### 3. Настройка .htaccess

Создайте файл `.htaccess` в корне сайта:

```apache
RewriteEngine On

# Перенаправление на HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Кэширование статики
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# Gzip сжатие
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json application/xml
</IfModule>

# Защита от clickjacking
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"

# SPA роутинг
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]
</IfModule>
```

## Обновление проекта

### VPS

```bash
# На сервере
cd /path/to/book-revelation_3D
git pull origin dev
bun install
bun run build
pm2 restart stoic-book-3d
pm2 logs stoic-book-3d
```

### Shared хостинг

```bash
# Локально
git pull origin dev
bun install
bun run build

# Загрузите обновлённую папку out/ через FTP
```

## Мониторинг

### VPS с PM2

```bash
pm2 status              # Статус приложений
pm2 logs stoic-book-3d  # Логи приложения
pm2 monit               # Интерактивный мониторинг
pm2 describe stoic-book-3d  # Детальная информация
```

### Проверка доступности

Настройте мониторинг через Reg.ru Panel или используйте внешние сервисы:
- UptimeRobot
- Pingdom
- Reg.ru Мониторинг

## Оптимизация для Reg.ru

### VPS

- Проект работает как статика через `npx serve`
- Nginx кэширует статику на 1 год
- Gzip сжатие включено
- 3D-компоненты загружаются лениво

### Shared хостинг

- Все ассеты кэшируются через `.htaccess`
- Включено Gzip сжатие
- HTTPS перенаправление

## Troubleshooting

### Ошибка 502 Bad Gateway

```bash
# Проверка статуса PM2
pm2 status

# Проверка логов
pm2 logs stoic-book-3d

# Перезапуск приложения
pm2 restart stoic-book-3d
```

### Ошибка SSL

```bash
# Обновление сертификата
certbot renew --force-renewal

# Проверка конфигурации Nginx
nginx -t
systemctl restart nginx
```

### Медленная загрузка

1. Проверьте кэширование в браузере
2. Включите Gzip в Nginx/.htaccess
3. Используйте CDN для статики (Cloudflare)

## Полезные команды

```bash
# VPS
pm2 list                    # Список приложений
pm2 restart all             # Перезапуск всех приложений
pm2 stop all                # Остановка всех приложений
pm2 delete all              # Удаление всех приложений
systemctl status nginx      # Статус Nginx
systemctl restart nginx     # Перезапуск Nginx
df -h                       # Свободное место
free -h                     # Использование памяти
```

## Ссылки

- [Reg.ru Хостинг](https://www.reg.ru/hosting/)
- [Reg.ru VPS](https://www.reg.ru/vps/)
- [Документация PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx документация](https://nginx.org/en/docs/)
