pipeline {
    agent any

    environment {
        // Variables de Entorno que necesitan persistir y ser seguras
        CODECOV_TOKEN = credentials('codecov-token-id')
        // APP_DIR no se toca, pero será referenciada como ${env.APP_DIR} en el post
        APP_DIR = "backend"
    }

    // Definimos una variable Groovy local antes de los stages.
    // Usaremos esta para la limpieza en el post de forma segura.
    // Esto es un 'hack' para evadir la restricción del Sandbox.
    libraries {
        // Esta sección es puramente para definir variables que Groovy pueda ver fácilmente
    }
    
    // Nueva variable de Groovy que se define de forma segura
    def IMAGE_TAG_VAR = "agenda-contactos-backend:${env.BUILD_NUMBER}"


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
                // Usamos la variable local de Groovy para el TAG
                sh "docker build -t ${IMAGE_TAG_VAR} -f ${env.APP_DIR}/Dockerfile ${env.APP_DIR}"
            }
        }

        stage('Run Tests & Generate Reports') {
            steps {
                echo '🧪 Ejecutando pruebas dentro del contenedor...'
                sh """
                    docker run --rm \
                    # Referenciamos con env.APP_DIR
                    -v ${WORKSPACE}/${env.APP_DIR}:/app \
                    -w /app \
                    # Usamos la variable local de Groovy para el TAG
                    ${IMAGE_TAG_VAR} \
                    /bin/bash -c "pytest --cov=. --cov-report=xml:coverage.xml --junitxml=results.xml"
                """
            }
        }

        stage('Upload Coverage') {
            steps {
                echo '📈 Subiendo cobertura a Codecov...'
                // Referenciamos con env.APP_DIR
                sh "codecov -t ${env.CODECOV_TOKEN} -f ${env.APP_DIR}/coverage.xml"
            }
        }
    }

    post {
        always {
            script { // Aseguramos el contexto de Groovy
                echo '📄 Archivando resultados de tests...'
                // ¡AQUÍ ESTÁ LA CLAVE! Usamos env.APP_DIR para asegurar la visibilidad.
                junit "${env.APP_DIR}/results.xml" 

                echo '🧹 Limpiando imagen de Docker...'
                // Usamos la variable local de Groovy que definimos al inicio.
                sh "docker rmi ${IMAGE_TAG_VAR} || true" 
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