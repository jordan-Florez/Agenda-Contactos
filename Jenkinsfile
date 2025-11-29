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
        // Código para futuramente correr los test
        stage('Run Tests') {
            steps {
                sh '''
                    source backend/venv/bin/activate
                    cd backend
                    pytest --maxfail=1 --disable-warnings -q
                '''
            }
        }
        //stage('Down Services') {
        //    steps {
        //        sh 'docker-compose -p agenda-contactos down'
        //    }
        //}
    }
}
