# 📇 Agenda de Contactos

[![codecov](https://codecov.io/gh/jordan-Florez/Agenda-Contactos/graph/badge.svg?token=P92H2W44UO)](https://codecov.io/gh/jordan-Florez/Agenda-Contactos)

Una aplicación web moderna para gestionar contactos con backend en **FastAPI** y frontend en **HTML/CSS/JavaScript**, desplegada con **Docker** y CI/CD con **Jenkins**.

---

## 🚀 Características

- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar contactos
- ✅ **API RESTful**: Backend con FastAPI y documentación automática
- ✅ **Base de Datos**: SQLite 
- ✅ **Containerización**: Docker y Docker Compose
- ✅ **CI/CD**: Pipeline automatizado con Jenkins
- ✅ **Cobertura de Código**: Test con pytest y codecov
- ✅ **Interfaz Moderna**: Frontend responsivo

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **FastAPI** - Framework web moderno y rápido
- **SQLite** - Base de datos ligera
- **Pytest** - Framework de testing
- **Coverage.py** - Análisis de cobertura

### Frontend
- **HTML5/CSS3** - Estructura y estilos
- **JavaScript (ES6+)** - Lógica del cliente
- **Nginx** - Servidor web

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación
- **Jenkins** - CI/CD Pipeline
- **Codecov** - Análisis de cobertura

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose instalados
- Git

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/jordan-Florez/Agenda-Contactos.git
cd Agenda-Contactos

# Levantar los servicios
docker-compose up -d

# Acceder a la aplicación
# Frontend: http://localhost
# Backend API: http://localhost:8000
# Documentación API: http://localhost:8000/docs
```

---

## 🧪 Ejecutar Pruebas

```bash
# Ejecutar pruebas con cobertura
docker-compose exec backend pytest --cov=. --cov-report=term

# Ver reporte detallado
docker-compose exec backend pytest --cov=. --cov-report=html
```

---

## 📁 Estructura del Proyecto

```
Agenda-Contactos/
├── backend/
│   ├── main.py              # API FastAPI
│   ├── init_db.py           # Inicialización de BD
│   ├── requirements.txt     # Dependencias Python
│   ├── Dockerfile           # Imagen Docker del backend
│   └── tests/
│       └── test_main.py     # Tests unitarios
├── frontend/
│   ├── index.html           # Página principal
│   ├── app.js               # Lógica del cliente
│   ├── styles.css           # Estilos
│   └── Dockerfile           # Imagen Docker del frontend
├── docker-compose.yml       # Orquestación de servicios
├── Jenkinsfile              # Pipeline CI/CD
└── README.md                # Este archivo
```

---

## 🔄 Pipeline CI/CD

El proyecto incluye un pipeline automatizado con Jenkins que:

1. ✅ Descarga el código del repositorio
2. ✅ Limpia contenedores previos
3. ✅ Construye las imágenes Docker
4. ✅ Ejecuta las pruebas unitarias
5. ✅ Genera reporte de cobertura
6. ✅ Sube la cobertura a Codecov
7. ✅ Despliega los servicios

---

## 📝 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Mensaje de bienvenida |
| GET | `/contactos` | Listar todos los contactos |
| GET | `/contactos/{id}` | Obtener un contacto específico |
| POST | `/contactos` | Crear un nuevo contacto |
| PUT | `/contactos/{id}` | Actualizar un contacto |
| DELETE | `/contactos/{id}` | Eliminar un contacto |

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 🙏 Agradecimientos

- FastAPI por el excelente framework
- Docker por simplificar el despliegue
- Jenkins por la automatización CI/CD
- Codecov por el análisis de cobertura