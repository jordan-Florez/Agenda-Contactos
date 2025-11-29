pipeline {
    // Usamos 'agent any' y controlamos Docker manualmente en los pasos 'sh'
    agent any

    environment {
        // Asegúrate de que este ID de credencial exista en Jenkins
        CODECOV_TOKEN = credentials('codecov-token-id')
        // Nombre para la imagen, usamos el número de build para que sea único
        IMAGE_TAG = "agenda-contactos-backend:${BUILD_NUMBER}"
        // Directorio de la aplicación donde se generan los reportes (backend/)
        APP_DIR = "backend"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Descargando código fuente...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🔨 Construyendo imagen de Docker...'
                sh "docker build -t ${IMAGE_TAG} -f ${APP_DIR}/Dockerfile ${APP_DIR}"
            }
        }

        stage('Run Tests & Generate Reports') {
            steps {
                echo '🧪 Ejecutando pruebas dentro del contenedor...'
                sh """
                    docker run --rm \
                    -v ${WORKSPACE}/${APP_DIR}:/app \
                    -w /app \
                    ${IMAGE_TAG} \
                    /bin/bash -c "pytest --cov=. --cov-report=xml:coverage.xml --junitxml=results.xml"
                """
            }
        }

        stage('Upload Coverage') {
            steps {
                echo '📈 Subiendo cobertura a Codecov...'
                sh "codecov -t $CODECOV_TOKEN -f ${APP_DIR}/coverage.xml"
            }
        }
    }
    
    post {
        always {
            echo '📄 Archivando resultados de tests...'
            // JUnit requiere ejecutarse dentro de un agente
            junit "${APP_DIR}/results.xml"

            echo '🧹 Limpiando imagen de Docker...'
            // Eliminar la imagen requiere el contexto del host
            sh "docker rmi ${IMAGE_TAG} || true"
        }
        success {
            echo '✅ Pipeline finalizó correctamente.'
        }
        failure {
            echo '❌ Pipeline falló. Revisar logs de tests y cobertura.'
        }
    }
}