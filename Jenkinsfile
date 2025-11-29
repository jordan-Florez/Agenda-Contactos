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
                    // Activar el venv y ejecutar pytest con cobertura
                    sh '''
                        . backend/venv/bin/activate
                        cd backend
                        pip install -r requirements.txt
                        pytest --cov=. --cov-report=xml
                    '''

                    // Subir resultados a Codecov usando el token
                    withCredentials([string(credentialsId: 'CODECOV_TOKEN', variable: 'CODECOV_TOKEN')]) {
                        sh '. backend/venv/bin/activate && bash -c "codecov -t $CODECOV_TOKEN -f coverage.xml"'
                    }
                }
            }
        }
    }
}
