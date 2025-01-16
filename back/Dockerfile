FROM python:3.13-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем requirements.txt и устанавливаем зависимости
COPY req.txt .
RUN pip install --no-cache-dir -r req.txt
RUN apt-get update && apt-get install -y curl

# Копируем весь проект
COPY . .

# Команда для запуска FastAPI с uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
