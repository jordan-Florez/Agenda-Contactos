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
                sh 'docker-compose build'
            }
        }
        stage('Up Services') {
            steps {
                sh 'docker-compose up -d'
            }
        }
        // Código para futuramente correr los test
        // stage('Run Tests') {
        //     steps {
        //         sh 'docker-compose exec backend pytest'
        //     }
        // }
        stage('Down Services') {
            steps {
                sh 'docker-compose down'
            }
        }
    }
}
