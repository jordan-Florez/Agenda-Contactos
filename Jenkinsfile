pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Clean Up') {
            steps {
                sh 'docker rm -f agenda_backend || true'
                sh 'docker rm -f agenda_frontend || true'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose -p agenda-contactos up --build -d'
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
                    // Crear el venv y ejecutar pruebas con cobertura
                    sh """
                        python3 -m venv backend/venv
                        source backend/venv/bin/activate
                        pip install --upgrade pip
                        pip install -r backend/requirements.txt
                        cd backend
                        pytest --cov=. --cov-report=xml
                    """

                    // Subir resultados a Codecov usando el token
                    withCredentials([string(credentialsId: 'CODECOV_TOKEN', variable: 'CODECOV_TOKEN')]) {
                        sh "codecov -t \$CODECOV_TOKEN -f backend/coverage.xml"
                    }
                }
            }
        }
    }
}
