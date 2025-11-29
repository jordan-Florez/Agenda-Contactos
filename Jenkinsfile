pipeline {
    agent any

    environment {
        // Variable de entorno para Codecov, reemplaza 'codecov-token-id' con tu credential real en Jenkins
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
                node {
                    sh 'pip install -r requirements.txt'
                }
            }
        }

        stage('Run Tests') {
            steps {
                node {
                    // Ejecutar tests y generar archivo XML para junit
                    sh 'pytest --junitxml=results.xml'
                }
            }
        }

        stage('Upload coverage') {
            steps {
                node {
                    // Subir cobertura a Codecov
                    sh 'codecov -t $CODECOV_TOKEN -f results.xml'
                }
            }
        }
    }

    post {
        always {
            node { 
                echo 'Archivando resultados de tests...'
                junit '**/results.xml'
            }
        }
        success {
            echo 'Pipeline finalizó correctamente.'
        }
        failure {
            echo 'Pipeline falló.'
        }
    }
}
