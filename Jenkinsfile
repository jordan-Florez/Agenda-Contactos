pipeline {
    agent any

    environment {
        // Variables de Entorno que necesitan persistir
        CODECOV_TOKEN = credentials('codecov-token-id')
        APP_DIR = "backend"
        
        // La variable IMAGE_TAG se define aquí, como debe ser.
        IMAGE_TAG = "agenda-contactos-backend:${env.BUILD_NUMBER}"
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
                // Usamos ${env.APP_DIR} y ${env.IMAGE_TAG}
                sh "docker build -t ${env.IMAGE_TAG} -f ${env.APP_DIR}/Dockerfile ${env.APP_DIR}"
            }
        }

        stage('Run Tests & Generate Reports') {
            steps {
                echo '🧪 Ejecutando pruebas dentro del contenedor...'
                sh """
                    docker run --rm \
                    # Usamos ${env.APP_DIR} y ${env.IMAGE_TAG}
                    -v ${WORKSPACE}/${env.APP_DIR}:/app \
                    -w /app \
                    ${env.IMAGE_TAG} \
                    /bin/bash -c "pytest --cov=. --cov-report=xml:coverage.xml --junitxml=results.xml"
                """
            }
        }

        stage('Upload Coverage') {
            steps {
                echo '📈 Subiendo cobertura a Codecov...'
                // Usamos ${env.CODECOV_TOKEN} y ${env.APP_DIR}
                sh "codecov -t ${env.CODECOV_TOKEN} -f ${env.APP_DIR}/coverage.xml"
            }
        }
    }

    // El bloque post es donde tuvimos el problema de visibilidad.
    post {
        always {
            script { // Usamos script para asegurar que Groovy procese la sintaxis
                echo '📄 Archivando resultados de tests...'
                // Usamos ${env.APP_DIR} de forma segura.
                junit "${env.APP_DIR}/results.xml" 

                echo '🧹 Limpiando imagen de Docker...'
                // Usamos ${env.IMAGE_TAG} de forma segura.
                sh "docker rmi ${env.IMAGE_TAG} || true" 
            }
        }
        success {
            echo '✅ Pipeline finalizó correctamente.'
        }
        failure {
            echo '❌ Pipeline falló. Revisar logs de tests y cobertura.'
        }
    }
}