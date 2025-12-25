# Speech Analyzer Frontend

Frontend-приложение для аналитики диалогов и метрик сотрудников.

## Технический стек

- **Vue 3**
- **Vite** (dev-server по умолчанию: `http://localhost:3000`)
- **Pinia**
- **Vue Router**
- **Element Plus**
- **TailwindCSS** (+ SCSS ассеты)
- **Vue I18n** (русский)

## Требования

- **Node.js**: рекомендуется **22 LTS**
- **npm**: 9+

## Переменные окружения

Проект использует `import.meta.env`, поэтому переменные окружения **вшиваются на этапе сборки**.

- `VITE_API_BASE_URL`
  - Базовый URL для axios (`src/api/api.js`)
  - По умолчанию: `/` (удобно, если фронт и API живут на одном домене и API доступно по относительным путям)
- `VITE_API_PROXY_TARGET`
  - Используется **только в dev-режиме** как target для Vite proxy
  - По умолчанию: `http://localhost:8000`

Пример `.env` (создайте в корне проекта при необходимости):

```env
VITE_API_BASE_URL=https://api.example.com
VITE_API_PROXY_TARGET=http://localhost:8000
```

Важно про авторизацию:
- Axios настроен с `withCredentials: true`, поэтому при использовании cookie-сессий настройте **CORS + credentials** на backend и доменную схему так, чтобы браузер принимал куки.

## Установка и запуск (локально)

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

Результат сборки — директория `dist/`.

Локальный предпросмотр сборки:

```bash
npm run preview
```

## Структура проекта

```
src/
├── api/           # API клиенты (axios instance и эндпойнты)
├── assets/        # стили/иконки
├── components/    # Vue компоненты
├── composables/   # composables
├── i18n/          # локализация
├── layouts/       # layout-компоненты
├── middleware/    # middleware (router-guards и т.п.)
├── plugins/       # плагины (например chart.js)
├── router/        # маршрутизация
├── store/         # Pinia stores
├── types/         # типы/константы
├── utils/         # утилиты
└── views/         # страницы приложения
```

## Разворачивание на сервере Ubuntu (Nginx)

Ниже — вариант деплоя как **статического SPA**: собираем фронт (`dist/`) и раздаём через **Nginx**.

### 1) Подготовка сервера

```bash
sudo apt update
sudo apt install -y nginx git
```

Node.js (рекомендуется 20 LTS). Пример через NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### 2) Сборка проекта на сервере

```bash
sudo mkdir -p /var/www/speech-analyzer-frontend
sudo chown -R $USER:$USER /var/www/speech-analyzer-frontend

cd /var/www/speech-analyzer-frontend
git clone <ВАШ_REPO_URL> .

npm ci
```

Если нужно указать API для продакшена (переменная **вшивается в сборку**):

```bash
export VITE_API_BASE_URL="https://api.example.com"
npm run build
```

После сборки файлы будут в `/var/www/speech-analyzer-frontend/dist`.

### 3) Конфигурация Nginx

Описание настройки смотреть в репозитории с backend'ом 

### 4) Обновление приложения (pull + build)

```bash
cd /var/www/speech-analyzer-frontend
git pull
npm ci
export VITE_API_BASE_URL="https://api.example.com"
npm run build
sudo systemctl reload nginx
```
### 5) CI/CD

В репозитории присутствует файл deploy.yml для автоматизации процессов CI/CD. Требуется настройка секретов github.