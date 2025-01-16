FROM python:3.13-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем requirements.txt и устанавливаем зависимости
COPY req.txt .
RUN pip install --no-cache-dir -r req.txt

# Копируем весь проект
COPY . .

RUN apt-get update && apt-get install -y postgresql-client
RUN psql -h host.docker.internal -U ded -d webapp -c "DROP TABLE IF EXISTS alembic_version;"
RUN alembic stamp head
RUN alembic revision --autogenerate -m "new_revision"
RUN alembic upgrade head
RUN alembic stamp head

# Команда для запуска FastAPI с uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
