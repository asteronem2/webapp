# Стадия сборки
FROM node:alpine as nodebuild

# Устанавливаем рабочую директорию
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Копируем package.json и устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm install

# Копируем исходный код и собираем проект
COPY . .
RUN npm run build

# Стадия для Nginx
FROM nginx:alpine

# Копируем собранный проект из предыдущей стадии
COPY --from=nodebuild /usr/src/app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
