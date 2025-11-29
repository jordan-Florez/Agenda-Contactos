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
                // Usa ${env.APP_DIR} y ${env.IMAGE_TAG} de forma segura.
                sh "docker build -t ${env.IMAGE_TAG} -f ${env.APP_DIR}/Dockerfile ${env.APP_DIR}"
            }
        }

        stage('Run Tests & Check Reports') {
            steps {
                echo '🧪 Ejecutando pruebas dentro del contenedor...'
                
                // 1. Limpiamos reportes antiguos antes de correr
                sh "rm -f ${env.APP_DIR}/results.xml"
                
                // 2. Ejecutamos Pytest con las salidas configuradas
                sh """
                    docker run --rm \
                    -v ${WORKSPACE}/${env.APP_DIR}:/app \
                    -w /app \
                    ${env.IMAGE_TAG} \
                    /bin/bash -c "pytest --cov=. --cov-report=xml:coverage.xml --junitxml=results.xml"
                """
                
                // 3. Verificamos la existencia del archivo (Esto hará que la etapa falle si no se generó)
                sh "test -f ${env.APP_DIR}/results.xml"
                echo "✅ results.xml fue generado con éxito."
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
                
                // Forzamos el contexto de 'node' para JUnit
                node {
                    junit "${env.APP_DIR}/results.xml"
                }

                echo '🧹 Limpiando imagen de Docker...'
                // Forzamos el contexto de 'node' para 'sh'
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