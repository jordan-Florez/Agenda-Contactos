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
                script {
                    // Construimos la imagen, usando el contexto de la carpeta 'backend'
                    sh "docker build -t ${IMAGE_TAG} -f ${APP_DIR}/Dockerfile ${APP_DIR}"
                }
            }
        }

        stage('Run Tests & Generate Reports') {
            steps {
                echo '🧪 Ejecutando pruebas dentro del contenedor...'
                script {
                    // Comando crucial: Correr Docker y generar reportes.
                    sh """
                        docker run --rm \
                        # Montamos la carpeta 'backend' del Jenkins HOST en '/app' del contenedor.
                        # Esto es VITAL para que los archivos generados adentro aparezcan afuera.
                        -v ${WORKSPACE}/${APP_DIR}:/app \
                        # Establecemos el directorio de trabajo dentro del contenedor.
                        -w /app \
                        # Ejecutamos la imagen.
                        ${IMAGE_TAG} \
                        # El comando para correr pytest. Genera coverage.xml y results.xml en el volumen montado.
                        /bin/bash -c "pytest --cov=. --cov-report=xml:coverage.xml --junitxml=results.xml"
                    """
                }
            }
        }

        stage('Upload Coverage') {
            steps {
                echo '📈 Subiendo cobertura a Codecov...'
                // Codecov lee el archivo que está en el directorio montado (${WORKSPACE}/backend/coverage.xml)
                sh "codecov -t $CODECOV_TOKEN -f ${APP_DIR}/coverage.xml"
            }
        }
    }

    post {
        always {
            echo '📄 Archivando resultados de tests...'
            // JUnit lee el archivo que está en el directorio montado
            junit "${APP_DIR}/results.xml"

            echo '🧹 Limpiando imagen de Docker...'
            // Intentamos borrar la imagen para no llenar el disco del servidor
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