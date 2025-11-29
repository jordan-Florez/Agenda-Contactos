pipeline {
    agent any

    environment {
        // Token de Codecov almacenado en Jenkins
        CODECOV_TOKEN = credentials('codecov-token-id')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'pip install -r requirements.txt'
            }
        }

        stage('Run Tests') {
            steps {
                // Ejecutar tests y generar XML para junit
                sh 'pytest --junitxml=results.xml'
            }
        }

        stage('Upload coverage') {
            steps {
                // Subir cobertura a Codecov
                sh 'codecov -t $CODECOV_TOKEN -f results.xml'
            }
        }
    }

    post {
        always {
            echo 'Archivando resultados de tests...'
            junit '**/results.xml'
        }
        success {
            echo 'Pipeline finalizó correctamente.'
        }
        failure {
            echo 'Pipeline falló.'
        }
    }
}