pipeline {
    agent any
    
    environment {
        COMPOSE_PROJECT_NAME = 'agenda-contactos'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Descargando código del repositorio...'
                checkout scm
            }
        }
        
        stage('Clean Up Previous Containers') {
            steps {
                echo '🧹 Limpiando contenedores y volúmenes previos...'
                sh '''
                    docker-compose -p ${COMPOSE_PROJECT_NAME} down --volumes --remove-orphans || true
                    docker rm -f agenda_backend agenda_frontend || true
                '''
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '🏗️ Construyendo imágenes Docker...'
                sh 'docker-compose -p ${COMPOSE_PROJECT_NAME} build'
            }
        }
        
        stage('Run Tests with Coverage') {
            steps {
                echo '🧪 Ejecutando pruebas con cobertura...'
                sh '''
                    # Iniciar el contenedor backend en modo detached
                    docker-compose -p ${COMPOSE_PROJECT_NAME} up -d backend
                    
                    # Esperar a que el contenedor esté listo
                    sleep 5
                    
                    # Ejecutar pytest con cobertura dentro del contenedor
                    docker-compose -p ${COMPOSE_PROJECT_NAME} exec -T backend pytest \
                        --cov=. \
                        --cov-report=xml:coverage.xml \
                        --cov-report=term \
                        --junitxml=results.xml \
                        tests/
                    
                    # Copiar el archivo de cobertura al workspace de Jenkins
                    docker cp agenda_backend:/app/coverage.xml ./coverage.xml
                '''
            }
        }
        
        stage('Upload Coverage to Codecov') {
            steps {
                echo '📊 Subiendo cobertura a Codecov...'
                withCredentials([string(credentialsId: 'CODECOV_TOKEN', variable: 'CODECOV_TOKEN')]) {
                    sh '''
                        # Descargar el uploader de Codecov si no existe
                        if [ ! -f codecov ]; then
                            curl -Os https://cli.codecov.io/latest/linux/codecov
                            chmod +x codecov
                        fi
                        
                        # Subir reporte de cobertura
                        ./codecov upload-process \
                            --fail-on-error \
                            -t ${CODECOV_TOKEN} \
                            -f ./coverage.xml \
                            --plugin pycoverage \
                            --name "Jenkins Build #${BUILD_NUMBER}"
                    '''
                }
            }
        }
        
        stage('Deploy Services') {
            steps {
                echo '🚀 Desplegando servicios...'
                sh '''
                    # Levantar todos los servicios (backend ya está corriendo)
                    docker-compose -p ${COMPOSE_PROJECT_NAME} up -d
                    
                    # Verificar que los servicios estén corriendo
                    docker-compose -p ${COMPOSE_PROJECT_NAME} ps
                '''
            }
        }
    }
    
    post {
        always {
            echo '📋 Publicando resultados de las pruebas...'
            junit 'results.xml'
        }
        success {
            echo '✅ Pipeline completado exitosamente!'
            echo '🌐 Frontend disponible en: http://localhost'
            echo '🔧 Backend disponible en: http://localhost:8000'
        }
        failure {
            echo '❌ Pipeline falló. Revisando logs...'
            sh 'docker-compose -p ${COMPOSE_PROJECT_NAME} logs backend'
        }
        cleanup {
            echo '🧹 Limpieza final (opcional)...'
            // Descomentar si quieres limpiar después de cada build
            // sh 'docker-compose -p ${COMPOSE_PROJECT_NAME} down'
        }
    }
}