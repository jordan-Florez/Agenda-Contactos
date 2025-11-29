pipeline {
    agent any

    environment {
        // Token de Codecov, almacenado como credencial en Jenkins
        CODECOV_TOKEN = credentials('CODECOV_TOKEN')
    }

    stages {

        stage('Checkout SCM') {
            steps {
                // Obtener código del repositorio
                checkout scm
            }
        }

        stage('Clean Up') {
            steps {
                // Eliminar contenedores existentes si existen
                sh '''
                    docker rm -f agenda_backend || true
                    docker rm -f agenda_frontend || true
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose -p agenda-contactos build'
            }
        }

        stage('Up Services') {
            steps {
                sh 'docker-compose -p agenda-contactos up -d'
            }
        }

        stage('Run Backend Tests & Codecov') {
            steps {
                script {
                    sh '''
                        # Crear y activar virtualenv en un solo bloque
                        python3 -m venv backend/venv
                        # Activar el venv usando "." compatible con sh
                        . backend/venv/bin/activate
                        
                        # Actualizar pip y instalar dependencias
                        pip install --upgrade pip
                        if [ -f backend/requirements.txt ]; then
                            pip install -r backend/requirements.txt
                        else
                            pip install fastapi uvicorn pytest pytest-cov
                        fi

                        # Ejecutar pruebas y generar reporte de cobertura
                        cd backend
                        pytest --cov=. --cov-report=xml
                    '''

                    // Subir reporte a Codecov
                    sh 'codecov -t $CODECOV_TOKEN -f backend/coverage.xml'
                }
            }
        }
    }

    post {
        always {
            // Asegurarse de limpiar los contenedores al final del pipeline
            sh '''
                docker-compose -p agenda-contactos down
            '''
        }

        success {
            echo 'Pipeline finalizado correctamente ✅'
        }

        failure {
            echo 'Pipeline falló ❌'
        }
    }
}
