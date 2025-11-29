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

#ENTRYPOINT para CI
# Este comando simplemente espera un comando de Jenkins y lo ejecuta, 
# asegurando que el contenedor no se detenga inmediatamente.
ENTRYPOINT ["/bin/bash", "-c"]

# Comando por defecto (CMD) se mantiene, pero será ignorado por el Jenkins Pipeline
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]