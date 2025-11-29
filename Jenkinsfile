pipeline {
    // Usamos 'agent any'
    agent any 

    environment {
        // Mantenemos SOLO el token de credenciales aquí
        CODECOV_TOKEN = credentials('codecov-token-id')
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
                // Usamos la variable de ambiente BUILD_NUMBER directamente en sh
                sh "docker build -t agenda-contactos-backend:${env.BUILD_NUMBER} -f backend/Dockerfile backend"
            }
        }

        stage('Run Tests & Generate Reports') {
            steps {
                echo '🧪 Ejecutando pruebas dentro del contenedor...'
                
                // Definición de variables locales de Groovy para usar en este stage
                def APP_DIR = "backend"
                def IMAGE_TAG = "agenda-contactos-backend:${env.BUILD_NUMBER}"
                
                // Ejecución de Pytest, usando las variables locales
                sh """
                    docker run --rm \
                    -v ${WORKSPACE}/${APP_DIR}:/app \
                    -w /app \
                    ${IMAGE_TAG} \
                    /bin/bash -c "pytest --cov=. --cov-report=xml:coverage.xml --junitxml=results.xml"
                """
                
                // Comprobación de existencia (fallo inmediato si no se genera el archivo)
                sh "test -f ${APP_DIR}/results.xml"
                echo "✅ results.xml y coverage.xml fueron generados con éxito."
            }
        }

        stage('Upload Coverage') {
            steps {
                echo '📈 Subiendo cobertura a Codecov...'
                // Usamos la ruta fija para evitar problemas de variables
                sh "codecov -t ${env.CODECOV_TOKEN} -f backend/coverage.xml"
            }
        }
    }

    post {
        always {
            // El bloque 'post' necesita un contexto de 'node' para usar 'junit' y 'sh'
            script {
                echo '📄 Archivando resultados de tests...'
                
                node {
                    // Usamos la ruta fija
                    junit "backend/results.xml"
                }

                echo '🧹 Limpiando imagen de Docker...'
                
                // Definimos IMAGE_TAG aquí, asegurándonos de que esté disponible
                def IMAGE_TAG = "agenda-contactos-backend:${env.BUILD_NUMBER}"

                node { 
                    sh "docker rmi ${IMAGE_TAG} || true" 
                }
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