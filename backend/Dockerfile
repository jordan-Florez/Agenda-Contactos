# Usamos Python 3.11 slim
FROM python:3.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo
WORKDIR /app

# Copiar código
COPY . /app

# Instalar dependencias de Python
RUN pip install --no-cache-dir fastapi uvicorn pytest codecov httpx

# Comando por defecto (solo para desarrollo, Jenkins ejecutará pytest con docker-compose exec)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
