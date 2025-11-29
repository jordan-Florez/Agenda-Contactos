pipeline {
    agent any

    environment {
        // Variables de Entorno
        CODECOV_TOKEN = credentials('codecov-token-id')
        APP_DIR = "backend"
        IMAGE_TAG = "agenda-contactos-backend:${env.BUILD_NUMBER}"
    }

    stages {
        // ... (Stages Checkout, Build Docker Image, Run Tests, Upload Coverage SIN CAMBIOS) ...

        stage('Checkout') {
            steps {
                echo 'Descargando código fuente...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🔨 Construyendo imagen de Docker...'
                sh "docker build -t ${env.IMAGE_TAG} -f ${env.APP_DIR}/Dockerfile ${env.APP_DIR}"
            }
        }

        stage('Run Tests & Generate Reports') {
            steps {
                echo '🧪 Ejecutando pruebas dentro del contenedor...'
                sh """
                    docker run --rm \
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
                sh "codecov -t ${env.CODECOV_TOKEN} -f ${env.APP_DIR}/coverage.xml"
            }
        }
    }

    // EL CAMBIO CRUCIAL ESTÁ AQUÍ
    post {
        always {
            // Usamos un bloque script para lógica Groovy
            script {
                echo '📄 Archivando resultados de tests...'
                
                // ¡LA SOLUCIÓN! Forzamos la ejecución de junit DENTRO de un nuevo contexto node
                node {
                    // Aquí, JUnit ve el contexto necesario (hudson.Launcher)
                    junit "${env.APP_DIR}/results.xml"
                }

                echo '🧹 Limpiando imagen de Docker...'
                // sh también requiere el contexto node/agent
                node { 
                    sh "docker rmi ${env.IMAGE_TAG} || true" 
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