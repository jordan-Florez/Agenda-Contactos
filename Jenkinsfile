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

        stage('Run Backend Tests & Codecov') {
            steps {
                script {
                    sh '''
                    bash -c "
                    source backend/venv/bin/activate
                    cd backend
                    pip install -r requirements.txt
                    pytest --cov=. --cov-report=xml
                    "
                    '''

                    withCredentials([string(credentialsId: 'CODECOV_TOKEN', variable: 'CODECOV_TOKEN')]) {
                        sh "bash -c 'codecov -t \$CODECOV_TOKEN -f backend/coverage.xml'"
                    }
                }
            }
        }

        stage('Up Services') {
            steps {
                sh 'docker-compose -p agenda-contactos up -d'
            }
        }
    }
}
