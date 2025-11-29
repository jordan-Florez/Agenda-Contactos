pipeline {
    // Agente global, lo que obliga a usar 'node {}' en el post
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
                // Si la construcción falla (ej: error en Dockerfile), el pipeline se detendrá aquí
                sh "docker build -t ${env.IMAGE_TAG} -f ${env.APP_DIR}/Dockerfile ${env.APP_DIR}"
            }
        }

        stage('Run Tests & Generate Reports') {
            steps {
                echo '🧪 Ejecutando pruebas dentro del contenedor...'
                
                // Ejecución de Pytest: genera results.xml y coverage.xml
                sh """
                    docker run --rm \
                    -v ${WORKSPACE}/${env.APP_DIR}:/app \
                    -w /app \
                    ${env.IMAGE_TAG} \
                    /bin/bash -c "pytest --cov=. --cov-report=xml:coverage.xml --junitxml=results.xml"
                """
                
                // Comprobación de existencia: Si el archivo no existe (por un fallo en pytest), la etapa fallará AHORA.
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

    // Bloque post para limpiar y archivar, resolviendo problemas de contexto
    post {
        always {
            script {
                echo '📄 Archivando resultados de tests...'
                
                // SOLUCIÓN FINAL CONTEXTO: junit debe estar dentro de un bloque 'node'
                node {
                    junit "${env.APP_DIR}/results.xml"
                }

                echo '🧹 Limpiando imagen de Docker...'
                // sh también necesita contexto 'node' si está en el post con agent any
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