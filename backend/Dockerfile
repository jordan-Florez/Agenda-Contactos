# Dockerfile para el backend
FROM python:3.11-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar todo el proyecto al contenedor
COPY . /app

# Instalar dependencias principales
RUN pip install --no-cache-dir fastapi uvicorn

# Instalar herramientas para tests
RUN pip install --no-cache-dir pytest codecov

# Puerto que expondrá la aplicación
EXPOSE 8000

# Comando por defecto al iniciar el contenedor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
