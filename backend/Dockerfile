# Usa Python 3.11 slim como imagen base para reducir el tamaño
FROM python:3.11-slim

# Instala dependencias del sistema necesarias (como git para ciertas dependencias o herramientas)
# Usamos 'trixie' para que la búsqueda sea explícita en el repo de Debian
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Crea y establece el directorio de trabajo
WORKDIR /app

# Copia todo el contenido del contexto al directorio /app
COPY . /app

# INSTALACIÓN CORREGIDA: Añadimos 'pytest-cov'
RUN pip install --no-cache-dir fastapi uvicorn pytest pytest-cov codecov httpx

# Puerto de la aplicación (opcional, pero buena práctica)
EXPOSE 8000

# Comando para correr la aplicación (será ignorado por Jenkins durante los tests, 
# pero es útil para correr la imagen directamente en producción)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]