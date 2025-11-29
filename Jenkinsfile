pipeline {
    agent any

    environment {
        CODECOV_TOKEN = credentials('codecov-token')
        PYTHONPATH = "."
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

        stage('Run Backend Tests & Coverage') {
            steps {
                dir('backend') {
                    sh '''
                    python3 -m venv venv
                    . venv/bin/activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                    PYTHONPATH=$PYTHONPATH pytest --cov=backend --cov-report=xml
                    '''
                }
                // Subir reporte a Codecov
                sh '''
                bash <(curl -s https://codecov.io/bash) -t $CODECOV_TOKEN
                '''
            }
        }
    }

    post {
        always {
            sh '''
            docker-compose -p agenda-contactos down
            rm -rf backend/venv .pytest_cache __pycache__ .coverage
            '''
        }

        success {
            echo 'Pipeline ejecutado con éxito ✅'
        }

        failure {
            echo 'Pipeline falló ❌'
        }
    }
}
