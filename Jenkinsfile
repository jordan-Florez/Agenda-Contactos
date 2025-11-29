pipeline {
    agent any

    environment {
        CODECOV_TOKEN = credentials('CODECOV_TOKEN')
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Clean Up') {
            steps {
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
                        python3 -m venv backend/venv
                        . backend/venv/bin/activate
                        pip install --upgrade pip
                        pip install -r backend/requirements.txt
                        cd backend
                        pytest --cov=. --cov-report=xml
                    '''
                    sh 'codecov -t $CODECOV_TOKEN -f backend/coverage.xml'
                }
            }
        }
    }

    post {
        always {
            sh 'docker-compose -p agenda-contactos down'
        }

        success {
            echo 'Pipeline finalizado correctamente ✅'
        }

        failure {
            echo 'Pipeline falló ❌'
        }
    }
}
