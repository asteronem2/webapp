# Используем официальный образ Node.js
FROM node:18-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект
COPY . .

# Команда для запуска dev-сервера Vite
CMD ["npm", "run", "dev"]
