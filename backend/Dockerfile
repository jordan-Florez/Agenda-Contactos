# Dockerfile para el backend
FROM python:3.11-slim

WORKDIR /app
COPY . /app

# Dependencias principales
RUN pip install --no-cache-dir fastapi uvicorn

# Dependencias para tests
RUN pip install --no-cache-dir pytest codecov httpx

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
