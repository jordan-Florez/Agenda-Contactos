pipeline {
    agent any

    environment {
        // Variables de Entorno
        CODECOV_TOKEN = credentials('codecov-token-id')
        APP_DIR = "backend"
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
                sh "docker build -t ${env.IMAGE_TAG} -f ${env.APP_DIR}/Dockerfile ${env.APP_DIR}"
            }
        }

        stage('Run Tests & Generate Reports') {
            steps {
                echo '🧪 Ejecutando pruebas dentro del contenedor...'
                
                // 1. Comando docker run que ahora funciona gracias a 'pytest-cov'
                sh """
                    docker run --rm \
                    -v ${WORKSPACE}/${env.APP_DIR}:/app \
                    -w /app \
                    ${env.IMAGE_TAG} \
                    /bin/bash -c "pytest --cov=. --cov-report=xml:coverage.xml --junitxml=results.xml"
                """
                
                // 2. Comprobación obligatoria: Si el archivo no existe, la etapa FALLA aquí.
                sh "test -f ${env.APP_DIR}/results.xml"
                echo "✅ results.xml y coverage.xml fueron generados con éxito."
            }
        }

        stage('Upload Coverage') {
            steps {
                echo '📈 Subiendo cobertura a Codecov...'
                sh "codecov -t ${env.CODECOV_TOKEN} -f ${env.APP_DIR}/coverage.xml"
            }
        }
    }

    post {
        always {
            // El bloque 'post' necesita un contexto de 'node' para usar 'junit' o 'sh'
            script {
                echo '📄 Archivando resultados de tests...'
                
                // SOLUCIÓN FINAL: junit dentro del contexto node
                node {
                    junit "${env.APP_DIR}/results.xml"
                }

                echo '🧹 Limpiando imagen de Docker...'
                // sh dentro del contexto node para asegurar la ejecución
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