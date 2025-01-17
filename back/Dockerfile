FROM python:3.13-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем requirements.txt и устанавливаем зависимости
COPY req.txt .
RUN pip install --no-cache-dir -r req.txt

# Declare ARGs for build-time variables
ARG DB_USER
ARG DB_NAME
ARG DB_HOST
ARG DB_PASS


# Копируем весь проект
COPY . .

RUN apt-get update && apt-get install -y postgresql-client
RUN PGPASSWORD=${DB_PASS} psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -c "DROP TABLE IF EXISTS alembic_version;"
RUN alembic stamp head
RUN alembic revision --autogenerate -m "new_revision"
RUN alembic upgrade head
RUN alembic stamp head

# Команда для запуска FastAPI с uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
